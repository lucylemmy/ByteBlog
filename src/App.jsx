import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import PostForm from './pages/PostForm.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Tag from './pages/Tag.jsx'

export default function App() {
	return (
		<>
			<Header />
			<main className="container">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/write" element={<PostForm />} />
					<Route path="/edit/:id" element={<PostForm />} />
					<Route path="/post/:id" element={<PostDetail />} />
					<Route path="/tag/:tag" element={<Tag />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
		</>
	)
}


