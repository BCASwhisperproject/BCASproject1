'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CATEGORY_LABELS, timeAgo } from '@/lib/utils'
import type { DBUser } from '@/hooks/useDBUser'
import type { PostData } from './PostCard'

interface TrendingSidebarProps {
  dbUser: DBUser
  posts: PostData[]
}

export default function TrendingSidebar({ dbUser, posts }: TrendingSidebarProps) {
  const router = useRouter()
  const [nomName, setNomName] = useState('')
  const [nomNote, setNomNote] = useState('')
  const [nomLoading, setNomLoading] = useState(false)

  const trending = [...posts]
    .map((p: any) => ({ ...p, score: p.likeCount * 2 + p.commentCount * 1.5 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  async function submitNomination() {
    if (!nomName.trim()) return
    setNomLoading(true)
    const r = await fetch('/api/polls/nominations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submittedName: nomName, note: nomNote }),
    })
    if (r.ok) {
      toast.success('🗳️ Nomination submitted!')
      setNomName(''); setNomNote('')
    } else {
      toast.error('Could not submit nomination')
    }
    setNomLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Trending */}
      <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
        <h3 className="font-bold text-[.9rem] mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          🔥 Trending Today
        </h3>
        {trending.length === 0 ? (
          <p className="text-[.8rem] text-center py-2" style={{ color: 'var(--muted)' }}>No trending posts yet</p>
        ) : (
          <div className="space-y-1">
            {trending.map((p, i) => (
              <button key={p.id} onClick={() => router.push(`/post/${p.id}`)}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors hover:bg-[var(--surface2)]">
                <span className="font-extrabold text-[.8rem] w-5 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[.85rem] truncate" style={{ color: 'var(--text)' }}>{p.title}</div>
                  <div className="text-[.72rem]" style={{ color: 'var(--muted)' }}>❤️ {p.likeCount} · 💬 {p.commentCount}</div>
                </div>
                <span className="text-[.68rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,.12)', color: 'var(--accent)' }}>
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nominations */}
      <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
        <h3 className="font-bold text-[.9rem] mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>🗳️ Nominate for Poll</h3>
        <input value={nomName} onChange={e => setNomName(e.target.value)} placeholder="Name or alias" maxLength={80}
          className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2 focus:border-[var(--accent)] transition-colors"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        <input value={nomNote} onChange={e => setNomNote(e.target.value)} placeholder="Reason (optional)" maxLength={200}
          className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-3 focus:border-[var(--accent)] transition-colors"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        <button onClick={submitNomination} disabled={!nomName.trim() || nomLoading}
          className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
          {nomLoading ? 'Submitting…' : 'Submit Nomination'}
        </button>
      </div>

      {/* About */}
      <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
        <h3 className="font-bold text-[.88rem] mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>About BCAS Whisper</h3>
        <p className="text-[.8rem] leading-relaxed" style={{ color: 'var(--muted)' }}>An anonymous space for the BCAS community. Be real. Be kind.</p>
        <div className="mt-2 text-[.72rem]" style={{ color: 'var(--muted)' }}>
          Privacy · Terms · Help
        </div>
      </div>
    </div>
  )
}
