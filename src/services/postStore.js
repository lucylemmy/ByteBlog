const STORAGE_KEY = 'byteblog.posts.v1'

function readAll() {
	const raw = localStorage.getItem(STORAGE_KEY)
	if (!raw) return []
	try {
		return JSON.parse(raw)
	} catch {
		return []
	}
}

function writeAll(posts) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export function seedIfEmpty() {
	const posts = readAll()
	if (posts.length) return
	const sample = [
		{
			id: crypto.randomUUID(),
			title: 'Welcome to ByteBlog',
			summary: 'A lightweight developer-focused blog built with React + Vite',
			content:
				"## Hello, developer!\n\nThis is a demo article. Click Write to publish your own.\n\n- Built with React + Vite\n- LocalStorage persistence\n- Minimal CSS and UX\n\nHappy shipping!",
			tags: ['react', 'vite', 'demo'],
			coverUrl: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	]
	writeAll(sample)
}

export function readPosts() {
	return readAll().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
}

export function readPostById(id) {
	return readAll().find(p => p.id === id)
}

export function upsertPost(post) {
	const posts = readAll()
	const idx = posts.findIndex(p => p.id === post.id)
	if (idx >= 0) posts[idx] = { ...posts[idx], ...post }
	else posts.push(post)
	writeAll(posts)
}

export function deletePost(id) {
	const next = readAll().filter(p => p.id !== id)
	writeAll(next)
}


