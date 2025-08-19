import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePosts } from '../services/usePosts.js'
import { upsertPost, readPostById } from '../services/postStore.js'
import { formatContentToHtml, estimateReadingTime } from '../utils/formatContent.js'
import { uploadImage } from '../services/upload.js'

export default function PostForm() {
	const { id } = useParams()
	const editing = Boolean(id)
	const navigate = useNavigate()
	const { refresh } = usePosts()
	const fileInputRef = useRef(null)

	const [title, setTitle] = useState('')
	const [summary, setSummary] = useState('')
	const [content, setContent] = useState('')
	const [tags, setTags] = useState('')
	const [coverUrl, setCoverUrl] = useState('')

	useEffect(() => {
		if (!editing) return
		const post = readPostById(id)
		if (post) {
			setTitle(post.title)
			setSummary(post.summary)
			setContent(post.content)
			setTags(post.tags.join(', '))
			setCoverUrl(post.coverUrl || '')
		}
	}, [editing, id])

	const isValid = useMemo(() => title.trim().length >= 4 && content.trim().length >= 20, [title, content])

	async function onUploadFile(e) {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			const { url } = await uploadImage(file)
			setCoverUrl(url)
		} catch (err) {
			alert(err.message || 'Failed to upload image')
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
	}

	function onSubmit(e) {
		e.preventDefault()
		if (!isValid) return
		const now = new Date().toISOString()
		const post = {
			id: editing ? id : crypto.randomUUID(),
			title: title.trim(),
			summary: summary.trim() || title.trim(),
			content: content.trim(),
			tags: tags
				.split(',')
				.map(t => t.trim())
				.filter(Boolean),
			coverUrl: coverUrl || null,
			createdAt: editing ? undefined : now,
			updatedAt: now,
		}
		upsertPost(post)
		refresh()
		navigate(`/post/${post.id}`)
	}

	const readingTime = estimateReadingTime(content)

	return (
		<section className="form-wrap">
			<h1>{editing ? 'Edit article' : 'Write a new article'}</h1>
			<p className="muted" style={{marginTop: -8}}>{readingTime}</p>
			<form className="form" onSubmit={onSubmit}>
				<label>
					<span>Title</span>
					<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. A practical guide to React hooks" required />
				</label>

				<label>
					<span>Summary</span>
					<input value={summary} onChange={e => setSummary(e.target.value)} placeholder="One-sentence overview (optional)" />
				</label>

				<label>
					<span>Tags</span>
					<input value={tags} onChange={e => setTags(e.target.value)} placeholder="comma,separated,tags" />
				</label>

				<label>
					<span>Cover image</span>
					<div className="file-row">
						<input ref={fileInputRef} type="file" accept="image/*" onChange={onUploadFile} />
						{coverUrl && <img src={coverUrl} alt="cover preview" className="preview" />}
					</div>
				</label>

				<div className="editor">
					<label className="editor-pane">
						<span>Content</span>
						<textarea rows={14} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your article in Markdown or plain text..." required />
					</label>
					<div className="editor-pane">
						<span>Live preview</span>
						<div className="preview-pane" dangerouslySetInnerHTML={{ __html: formatContentToHtml(content) }} />
					</div>
				</div>

				<div className="actions">
					<button className="btn" type="submit" disabled={!isValid}>{editing ? 'Save changes' : 'Publish article'}</button>
				</div>
			</form>
		</section>
	)
}


