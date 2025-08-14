import React, { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deletePost, readPostById } from '../services/postStore.js'
import { estimateReadingTime, formatContentToHtml } from '../utils/formatContent.js'

export default function PostDetail() {
	const { id } = useParams()
	const navigate = useNavigate()
	const post = readPostById(id)

	if (!post) {
		return (
			<section>
				<p className="muted">Post not found.</p>
			</section>
		)
	}

	useEffect(() => {
		document.title = `${post.title} · ByteBlog`
		const meta = document.querySelector('meta[name="description"]')
		if (meta) meta.setAttribute('content', post.summary || post.title)
	}, [post])

	function onDelete() {
		if (confirm('Delete this article?')) {
			deletePost(post.id)
			navigate('/')
		}
	}

	return (
		<article className="post-detail">
			{post.coverUrl && <img src={post.coverUrl} alt="cover" className="detail-cover" />}
			<h1>{post.title}</h1>
			<p className="muted">
				{new Date(post.updatedAt || post.createdAt).toLocaleString()} · {estimateReadingTime(post.content)}
			</p>
			<div className="tags">
				{post.tags.map(t => (
					<Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag">#{t}</Link>
				))}
			</div>
			<div className="content" dangerouslySetInnerHTML={{ __html: formatContentToHtml(post.content) }} />
			<div className="actions">
				<Link className="btn" to={`/edit/${post.id}`}>Edit</Link>
				<button className="btn" onClick={() => sharePost(post)}>Share</button>
				<button className="btn danger" onClick={onDelete}>Delete</button>
			</div>
		</article>
	)
}

async function sharePost(post) {
	const url = window.location.href
	const data = { title: post.title, text: post.summary || post.title, url }
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


