import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignUp() {
	const { signUp, setError } = useAuth()
	const [name, setName] = useState('')
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
			await signUp(name, email, password)
			navigate('/')
		} catch (e) {
			setErr(e.message || 'Failed to sign up')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section className="form-wrap">
			<h1>Create your account</h1>
			<form className="form" onSubmit={onSubmit}>
				<label>
					<span>Name</span>
					<input value={name} onChange={e => setName(e.target.value)} required />
				</label>
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
					<button className="btn" type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Sign up'}</button>
				</div>
				<p className="muted">Already have an account? <Link to="/signin">Sign in</Link></p>
			</form>
		</section>
	)
}


