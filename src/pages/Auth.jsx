import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Auth() {
    const location = useLocation()
    const navigate = useNavigate()
    const { signIn, signUp, setError } = useAuth()

    const initialMode = useMemo(() => (location.pathname.includes('signup') ? 'signup' : 'signin'), [location.pathname])
    const [mode, setMode] = useState(initialMode)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [err, setErr] = useState(null)

    useEffect(() => {
        setMode(initialMode)
        setErr(null)
        setError?.(null)
    }, [initialMode, setError])

    function switchMode(nextMode) {
        setMode(nextMode)
        setErr(null)
        setError?.(null)
        navigate(nextMode === 'signup' ? '/signup' : '/signin', { replace: true })
    }

    async function onSubmit(e) {
        e.preventDefault()
        setErr(null)
        setError?.(null)
        setSubmitting(true)
        try {
            const trimmedEmail = email.trim()
            if (mode === 'signin') {
                await signIn(trimmedEmail, password)
            } else {
                await signUp(username.trim(), trimmedEmail, password)
            }
            navigate('/')
        } catch (e) {
            setErr(e.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="form-wrap">
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button
                    className="btn"
                    type="button"
                    onClick={() => switchMode('signin')}
                    style={{ opacity: mode === 'signin' ? 1 : .6 }}
                >Sign in</button>
                <button
                    className="btn"
                    type="button"
                    onClick={() => switchMode('signup')}
                    style={{ opacity: mode === 'signup' ? 1 : .6 }}
                >Sign up</button>
            </div>

            <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="muted" style={{ marginTop: -8 }}>{mode === 'signin' ? 'Access your ByteBlog account' : 'Start writing and sharing today'}</p>

            <form className="form" onSubmit={onSubmit}>
                {mode === 'signup' && (
                    <label>
                        <span>Username</span>
                        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" required={mode === 'signup'} />
                    </label>
                )}
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
                    <button className="btn" type="submit" disabled={submitting}>
                        {submitting ? (mode === 'signin' ? 'Signing in…' : 'Creating…') : (mode === 'signin' ? 'Sign in' : 'Sign up')}
                    </button>
                </div>
                {mode === 'signin' ? (
                    <p className="muted">New here? <Link to="/signup" onClick={e => { e.preventDefault(); switchMode('signup') }}>Create an account</Link></p>
                ) : (
                    <p className="muted">Already have an account? <Link to="/signin" onClick={e => { e.preventDefault(); switchMode('signin') }}>Sign in</Link></p>
                )}
            </form>
        </section>
    )
}


