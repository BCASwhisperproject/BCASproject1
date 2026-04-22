'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { CATEGORY_LABELS, CATEGORY_ICONS, ALLOWED_REACTIONS, timeAgo, getAvatarGradient, getInitials, isLikelyOffensive } from '@/lib/utils'
import type { DBUser } from '@/hooks/useDBUser'
import Avatar from './Avatar'

export type PostData = {
  id: string
  title: string
  body: string
  category: string
  imageUrl: string | null
  isPinned: boolean
  isHot: boolean
  hotScore: number
  isHidden: boolean
  adminNote: string
  authorId: string
  authorUsername: string
  authorAvatarColor: string
  isAdminPost: boolean
  createdAt: string | Date
  likeCount: number
  commentCount: number
  likedByMe: boolean
  myReaction: string | null
  reactions: Record<string, number>
  comments?: CommentData[]
}

export type CommentData = {
  id: string
  text: string
  authorUsername: string
  authorAvatarColor: string
  createdAt: string | Date
}

interface PostCardProps {
  post: PostData
  dbUser: DBUser
  onUpdate?: (post: PostData) => void
  onDelete?: (id: string) => void
  inDetail?: boolean
}

function getVibeTag(post: PostData) {
  const score = post.likeCount * 2 + post.commentCount
  if (score >= 20) return { label: '🔥 Trending', cls: 'vibe-trending' }
  if (post.category === 'bite') return { label: '💀 Savage', cls: 'vibe-savage' }
  if (post.category === 'tea')  return { label: '🍵 Tea',    cls: 'vibe-tea' }
  if (score >= 10) return { label: '🔥 Hot', cls: 'vibe-hot' }
  return null
}

