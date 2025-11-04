import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deletePost, fetchPost } from '../services/postStore.js'
import { estimateReadingTime, formatContentToHtml } from '../utils/formatContent.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PostDetail() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const [post, setPost] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const isAuthor = post && user && post.author?.id === user.id

	useEffect(() => {
		let active = true
		setLoading(true)
		setError(null)
		fetchPost(id)
			.then(data => {
				if (!active) return
				setPost(data)
				document.title = `${data.title} · ByteBlog`
				const meta = document.querySelector('meta[name="description"]')
				if (meta) meta.setAttribute('content', data.subtitle || data.title)
			})
			.catch(err => {
				if (!active) return
				setError(err)
			})
			.finally(() => {
				if (active) setLoading(false)
			})
		return () => {
			active = false
		}
	}, [id])

	async function onDelete() {
		if (!post) return
		if (!confirm('Delete this article?')) return
		try {
			await deletePost(post.id)
			navigate('/')
		} catch (err) {
			alert(err.message || 'Failed to delete post')
		}
	}

	if (loading) {
		return (
			<section>
				<p className="muted">Loading…</p>
			</section>
		)
	}

	if (error || !post) {
		return (
			<section>
				<p className="muted">{error?.message || 'Post not found.'}</p>
			</section>
		)
	}

	return (
		<article className="post-detail">
			{post.imageUrl && <img src={post.imageUrl} alt="cover" className="detail-cover" />}
			<h1>{post.title}</h1>
			{post.subtitle && <p className="lead">{post.subtitle}</p>}
			<p className="muted">
				{new Date(post.updatedAt || post.createdAt).toLocaleString()} · {estimateReadingTime(post.content)}
				{post.author?.username && ` · ${post.author.username}`}
			</p>
			<div className="tags">
				{post.tags.map(t => (
					<Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag">#{t}</Link>
				))}
			</div>
			<div className="content" dangerouslySetInnerHTML={{ __html: formatContentToHtml(post.content) }} />
			<div className="actions">
				{isAuthor && <Link className="btn" to={`/edit/${post.id}`}>Edit</Link>}
				<button className="btn" onClick={() => sharePost(post)}>Share</button>
				{isAuthor && <button className="btn danger" onClick={onDelete}>Delete</button>}
			</div>
		</article>
	)
}

async function sharePost(post) {
	const url = window.location.href
	const data = { title: post.title, text: post.subtitle || post.title, url }
	try {
		if (navigator.share) {
			await navigator.share(data)
		} else {
			await navigator.clipboard.writeText(url)
			alert('Link copied to clipboard')
		}
	} catch {
		// ignore
	}
}


