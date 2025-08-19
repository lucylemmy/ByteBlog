const TOKEN_KEY = 'byteblog.auth.token'

export function getToken() {
	return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
	if (token) localStorage.setItem(TOKEN_KEY, token)
	else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
	const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
	const token = getToken()
	if (token) headers['Authorization'] = `Bearer ${token}`
	const res = await fetch(`/api${path}`, { ...options, headers })
	const data = await res.json().catch(() => ({}))
	if (!res.ok) throw new Error(data?.error || 'Request failed')
	return data
}

export async function signIn(email, password) {
	const { token, user } = await api('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) })
	setToken(token)
	return user
}

export async function signUp(name, email, password) {
	const { token, user } = await api('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) })
	setToken(token)
	return user
}

export async function fetchMe() {
	return api('/auth/me')
}

export function signOut() {
	setToken(null)
}


