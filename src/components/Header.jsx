import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '/logo.svg'

export default function Header() {
	return (
		<header className="header">
			<div className="container header-inner">
				<Link to="/" className="brand">
					<img src={logo} alt="ByteBlog logo" className="logo" />
					<span>ByteBlog</span>
				</Link>
				<nav className="nav">
					<NavLink to="/" end>Home</NavLink>
					<NavLink to="/write">Write</NavLink>
				</nav>
			</div>
		</header>
	)
}


