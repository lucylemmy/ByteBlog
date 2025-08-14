import { useEffect, useState } from 'react'
import { readPosts, seedIfEmpty } from './postStore.js'

export function usePosts() {
	const [posts, setPosts] = useState(() => {
		seedIfEmpty()
		return readPosts()
	})

	useEffect(() => {
		function onStorage(e) {
			if (e.key === 'byteblog.posts.v1') setPosts(readPosts())
		}
		window.addEventListener('storage', onStorage)
		return () => window.removeEventListener('storage', onStorage)
	}, [])

	function refresh() {
		setPosts(readPosts())
	}

	return { posts, refresh }
}


