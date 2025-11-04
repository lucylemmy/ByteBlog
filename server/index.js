import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import mongoose from 'mongoose'

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || ''
if (!MONGODB_URI) {
	console.warn('[warn] MONGODB_URI not set. Auth and posts will not persist until configured.')
} else {
	mongoose
		.connect(MONGODB_URI)
		.then(() => console.log('[db] connected'))
		.catch(err => console.error('[db] connection error', err))
}

// Schemas & Models
const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true },
	},
	{ timestamps: true }
)
userSchema.set('toJSON', {
	transform: (_, ret) => {
		ret.id = ret._id.toString()
		if (!ret.username && ret.name) {
			ret.username = ret.name
			delete ret.name
		}
		delete ret._id
		delete ret.__v
		delete ret.passwordHash
		return ret
	},
})
const User = mongoose.models.User || mongoose.model('User', userSchema)

const postSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		subtitle: { type: String, trim: true },
		content: { type: String, required: true },
		imageUrl: { type: String, default: null },
		tags: [{ type: String }],
		author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true }
)
postSchema.set('toJSON', {
	transform: (_, ret) => {
		ret.id = ret._id.toString()
		if (!ret.subtitle && ret.summary !== undefined) {
			ret.subtitle = ret.summary
			delete ret.summary
		}
		if (!ret.imageUrl && ret.coverUrl !== undefined) {
			ret.imageUrl = ret.coverUrl
			delete ret.coverUrl
		}
		delete ret._id
		delete ret.__v
		return ret
	},
})
const Post = mongoose.models.Post || mongoose.model('Post', postSchema)

// Cloudinary configuration
let CLOUDINARY_ENABLED = false
if (process.env.CLOUDINARY_URL) {
	cloudinary.config({ secure: true, url: process.env.CLOUDINARY_URL })
	CLOUDINARY_ENABLED = true
} else if (
	process.env.CLOUDINARY_CLOUD_NAME &&
	process.env.CLOUDINARY_API_KEY &&
	process.env.CLOUDINARY_API_SECRET
) {
	cloudinary.config({
		secure: true,
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	})
	CLOUDINARY_ENABLED = true
}

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
})

function signToken(user) {
	const id = user.id || user._id?.toString()
	const username = user.username || user.name
	return jwt.sign({ id, email: user.email, username }, JWT_SECRET, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
	const auth = req.headers.authorization || ''
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
	if (!token) return res.status(401).json({ error: 'Missing token' })
	try {
		const payload = jwt.verify(token, JWT_SECRET)
		req.user = payload
		next()
	} catch {
		return res.status(401).json({ error: 'Invalid token' })
	}
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/auth/signup', async (req, res) => {
	try {
		const { username, name, email, password } = req.body || {}
		const finalUsername = username || name
		if (!finalUsername || !email || !password) return res.status(400).json({ error: 'Missing fields' })
		const existing = await User.findOne({ email: String(email).toLowerCase() })
		if (existing) return res.status(409).json({ error: 'Email already registered' })
		const passwordHash = await bcrypt.hash(password, 10)
		const userDoc = await User.create({
			username: String(finalUsername),
			email: String(email).toLowerCase(),
			passwordHash,
		})
		const token = signToken(userDoc)
		return res.json({ token, user: userDoc.toJSON() })
	} catch (err) {
		return res.status(500).json({ error: 'Could not create user' })
	}
})

async function handleLogin(req, res) {
	try {
		const { email, password } = req.body || {}
		if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
		const userDoc = await User.findOne({ email: String(email).toLowerCase() })
		if (!userDoc) return res.status(401).json({ error: 'Invalid credentials' })
		const ok = await bcrypt.compare(password, userDoc.passwordHash)
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
		const token = signToken(userDoc)
		return res.json({ token, user: userDoc.toJSON() })
	} catch (err) {
		return res.status(500).json({ error: 'Login failed' })
	}
}

app.post('/api/auth/login', handleLogin)
app.post('/api/auth/signin', handleLogin)

app.post('/api/auth/logout', authMiddleware, (_req, res) => res.json({ ok: true }))

app.get('/api/auth/me', authMiddleware, async (req, res) => {
	const userDoc = await User.findById(req.user.id)
	if (!userDoc) return res.status(404).json({ error: 'User not found' })
	return res.json({ user: userDoc.toJSON() })
})

