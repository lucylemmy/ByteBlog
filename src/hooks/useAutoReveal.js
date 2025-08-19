import { useEffect } from 'react'

export function useAutoReveal(deps = []) {
	useEffect(() => {
		const elements = Array.from(document.querySelectorAll('[data-reveal]'))
		if (elements.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible')
						observer.unobserve(entry.target)
					}
				}
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
		)

		for (const el of elements) observer.observe(el)
		return () => observer.disconnect()
	
	}, deps)
}


