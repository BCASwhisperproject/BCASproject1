'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDBUser } from '@/hooks/useDBUser'

type RankItem = { id: string; optionText: string; pollTitle: string; voteCount: number; rank: number; archivedAt: string }

const BADGES = [
  { label: '👑 King of Tea',    cls: 'from-yellow-400 to-amber-300 text-yellow-900' },
  { label: '🔥 Viral Whisper',  cls: 'from-red-500 to-orange-400 text-white' },
  { label: '💀 Savage Lord',    cls: 'from-violet-600 to-purple-400 text-white' },
  { label: '🌟 Streak Master',  cls: 'from-emerald-500 to-green-400 text-white' },
]

export default function RankingsPage() {
  const router = useRouter()
  const { dbUser, loading } = useDBUser()
  const [ranking, setRanking] = useState<RankItem[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/polls/ranking')
      .then(r => r.json())
      .then(d => setRanking(d.ranking ?? []))
      .finally(() => setFetching(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  )

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-[var(--surface2)]"
          style={{ color: 'var(--text)' }}>←</button>
        <span className="font-bold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>🏆 Rankings &amp; Badges</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Badges */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
          <h2 className="font-extrabold text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>🎖️ Badges</h2>
          <div className="flex flex-wrap gap-3">
            {BADGES.map(b => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${b.cls} animate-fade-in`}>
                {b.label}
              </span>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>Earn badges by being active, getting reactions, and leading polls.</p>
        </div>

        {/* About leaderboard */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
          <h2 className="font-extrabold text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>🏅 All-Time Leaderboard</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Rankings are saved permanently from all past polls — they never reset.</p>
        </div>

        {/* Ranking list */}
        {fetching ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl skeleton-pulse" />)}
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12 rounded-2xl shadow-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-semibold">No rankings yet</p>
            <p className="text-sm mt-1">Rankings appear once polls expire and results are archived.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-sm animate-fade-in"
                style={{ background: 'var(--surface)' }}>
                <span className="text-2xl w-8 text-center flex-shrink-0">
                  {medals[i] ?? <span className="font-extrabold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--muted)' }}>#{i+1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base truncate" style={{ color: 'var(--text)' }}>{item.optionText}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{item.pollTitle}</div>
                </div>
                <span className="font-extrabold text-[.92rem] flex-shrink-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                  {item.voteCount} votes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
