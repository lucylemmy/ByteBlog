import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePosts } from '../services/usePosts.js'
import { useAutoReveal } from '../hooks/useAutoReveal.js'

export default function Tag() {
	const { tag } = useParams()
	const { posts, loading, error } = usePosts({ tag })

	useAutoReveal([posts.length])

	return (
		<section>
			<h1>#{tag}</h1>
			<p className="muted">{posts.length} article(s)</p>
			{error && <p className="muted" style={{ color: 'crimson' }}>{error.message || 'Failed to load posts'}</p>}
			{loading && <p className="muted">Loading…</p>}
			<ul className="post-grid">
				{posts.map(post => (
					<li key={post.id} className="post-card" data-reveal>
						<Link to={`/post/${post.id}`}>
							{post.imageUrl && (
								<img src={post.imageUrl} alt="cover" className="cover" />
							)}
							<h3>{post.title}</h3>
							<p className="muted">{post.subtitle}</p>
						</Link>
					</li>
				))}
			</ul>
			{!loading && posts.length === 0 && <p className="muted">Nothing here yet.</p>}
		</section>
	)
}


