const TOKEN_KEY = 'byteblog.auth.token'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const configuredBaseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : ''
const DEFAULT_BASE_URL = '/api'

export function resolveApiUrl(path) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	const base = configuredBaseUrl || DEFAULT_BASE_URL
	const sanitizedBase = base.endsWith('/') ? base.replace(/\/+$/, '') : base
	if (!sanitizedBase || sanitizedBase === '/') return normalizedPath
	return `${sanitizedBase}${normalizedPath}`
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
	if (token) localStorage.setItem(TOKEN_KEY, token)
	else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
	const headers = { ...(options.headers || {}) }
	const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
	if (!isFormData && !('Content-Type' in headers)) {
		headers['Content-Type'] = 'application/json'
	}
	const token = getToken()
	if (token) headers['Authorization'] = `Bearer ${token}`
	const res = await fetch(resolveApiUrl(path), { ...options, headers })
	const data = await res.json().catch(() => ({}))
	if (!res.ok) throw new Error(data?.error || 'Request failed')
	return data
}

export async function signIn(email, password) {
	const body = JSON.stringify({ email, password })
	const { token, user } = await api('/auth/login', { method: 'POST', body })
	setToken(token)
	return user
}

export async function signUp(username, email, password) {
	const body = JSON.stringify({ username, email, password })
	const { token, user } = await api('/auth/signup', { method: 'POST', body })
	setToken(token)
	return user
}

export async function fetchMe() {
	return api('/auth/me')
}

export async function signOut() {
	try {
		await api('/auth/logout', { method: 'POST' })
	} catch (err) {
		// ignore logout failure, still clear token
	}
	setToken(null)
}


