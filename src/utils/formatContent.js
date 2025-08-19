
function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;')
}

export function formatContentToHtml(markdown) {
	if (!markdown) return ''
	const lines = markdown.split(/\r?\n/)
	let html = ''
	let inCode = false
	let paragraph = []

	function flushParagraph() {
		if (!paragraph.length) return
		const text = paragraph.join(' ')
		const formatted = text
			.replace(/^###\s(.+)$/g, '<h3>$1</h3>')
			.replace(/^##\s(.+)$/g, '<h2>$1</h2>')
			.replace(/^#\s(.+)$/g, '<h1>$1</h1>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/`([^`]+)`/g, '<code>$1</code>')
		html += `<p>${formatted}</p>`
		paragraph = []
	}

	for (const raw of lines) {
		const line = raw.replace(/\t/g, '    ')
		if (line.trim().startsWith('```')) {
			if (inCode) {
				html += '</code></pre>'
				inCode = false
			} else {
				flushParagraph()
				html += '<pre><code>'
				inCode = true
			}
			continue
		}
		if (inCode) {
			html += `${escapeHtml(line)}\n`
			continue
		}
		if (line.trim() === '') {
			flushParagraph()
		} else {
			paragraph.push(line)
		}
	}
	flushParagraph()
	if (inCode) html += '</code></pre>'
	return html
}

export function estimateReadingTime(text) {
	const words = (text || '').trim().split(/\s+/).filter(Boolean).length
	const minutes = Math.max(1, Math.round(words / 200))
	return `${minutes} min read`
}