// Posts CRUD
app.get('/api/posts', async (req, res) => {
	const filter = {}
	if (req.query.tag) filter.tags = req.query.tag
	const posts = await Post.find(filter)
		.sort({ updatedAt: -1 })
		.populate('author', 'username email')
		.lean()
	const shaped = posts.map(p => ({
		id: p._id.toString(),
		title: p.title,
		subtitle: p.subtitle ?? p.summary ?? '',
		content: p.content,
		imageUrl: p.imageUrl ?? p.coverUrl ?? null,
		tags: p.tags || [],
		author: p.author
			? {
				id: p.author._id?.toString() ?? p.author.id,
				username: p.author.username,
				email: p.author.email,
			}
			: null,
		createdAt: p.createdAt,
		updatedAt: p.updatedAt,
	}))
	return res.json({ posts: shaped })
})

app.get('/api/posts/:id', async (req, res) => {
	try {
		const p = await Post.findById(req.params.id).populate('author', 'username email').lean()
		if (!p) return res.status(404).json({ error: 'Not found' })
		return res.json({
			post: {
				id: p._id.toString(),
				title: p.title,
				subtitle: p.subtitle ?? p.summary ?? '',
				content: p.content,
				imageUrl: p.imageUrl ?? p.coverUrl ?? null,
				tags: p.tags || [],
				author: p.author
					? {
						id: p.author._id?.toString() ?? p.author.id,
						username: p.author.username,
						email: p.author.email,
					}
					: null,
				createdAt: p.createdAt,
				updatedAt: p.updatedAt,
			},
		})
	} catch {
		return res.status(400).json({ error: 'Invalid id' })
	}
})

app.post('/api/posts', authMiddleware, async (req, res) => {
	try {
		const { title, subtitle, summary, content, tags, imageUrl, coverUrl } = req.body || {}
		if (!title || !content) return res.status(400).json({ error: 'Missing fields' })
		const created = await Post.create({
			title: String(title),
			subtitle: subtitle ? String(subtitle) : summary ? String(summary) : '',
			content: String(content),
			tags: Array.isArray(tags)
				? tags
				: typeof tags === 'string'
				? tags
						.split(',')
						.map(t => t.trim())
						.filter(Boolean)
				: [],
			imageUrl: imageUrl || coverUrl || null,
			author: req.user.id,
		})
		return res.status(201).json({ post: created.toJSON() })
	} catch (err) {
		return res.status(500).json({ error: 'Could not create post' })
	}
})

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ error: 'Not found' })
		if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
		const { title, subtitle, summary, content, tags, imageUrl, coverUrl } = req.body || {}
		if (title !== undefined) post.title = String(title)
		if (subtitle !== undefined || summary !== undefined)
			post.subtitle = subtitle !== undefined ? String(subtitle) : String(summary)
		if (content !== undefined) post.content = String(content)
		if (tags !== undefined)
			post.tags = Array.isArray(tags)
				? tags
				: typeof tags === 'string'
				? tags
						.split(',')
						.map(t => t.trim())
						.filter(Boolean)
				: []
		if (imageUrl !== undefined || coverUrl !== undefined)
			post.imageUrl = imageUrl !== undefined ? imageUrl || null : coverUrl || null
		await post.save()
		return res.json({ post: post.toJSON() })
	} catch (err) {
		return res.status(500).json({ error: 'Could not update post' })
	}
})

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ error: 'Not found' })
		if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
		await post.deleteOne()
		return res.json({ ok: true })
	} catch (err) {
		return res.status(500).json({ error: 'Could not delete post' })
	}
})

// Image upload endpoint
app.post('/api/upload/image', authMiddleware, upload.single('image'), (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'No image provided' })
	if (!CLOUDINARY_ENABLED) return res.status(500).json({ error: 'Cloudinary not configured' })

	const uploadStream = cloudinary.uploader.upload_stream(
		{ resource_type: 'image', folder: 'byteblog/covers' },
		(error, result) => {
			if (error) {
				return res.status(500).json({ error: 'Upload failed' })
			}
			return res.json({ url: result.secure_url, public_id: result.public_id })
		}
	)

	streamifier.createReadStream(req.file.buffer).pipe(uploadStream)
})

app.listen(PORT, () => {
	console.log(`[auth] server running on http://localhost:${PORT}`)
})


