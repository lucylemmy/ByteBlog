import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutoReveal } from '../hooks/useAutoReveal.js'
import { usePosts } from '../services/usePosts.js'

export default function Home() {
	const { posts, loading, error } = usePosts()
	const [query, setQuery] = useState('')

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return posts
		return posts.filter(p =>
			p.title.toLowerCase().includes(q) ||
			p.tags.join(' ').toLowerCase().includes(q) ||
			p.subtitle.toLowerCase().includes(q) ||
			(p.author?.username || '').toLowerCase().includes(q)
		)
	}, [posts, query])

	useAutoReveal([filtered.length])

	return (
		<section>
			<div className="home-header">
				<h1>Discover and share what you build</h1>
				<p>Read deep-dives, tutorials, and opinions from developers.</p>
				<input
					type="search"
					placeholder="Search posts, tags, authors..."
					value={query}
					onChange={e => setQuery(e.target.value)}
					className="search"
				/>
			</div>
			{error && <p className="muted" style={{ color: 'crimson' }}>{error.message || 'Failed to load posts'}</p>}
			{loading && <p className="muted">Loading posts…</p>}
			<ul className="post-grid">
				{filtered.map(post => (
					<li key={post.id} className="post-card" data-reveal>
						<Link to={`/post/${post.id}`}>
							{post.imageUrl && (
								<img src={post.imageUrl} alt="cover" className="cover" />
							)}
							<h3>{post.title}</h3>
							<p className="muted">{post.subtitle}</p>
							{post.author?.username && <p className="muted" style={{ fontSize: 12 }}>By {post.author.username}</p>}
							<div className="tags">
								{post.tags.map(t => (
									<Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag">#{t}</Link>
								))}
							</div>
						</Link>
					</li>
				))}
			</ul>
			{!loading && filtered.length === 0 && <p className="muted">No posts yet. Be the first to write!</p>}
		</section>
	)
}


