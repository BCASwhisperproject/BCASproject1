'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { CATEGORY_LABELS, CATEGORY_ICONS, DAILY_POST_LIMIT } from '@/lib/utils'
import type { DBUser } from '@/hooks/useDBUser'
import type { PostData } from './PostCard'
import Avatar from './Avatar'

const CATEGORIES = Object.keys(CATEGORY_LABELS)

interface PostComposerProps {
  dbUser: DBUser
  postsToday: number
  onPost: (post: PostData) => void
}

export default function PostComposer({ dbUser, postsToday, onPost }: PostComposerProps) {
  const [open, setOpen]           = useState(false)
  const [title, setTitle]         = useState('')
  const [body, setBody]           = useState('')
  const [category, setCategory]   = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setPreview]= useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const atLimit = !dbUser.isAdmin && postsToday >= DAILY_POST_LIMIT

  function handleOpen() {
    if (atLimit) { toast.error('🚫 Daily limit of 2 posts reached! Come back tomorrow.'); return }
    setOpen(true)
  }
  function handleClose() { setOpen(false); setTitle(''); setBody(''); setCategory(''); setImageFile(null); setPreview(null); setError('') }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    setError('')
    if (!title.trim()) { setError('Add a title!'); return }
    if (!category)     { setError('Pick a category!'); return }
    setSubmitting(true)

    const form = new FormData()
    form.append('title', title.trim())
    form.append('body', body.trim() || '...')
    form.append('category', category)
    if (imageFile) {
      // Convert to base64 for cloudinary
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader()
        reader.onload = e => res(e.target?.result as string)
        reader.readAsDataURL(imageFile)
      })
      form.append('imageBase64', base64)
    }

    try {
      const r = await fetch('/api/posts', { method: 'POST', body: form })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error ?? 'Failed to post')
      handleClose()
      onPost(data.post)
      toast.success('✦ Your whisper is live!')
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* Composer trigger card */}
      <div className="rounded-2xl shadow-sm p-4" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Avatar username={dbUser.username} avatarColor={dbUser.avatarColor} size={42} />
          <button onClick={handleOpen}
            className="flex-1 rounded-full px-4 py-2.5 text-sm text-left transition-colors hover:border-[var(--accent)]"
            style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', color: 'var(--muted)' }}>
            💬 Share a whisper…
          </button>
        </div>
        <div className="h-px mb-3" style={{ background: 'var(--border)' }} />
        <div className="flex gap-2">
          {[['📷', 'Photo'], ['🔥', 'Hot Take'], ['✦', 'Whisper']].map(([icon, label]) => (
            <button key={label} onClick={handleOpen}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[.85rem] font-semibold transition-colors hover:bg-[var(--surface2)]"
              style={{ color: 'var(--muted)' }}>
              {icon} {label}
            </button>
          ))}
        </div>
        {atLimit && (
          <p className="text-center text-[.78rem] mt-2 font-semibold" style={{ color: 'var(--muted)' }}>
            🚫 Daily limit reached ({postsToday}/{DAILY_POST_LIMIT}). Come back tomorrow!
          </p>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && handleClose()}>
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'var(--surface)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>✦ Create Whisper</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>✕</button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* User info */}
              <div className="flex items-center gap-3">
                <Avatar username={dbUser.username} avatarColor={dbUser.avatarColor} size={42} />
                <div>
                  <div className="font-bold text-[.92rem]" style={{ color: 'var(--text)' }}>{dbUser.username}</div>
                  <div className="text-[.75rem]" style={{ color: 'var(--muted)' }}>🔒 Anonymous post</div>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm px-3 py-2 rounded-lg bg-red-50">{error}</div>}

              {/* Title */}
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your whisper a title…"
                className="w-full rounded-xl px-4 py-3 text-[.95rem] font-bold outline-none border focus:border-[var(--accent)] transition-colors"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)', fontFamily: 'var(--font-display)' }} />

              {/* Body */}
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Your whisper… spill it 👀" rows={4}
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border resize-none focus:border-[var(--accent)] transition-colors"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)' }} />

              {/* Image upload */}
              <div>
                <p className="text-[.75rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Photo (optional)</p>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-xl max-h-48 object-cover" />
                    <button onClick={() => { setImageFile(null); setPreview(null) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                      style={{ background: 'rgba(0,0,0,.6)', color: '#fff' }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed rounded-xl py-5 text-sm transition-colors hover:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    📷 Add a photo
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>

              {/* Category */}
              <div>
                <p className="text-[.75rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg border text-[.82rem] font-semibold transition-all ${category === cat ? 'text-white border-transparent' : 'hover:border-[var(--accent)]'}`}
                      style={{
                        background: category === cat ? 'var(--accent)' : 'transparent',
                        borderColor: category === cat ? 'var(--accent)' : 'var(--border)',
                        color: category === cat ? '#fff' : 'var(--muted)',
                      }}>
                      {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-[.95rem] text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                {submitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Posting…</> : 'Post to Feed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
