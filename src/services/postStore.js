import { api } from './auth.js'

function normalisePost(post) {
	return {
		...post,
		subtitle: post.subtitle ?? '',
		tags: Array.isArray(post.tags) ? post.tags : [],
	}
}

export async function fetchPosts({ tag } = {}) {
	const query = tag ? `?tag=${encodeURIComponent(tag)}` : ''
	const { posts } = await api(`/posts${query}`)
	return posts.map(normalisePost)
}

export async function fetchPost(id) {
	const { post } = await api(`/posts/${id}`)
	return normalisePost(post)
}

export async function createPost(payload) {
	const body = JSON.stringify({
		title: payload.title,
		subtitle: payload.subtitle ?? '',
		content: payload.content,
		tags: Array.isArray(payload.tags) ? payload.tags : [],
		imageUrl: payload.imageUrl || null,
	})
	const { post } = await api('/posts', { method: 'POST', body })
	return normalisePost(post)
}

export async function updatePost(id, payload) {
	const body = JSON.stringify({
		title: payload.title,
		subtitle: payload.subtitle ?? '',
		content: payload.content,
		tags: Array.isArray(payload.tags) ? payload.tags : [],
		imageUrl: payload.imageUrl ?? null,
	})
	const { post } = await api(`/posts/${id}`, { method: 'PUT', body })
	return normalisePost(post)
}

export async function deletePost(id) {
	await api(`/posts/${id}`, { method: 'DELETE' })
}
