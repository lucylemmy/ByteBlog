import { getToken, resolveApiUrl } from './auth.js'

export async function uploadImage(file) {
	const token = getToken()
	const form = new FormData()
	form.append('image', file)
	const res = await fetch(resolveApiUrl('/upload/image'), {
		method: 'POST',
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		body: form,
	})
	const data = await res.json().catch(() => ({}))
	if (!res.ok) throw new Error(data?.error || 'Upload failed')
	return data
}


