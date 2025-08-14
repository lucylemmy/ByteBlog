import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePosts } from '../services/usePosts.js'
import { useAutoReveal } from '../hooks/useAutoReveal.js'

export default function Tag() {
	const { tag } = useParams()
	const { posts } = usePosts()
	const filtered = posts.filter(p => p.tags.includes(tag))

	useAutoReveal([filtered.length])

	return (
		<section>
			<h1>#{tag}</h1>
			<p className="muted">{filtered.length} article(s)</p>
			<ul className="post-grid">
				{filtered.map(post => (
					<li key={post.id} className="post-card" data-reveal>
						<Link to={`/post/${post.id}`}>
							{post.coverUrl && (
								<img src={post.coverUrl} alt="cover" className="cover" />
							)}
							<h3>{post.title}</h3>
							<p className="muted">{post.summary}</p>
						</Link>
					</li>
				))}
			</ul>
			{filtered.length === 0 && <p className="muted">Nothing here yet.</p>}
		</section>
	)
}