export default function PostCard({ post, dbUser, onUpdate, onDelete, inDetail = false }: PostCardProps) {
  const router = useRouter()
  const [data, setData]               = useState<PostData>(post)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [pickerOpen, setPickerOpen]   = useState(false)
  const [showBlur, setShowBlur]       = useState(() => isLikelyOffensive(post.title + ' ' + post.body))
  const [showReport, setShowReport]   = useState(false)
  const [editing, setEditing]         = useState(false)
  const [editTitle, setEditTitle]     = useState(post.title)
  const [editBody, setEditBody]       = useState(post.body)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const hidePickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOwner  = dbUser.id === data.authorId
  const canManage = isOwner || dbUser.isAdmin
  const vibe     = getVibeTag(data)
  const catLabel = CATEGORY_LABELS[data.category] ?? data.category
  const catIcon  = CATEGORY_ICONS[data.category] ?? '📝'

  /* ── LIKE / REACT ── */
  async function handleLike() {
    const res = await fetch(`/api/posts/${data.id}/like`, { method: 'POST' })
    if (!res.ok) return
    const { likedByMe, likeCount } = await res.json()
    setData(d => ({ ...d, likedByMe, likeCount }))
    onUpdate?.({ ...data, likedByMe, likeCount })
  }

  async function handleReact(emoji: string) {
    setPickerOpen(false)
    const res = await fetch(`/api/posts/${data.id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
    if (!res.ok) return
    const { reactions, myReaction } = await res.json()
    setData(d => ({ ...d, reactions, myReaction }))
    onUpdate?.({ ...data, reactions, myReaction })
  }

  /* ── DELETE ── */
  async function handleDelete() {
    setMenuOpen(false)
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/posts/${data.id}`, { method: 'DELETE' })
    if (res.ok) { onDelete?.(data.id); toast.success('Post deleted') }
    else toast.error('Could not delete post')
  }

  /* ── EDIT ── */
  async function handleEdit() {
    if (!editTitle.trim()) return
    const res = await fetch(`/api/posts/${data.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, body: editBody }),
    })
    if (res.ok) {
      const { post: updated } = await res.json()
      setData(d => ({ ...d, title: updated.title, body: updated.body }))
      setEditing(false)
      toast.success('Post updated ✅')
    } else toast.error('Could not save')
  }

  /* ── REPORT ── */
  async function handleReport(reason: string) {
    setShowReport(false)
    await fetch(`/api/posts/${data.id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    toast.success('🚨 Report submitted. Thank you!')
  }

  /* ── COMMENT ── */
  async function submitComment() {
    if (!commentText.trim() || submittingComment) return
    setSubmittingComment(true)
    const res = await fetch(`/api/posts/${data.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText }),
    })
    if (res.ok) {
      const { comment } = await res.json()
      setData(d => ({ ...d, commentCount: d.commentCount + 1, comments: [...(d.comments ?? []), comment] }))
      setCommentText('')
    } else toast.error('Could not post comment')
    setSubmittingComment(false)
  }

  /* ── REACTION DISPLAY ── */
  const reactionEntries = Object.entries(data.reactions).filter(([, c]) => c > 0)
  const currentReact = data.myReaction ?? (data.likedByMe ? '❤️' : null)

  /* ── PICKER HOVER ── */
  function openPicker()  {
    if (hidePickerTimer.current) clearTimeout(hidePickerTimer.current)
    setPickerOpen(true)
  }
  function schedulePicker() {
    hidePickerTimer.current = setTimeout(() => setPickerOpen(false), 400)
  }

  return (
    <article className={`post-card animate-fade-in-up ${data.isAdminPost ? 'border-2 border-yellow-400' : ''}`}>
      {/* Admin banner */}
      {data.isAdminPost && <div className="admin-post-banner">👑 Admin Post</div>}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar username={data.authorUsername} avatarColor={data.authorAvatarColor} size={42} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="font-bold text-[0.92rem]" style={{ color: 'var(--text)' }}>{data.authorUsername}</span>
            <span className={`cat-pill cat-${data.category}`}>{catIcon} {catLabel}</span>
            {vibe && <span className={`vibe-tag text-[.68rem] font-bold px-2 py-0.5 rounded-full ${vibe.cls}`}>{vibe.label}</span>}
            {data.isPinned && <span className="text-[.68rem] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">📌 Pinned</span>}
            {data.isHot    && <span className="text-[.68rem] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">🔥 HOT</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[.76rem]" style={{ color: 'var(--muted)' }}>
            <span title={new Date(data.createdAt).toLocaleString()}>{timeAgo(data.createdAt)}</span>
            <span>·</span>
            <span>🔒 Anonymous</span>
          </div>
        </div>

        {/* ··· menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors hover:bg-[var(--surface2)]"
            style={{ color: 'var(--muted)' }}
          >···</button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 rounded-xl shadow-xl border z-30 min-w-[170px] p-1 animate-fade-in-up"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {canManage && <>
                <button onClick={() => { setMenuOpen(false); setEditing(true) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--surface2)] text-left" style={{ color: 'var(--text)' }}>
                  ✏️ Edit Post
                </button>
                <button onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-red-50 text-red-500 text-left">
                  🗑️ Delete Post
                </button>
              </>}
              <button onClick={() => { setMenuOpen(false); setShowReport(true) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-red-50 text-red-500 text-left">
                🚨 Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        {editing ? (
          <div className="space-y-2">
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <div className="flex gap-2">
              <button onClick={handleEdit} className="px-4 py-1.5 rounded-lg text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-lg text-sm" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        ) : showBlur ? (
          <div className="relative">
            <div className="offensive-blur">
              <h3 className="font-bold text-[1.05rem] mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{data.title}</h3>
              <p className="text-[.9rem] leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text)' }}>{data.body}</p>
            </div>
            <div onClick={() => setShowBlur(false)}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 cursor-pointer rounded-lg"
              style={{ background: 'rgba(0,0,0,.35)' }}>
              <span className="text-white font-semibold text-sm">⚠️ May be offensive</span>
              <span className="text-white/80 text-xs">Click to reveal</span>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-[1.05rem] mb-1 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{data.title}</h3>
            <p className={`text-[.9rem] leading-relaxed whitespace-pre-wrap break-words `} style={{ color: 'var(--text)' }}>{data.body}</p>
          </>
        )}
      </div>

      {/* Image */}
      {data.imageUrl && (
        <div className="relative w-full max-h-[420px] overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}>
          <img src={data.imageUrl} alt="Post image" className="w-full object-cover max-h-[420px]" loading="lazy" />
        </div>
      )}

      {/* Reaction stats bar */}
      {(reactionEntries.length > 0 || data.likeCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-[.82rem] border-t" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 flex-wrap">
            {reactionEntries.map(([emoji, count]) => (
              <span key={emoji} className="flex items-center gap-1 bg-[var(--surface2)] border border-[var(--border)] rounded-full px-2 py-0.5 text-[.78rem] font-bold" style={{ color: 'var(--text)' }}>
                {emoji} {count}
              </span>
            ))}
            {reactionEntries.length === 0 && data.likeCount > 0 && (
              <span className="flex items-center gap-1 bg-[var(--surface2)] border border-[var(--border)] rounded-full px-2 py-0.5 text-[.78rem] font-bold" style={{ color: 'var(--text)' }}>
                👍 {data.likeCount}
              </span>
            )}
          </div>
          {data.commentCount > 0 && (
            <button onClick={() => !inDetail && router.push(`/post/${data.id}`)}
              className="hover:underline" style={{ color: 'var(--muted)' }}>
              {data.commentCount} comment{data.commentCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center border-t px-1 py-0.5" style={{ borderColor: 'var(--border)' }}>
        {/* React button with picker */}
        <div className="relative flex-1" onMouseEnter={openPicker} onMouseLeave={schedulePicker}>
          <button
            onClick={handleLike}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[.85rem] font-semibold transition-colors ${currentReact ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} hover:bg-[var(--surface2)]`}
          >
            <span className={currentReact ? 'animate-heart-pop' : ''}>{currentReact ?? '🤍'}</span>
            <span>{currentReact ? 'Reacted' : 'React'}</span>
          </button>
          {pickerOpen && (
            <div className="reaction-picker-popup" onMouseEnter={openPicker} onMouseLeave={schedulePicker}>
              {ALLOWED_REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => handleReact(emoji)}
                  className="text-[1.35rem] cursor-pointer border-none bg-transparent rounded-full p-1 transition-transform hover:scale-[1.4] hover:-translate-y-1">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <button
          onClick={() => inDetail
            ? document.getElementById('comment-input')?.focus()
            : router.push(`/post/${data.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[.85rem] font-semibold transition-colors hover:bg-[var(--surface2)]"
          style={{ color: 'var(--muted)' }}>
          💬 <span>Comment</span>
        </button>

        {/* View (not in detail) */}
        {!inDetail && (
          <button onClick={() => router.push(`/post/${data.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[.85rem] font-semibold transition-colors hover:bg-[var(--surface2)]"
            style={{ color: 'var(--muted)' }}>
            🔗 <span>View</span>
          </button>
        )}

        {/* Report */}
        <button onClick={() => setShowReport(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[.85rem] font-semibold transition-colors hover:bg-[var(--surface2)] hover:text-red-500"
          style={{ color: 'var(--muted)' }}>
          🚨 <span>Report</span>
        </button>
      </div>

      {/* Inline comments (detail view) */}
      {inDetail && (
        <div className="border-t px-4 pt-3 pb-1" style={{ borderColor: 'var(--border)' }}>
          {(data.comments ?? []).map((c: any) => (
            <div key={c.id} className="flex gap-3 mb-4 animate-fade-in-up">
              <Avatar username={c.authorUsername} avatarColor={c.authorAvatarColor} size={34} fontSize=".6rem" />
              <div className="flex-1">
                <div className="rounded-2xl px-3 py-2" style={{ background: 'var(--surface2)' }}>
                  <div className="font-bold text-[.8rem]" style={{ color: 'var(--text)' }}>{c.authorUsername}</div>
                  <div className="text-[.88rem] leading-snug" style={{ color: 'var(--text)' }}>{c.text}</div>
                </div>
                <div className="text-[.7rem] mt-1 pl-1" style={{ color: 'var(--muted)' }}>{timeAgo(c.createdAt)}</div>
              </div>
            </div>
          ))}
          {!data.comments?.length && (
            <p className="text-[.88rem] py-2" style={{ color: 'var(--muted)' }}>No comments yet. Be the first!</p>
          )}
          {/* Comment input */}
          <div className="flex gap-3 items-end pb-3 mt-2">
            <Avatar username={dbUser.username} avatarColor={dbUser.avatarColor} size={32} fontSize=".6rem" />
            <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-2 border focus-within:border-[var(--accent)] transition-colors"
              style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
              <textarea
                id="comment-input"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() }}}
                placeholder="Write a comment…"
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-[.9rem] resize-none"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}
              />
              <button onClick={submitComment} disabled={!commentText.trim() || submittingComment}
                className="text-[var(--accent)] disabled:opacity-30 text-lg transition-transform hover:scale-110">↑</button>
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>🚨 Report Post</h3>
              <button onClick={() => setShowReport(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>✕</button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Why are you reporting this post?</p>
            {['😡 Harassment or bullying','🗑️ Spam or fake','⚠️ Offensive / inappropriate','❌ Misinformation','🤷 Other reason'].map((r: any) => (
              <button key={r} onClick={() => handleReport(r)}
                className="w-full text-left flex items-center gap-2 px-4 py-3 mb-2 rounded-xl border text-sm font-medium transition-colors hover:border-red-400 hover:text-red-500"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
