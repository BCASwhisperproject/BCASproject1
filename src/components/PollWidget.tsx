'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { DBUser } from '@/hooks/useDBUser'

type PollOption = { id: string; text: string; voteCount: number }
type Poll = { id: string; title: string; totalVotes: number; myVoteOptionId: string | null; options: PollOption[] }

interface PollWidgetProps {
  dbUser: DBUser
}

export default function PollWidget({ dbUser }: PollWidgetProps) {
  const [poll, setPoll]       = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting]   = useState(false)

  const fetchPoll = useCallback(async () => {
    try {
      const r = await fetch('/api/polls/active')
      if (r.ok) {
        const d = await r.json()
        setPoll(d.poll)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPoll()
    // Refresh every 30s for live updates
    const interval = setInterval(fetchPoll, 120000)
    return () => clearInterval(interval)
  }, [fetchPoll])

  async function castVote(optionId: string) {
    if (poll?.myVoteOptionId || voting) return
    setVoting(true)
    const r = await fetch(`/api/polls/${poll!.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
    })
    if (r.ok) { toast.success('✅ Vote cast!'); fetchPoll() }
    else toast.error('Vote failed')
    setVoting(false)
  }

  if (loading) return (
    <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
      <div className="skeleton-pulse h-4 w-1/2 mb-3 rounded" />
      <div className="skeleton-pulse h-3 w-full mb-2 rounded" />
      <div className="skeleton-pulse h-10 w-full mb-2 rounded-lg" />
      <div className="skeleton-pulse h-10 w-full rounded-lg" />
    </div>
  )

  if (!poll) return null

  const hasVoted = !!poll.myVoteOptionId

  return (
    <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--green)' }} />
        <span className="text-[.82rem] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Live Poll</span>
      </div>
      <p className="text-[.88rem] mb-3 leading-snug" style={{ color: 'var(--muted)' }}>{poll.title}</p>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map(opt => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0
          const isVoted = poll.myVoteOptionId === opt.id

          return (
            <button key={opt.id}
              onClick={() => castVote(opt.id)}
              disabled={hasVoted || voting}
              className="relative w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm overflow-hidden transition-all text-left"
              style={{
                borderColor: isVoted ? 'var(--accent)' : 'var(--border)',
                color: isVoted ? 'var(--accent)' : 'var(--text)',
                fontWeight: isVoted ? 700 : 400,
                cursor: hasVoted ? 'default' : 'pointer',
                background: 'var(--surface2)',
              }}>
              {/* Progress bar background */}
              {hasVoted && (
                <div className="poll-bar-fill absolute inset-0 origin-left rounded-xl"
                  style={{ width: `${pct}%`, background: 'rgba(124,58,237,.12)', zIndex: 0 }} />
              )}
              <span className="relative z-10">{opt.text}{isVoted ? ' ✓' : ''}</span>
              {hasVoted && <span className="relative z-10 font-bold text-[.82rem]" style={{ color: 'var(--accent)' }}>{pct}%</span>}
            </button>
          )
        })}
      </div>

      <p className="text-[.75rem] mt-2" style={{ color: 'var(--muted)' }}>
        🗳️ {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
        {!hasVoted && ' · Tap to vote'}
      </p>
    </div>
  )
}
