import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignIn() {
	const { signIn, setError } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [err, setErr] = useState(null)
	const navigate = useNavigate()

	async function onSubmit(e) {
		e.preventDefault()
		setErr(null)
		setError(null)
		setSubmitting(true)
		try {
			await signIn(email, password)
			navigate('/')
		} catch (e) {
			setErr(e.message || 'Failed to sign in')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section className="form-wrap">
			<h1>Sign in</h1>
			<form className="form" onSubmit={onSubmit}>
				<label>
					<span>Email</span>
					<input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
				</label>
				<label>
					<span>Password</span>
					<input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
				</label>
				{err && <p className="muted" style={{ color: 'crimson' }}>{err}</p>}
				<div className="actions">
					<button className="btn" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
				</div>
				<p className="muted">Don't have an account? <Link to="/signup">Sign up</Link></p>
			</form>
		</section>
	)
}


