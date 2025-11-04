import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPost, fetchPost, updatePost } from '../services/postStore.js'
import { formatContentToHtml, estimateReadingTime } from '../utils/formatContent.js'
import { uploadImage } from '../services/upload.js'

export default function PostForm() {
	const { id } = useParams()
	const editing = Boolean(id)
	const navigate = useNavigate()
	const fileInputRef = useRef(null)

	const [title, setTitle] = useState('')
	const [subtitle, setSubtitle] = useState('')
	const [content, setContent] = useState('')
	const [tags, setTags] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [loadingPost, setLoadingPost] = useState(editing)
	const [formError, setFormError] = useState(null)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (!editing) {
			setLoadingPost(false)
			return
		}
		let active = true
		setLoadingPost(true)
		setFormError(null)
		fetchPost(id)
			.then(post => {
				if (!active) return
			setTitle(post.title)
				setSubtitle(post.subtitle || '')
			setContent(post.content)
			setTags(post.tags.join(', '))
				setImageUrl(post.imageUrl || '')
			})
			.catch(err => {
				if (!active) return
				setFormError(err.message || 'Failed to load post')
			})
			.finally(() => {
				if (active) setLoadingPost(false)
			})
		return () => {
			active = false
		}
	}, [editing, id])

	const isValid = useMemo(() => title.trim().length >= 4 && content.trim().length >= 20, [title, content])

	async function onUploadFile(e) {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			const { url } = await uploadImage(file)
			setImageUrl(url)
		} catch (err) {
			alert(err.message || 'Failed to upload image')
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
	}

	async function onSubmit(e) {
		e.preventDefault()
		if (!isValid) return
		setSubmitting(true)
		setFormError(null)
		const payload = {
			title: title.trim(),
			subtitle: subtitle.trim(),
			content: content.trim(),
			tags: tags
				.split(',')
				.map(t => t.trim())
				.filter(Boolean),
			imageUrl: imageUrl || null,
		}
		try {
			const saved = editing ? await updatePost(id, payload) : await createPost(payload)
			navigate(`/post/${saved.id}`)
		} catch (err) {
			setFormError(err.message || 'Failed to save post')
		} finally {
			setSubmitting(false)
		}
	}

	const readingTime = estimateReadingTime(content)

	return (
		<section className="form-wrap">
			<h1>{editing ? 'Edit article' : 'Write a new article'}</h1>
			<p className="muted" style={{marginTop: -8}}>{readingTime}</p>
			{loadingPost && <p className="muted">Loading post…</p>}
			{formError && !submitting && <p className="muted" style={{ color: 'crimson' }}>{formError}</p>}
			<form className="form" onSubmit={onSubmit}>
				<label>
					<span>Title</span>
					<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. A practical guide to React hooks" required disabled={loadingPost || submitting} />
				</label>

				<label>
					<span>Subtitle</span>
					<input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="One-sentence overview (optional)" disabled={loadingPost || submitting} />
				</label>

				<label>
					<span>Tags</span>
					<input value={tags} onChange={e => setTags(e.target.value)} placeholder="comma,separated,tags" disabled={loadingPost || submitting} />
				</label>

				<label>
					<span>Cover image</span>
					<div className="file-row">
						<input ref={fileInputRef} type="file" accept="image/*" onChange={onUploadFile} disabled={loadingPost || submitting} />
						{imageUrl && <img src={imageUrl} alt="cover preview" className="preview" />}
					</div>
				</label>

				<div className="editor">
					<label className="editor-pane">
						<span>Content</span>
						<textarea rows={14} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your article in Markdown or plain text..." required disabled={loadingPost || submitting} />
					</label>
					<div className="editor-pane">
						<span>Live preview</span>
						<div className="preview-pane" dangerouslySetInnerHTML={{ __html: formatContentToHtml(content) }} />
					</div>
				</div>

				<div className="actions">
					<button className="btn" type="submit" disabled={!isValid || submitting}>
						{submitting ? (editing ? 'Saving…' : 'Publishing…') : (editing ? 'Save changes' : 'Publish article')}
					</button>
				</div>
			</form>
		</section>
	)
}


