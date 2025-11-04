import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Landing() {
	const { user } = useAuth()
	return (
		<section className="landing">
			<div className="hero">
				<div className="hero-bg" />
				<div className="orbs">
					<span className="orb orb-a" />
					<span className="orb orb-b" />
					<span className="orb orb-c" />
				</div>
				<p className="badge">Open for developers</p>
				<h1 className="gradient-text">
					Build. Share. Inspire.
					<span className="accent">ByteBlog</span>
				</h1>
				<p className="lead">
					Write elegant deep-dives, publish tutorials and showcase the craft behind your code.
				</p>
				<div className="cta-row">
					{user ? (
						<>
							<Link className="btn" to="/write">Write a post</Link>
							<Link className="btn secondary" to="/explore">Explore posts</Link>
						</>
					) : (
						<>
							<Link className="btn" to="/signup">Create free account</Link>
							<Link className="btn secondary" to="/explore">Explore posts</Link>
						</>
					)}
				</div>
				<div className="marquee" aria-hidden>
					<div className="marquee-track">
						<span>#react</span>
						<span>#javascript</span>
						<span>#devops</span>
						<span>#node</span>
						<span>#design</span>
						<span>#ai</span>
						<span>#testing</span>
						<span>#cloud</span>
						<span>#webperf</span>
					</div>
				</div>
			</div>

			<div className="feature-grid">
				<div className="feature-card lift" data-reveal>
					<h3>⚡ Lightning-fast</h3>
					<p className="muted">Instant navigation and silky-smooth editing powered by React + Vite.</p>
				</div>
				<div className="feature-card lift" data-reveal>
					<h3>📝 Clean writing</h3>
					<p className="muted">Minimal UI, Markdown support, and a live preview that mirrors your post.</p>
				</div>
				<div className="feature-card lift" data-reveal>
					<h3>🌱 Grow your voice</h3>
					<p className="muted">Share ideas and tag posts so the right devs discover your work.</p>
				</div>
			</div>

			<div className="preview-wrap" data-reveal>
				<div className="preview-chrome">
					<div className="dots" />
					<div className="dots" />
					<div className="dots" />
				</div>
				<pre className="preview-code">{`## Hello, developer!

This is a demo article. Click Write to publish your own.

- React + Vite
- Cloud image uploads
- Local drafts
`}</pre>
			</div>
		</section>
	)
}


