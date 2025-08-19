import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '/logo.svg'

export default function Header() {
	const { user, signOut } = useAuth()
	return (
		<header className="header">
			<div className="container header-inner">
				<Link to="/" className="brand">
					<img src={logo} alt="ByteBlog logo" className="logo" />
					<span>ByteBlog</span>
				</Link>
				<nav className="nav">
					<NavLink to="/" end>Home</NavLink>
					<NavLink to="/explore">Explore</NavLink>
					<NavLink to="/write">Write</NavLink>
					{user ? (
						<>
							<span className="muted" style={{ marginLeft: 12 }}>Hi, {user.name || user.email}</span>
							<button className="btn" onClick={signOut} style={{ marginLeft: 12 }}>Sign out</button>
						</>
					) : (
						<>
							<NavLink to="/signin">Sign in</NavLink>
							<NavLink to="/signup">Sign up</NavLink>
						</>
					)}
				</nav>
			</div>
		</header>
	)
}


