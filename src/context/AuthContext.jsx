import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp, getToken } from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		async function init() {
			try {
				if (getToken()) {
					const { user } = await fetchMe()
					setUser(user)
				}
			} catch (err) {
				// invalid token, ignore
			} finally {
				setLoading(false)
			}
		}
		init()
	}, [])

	async function signIn(email, password) {
		setError(null)
		const user = await apiSignIn(email, password)
		setUser(user)
		return user
	}

	async function signUp(name, email, password) {
		setError(null)
		const user = await apiSignUp(name, email, password)
		setUser(user)
		return user
	}

	function signOut() {
		apiSignOut()
		setUser(null)
	}

	const value = useMemo(() => ({ user, loading, error, setError, signIn, signUp, signOut }), [user, loading, error])
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}


