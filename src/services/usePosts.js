import { useCallback, useEffect, useState } from 'react'
import { fetchPosts } from './postStore.js'

export function usePosts(options = {}) {
	const { tag } = options
	const [posts, setPosts] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

const refresh = useCallback(async ({ silent = false } = {}) => {
	if (!silent) setLoading(true)
	setError(null)
	try {
		const data = await fetchPosts({ tag })
		setPosts(data)
		return data
	} catch (err) {
		setError(err)
		throw err
	} finally {
		if (!silent) setLoading(false)
	}
}, [tag])

	useEffect(() => {
	let active = true
	setLoading(true)
	setError(null)
	fetchPosts({ tag })
		.then(data => {
			if (active) setPosts(data)
		})
		.catch(err => {
			if (active) setError(err)
		})
		.finally(() => {
			if (active) setLoading(false)
		})
	return () => {
		active = false
	}
}, [tag])

return { posts, loading, error, refresh }
}


