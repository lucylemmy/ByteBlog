import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Auth from './pages/Auth.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import Landing from './pages/Landing.jsx'
import PostForm from './pages/PostForm.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Tag from './pages/Tag.jsx'

export default function App() {
	const { user, loading } = useAuth()
	return (
		<>
			<Header />
			<main className="container">
				{loading ? <p className="muted">Loading…</p> : (
				<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="/explore" element={<Home />} />
					<Route path="/write" element={user ? <PostForm /> : <Navigate to="/signin" replace />} />
					<Route path="/edit/:id" element={user ? <PostForm /> : <Navigate to="/signin" replace />} />
					<Route path="/post/:id" element={<PostDetail />} />
					<Route path="/tag/:tag" element={<Tag />} />
					<Route path="/signin" element={<Auth />} />
					<Route path="/signup" element={<Auth />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
				)}
			</main>
		</>
	)
}


