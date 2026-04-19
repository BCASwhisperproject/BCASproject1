'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDBUser } from '@/hooks/useDBUser'
import toast from 'react-hot-toast'

type User = { id: string; email: string; username: string; avatarColor: string; isAdmin: boolean; isApproved: boolean; createdAt: string }
type Poll = { id: string; title: string; isPublished: boolean; expiresAt: string; _count: { votes: number }; options: { id: string; text: string; _count: { votes: number } }[] }
type Nomination = { id: string; submittedName: string; note: string; createdAt: string; submittedBy: { username: string } }

type Tab = 'users' | 'polls' | 'nominations'

export default function AdminPage() {
  const router = useRouter()
  const { dbUser, loading } = useDBUser()
  const [tab, setTab] = useState<Tab>('users')

  const [users, setUsers] = useState<User[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [fetching, setFetching] = useState(false)

  // New poll form
  const [pollTitle, setPollTitle] = useState('')
  const [pollOptions, setPollOptions] = useState(['', '', '', ''])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && dbUser && !dbUser.isAdmin) router.replace('/')
  }, [dbUser, loading, router])

  useEffect(() => {
    if (!dbUser?.isAdmin) return
    loadTab(tab)
  }, [tab, dbUser])

  async function loadTab(t: Tab) {
    setFetching(true)
    try {
      if (t === 'users') {
        const r = await fetch('/api/admin/users')
        const d = await r.json()
        setUsers(d.users ?? [])
      } else if (t === 'polls') {
        const r = await fetch('/api/admin/polls')
        const d = await r.json()
        setPolls(d.polls ?? [])
      } else {
        const r = await fetch('/api/admin/nominations')
        const d = await r.json()
        setNominations(d.nominations ?? [])
      }
    } catch {}
    setFetching(false)
  }

  async function approveUser(id: string, approve: boolean) {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: approve }),
    })
    if (r.ok) { toast.success(approve ? '✅ User approved' : 'User unapproved'); loadTab('users') }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user and all their content?')) return
    const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('User deleted'); loadTab('users') }
  }

  async function createPoll() {
    if (!pollTitle.trim()) { toast.error('Enter a poll title'); return }
    const opts = pollOptions.filter(o => o.trim())
    if (opts.length < 2) { toast.error('Add at least 2 options'); return }
    setCreating(true)
    const r = await fetch('/api/admin/polls', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: pollTitle, options: opts }),
    })
    if (r.ok) {
      toast.success('Poll created!')
      setPollTitle(''); setPollOptions(['','','',''])
      loadTab('polls')
    } else toast.error('Failed to create poll')
    setCreating(false)
  }

  async function publishPoll(id: string, pub: boolean) {
    const r = await fetch(`/api/admin/polls/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: pub }),
    })
    if (r.ok) { toast.success(pub ? '📊 Poll published!' : 'Poll unpublished'); loadTab('polls') }
  }

  async function deletePoll(id: string) {
    if (!confirm('Archive results and delete this poll?')) return
    const r = await fetch(`/api/admin/polls/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('Poll archived and deleted'); loadTab('polls') }
  }

  async function deleteNomination(id: string) {
    const r = await fetch(`/api/admin/nominations/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('Nomination deleted'); setNominations(ns => ns.filter(n => n.id !== id)) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  )

  if (!dbUser?.isAdmin) return null

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm border outline-none focus:border-[var(--accent)] transition-colors"
  const inputStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface2)]" style={{ color: 'var(--text)' }}>←</button>
        <span className="font-extrabold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>🛡️ Admin Panel</span>
        <div className="flex-1" />
        <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: 'rgba(124,58,237,.12)', color: 'var(--accent)' }}>
          {dbUser.username}
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 rounded-2xl p-2 shadow-sm" style={{ background: 'var(--surface)' }}>
          {(['users','polls','nominations'] as Tab[]).map((t: any) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize"
              style={{
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--muted)',
              }}>
              {t === 'users' ? '👥 Users' : t === 'polls' ? '📊 Polls' : '🗳️ Nominations'}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl skeleton-pulse" />)}</div>
        ) : (
          <>
            {/* ── USERS ── */}
            {tab === 'users' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl p-4 text-center shadow-sm" style={{ background: 'var(--surface)' }}>
                    <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{users.filter((u: any) => !u.isApproved && !u.isAdmin).length}</div>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>Pending Approval</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center shadow-sm" style={{ background: 'var(--surface)' }}>
                    <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{users.length}</div>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>Total Users</div>
                  </div>
                </div>

                {users.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>{u.username}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{u.email}</div>
                      <div className="flex gap-2 mt-1">
                        {u.isAdmin    && <span className="text-[.65rem] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(124,58,237,.12)', color: 'var(--accent)' }}>Admin</span>}
                        {u.isApproved && <span className="text-[.65rem] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,.12)', color: 'var(--green)' }}>Approved</span>}
                        {!u.isApproved && !u.isAdmin && <span className="text-[.65rem] px-2 py-0.5 rounded-full font-bold bg-yellow-100 text-yellow-700">Pending</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!u.isApproved && !u.isAdmin && (
                        <button onClick={() => approveUser(u.id, true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--green)' }}>
                          ✅ Approve
                        </button>
                      )}
                      {u.isApproved && !u.isAdmin && (
                        <button onClick={() => approveUser(u.id, false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-yellow-500">
                          Revoke
                        </button>
                      )}
                      <button onClick={() => deleteUser(u.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── POLLS ── */}
            {tab === 'polls' && (
              <div className="space-y-4">
                {/* Create poll form */}
                <div className="rounded-2xl p-5 shadow-sm space-y-3" style={{ background: 'var(--surface)' }}>
                  <h3 className="font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>➕ Create New Poll</h3>
                  <input value={pollTitle} onChange={e => setPollTitle(e.target.value)} placeholder="Poll question…"
                    className={inputCls} style={inputStyle} />
                  <div className="grid grid-cols-2 gap-2">
                    {pollOptions.map((opt, i) => (
                      <input key={i} value={opt} onChange={e => { const o=[...pollOptions]; o[i]=e.target.value; setPollOptions(o) }}
                        placeholder={`Option ${i+1}${i < 2 ? ' *' : ''}`}
                        className={inputCls} style={inputStyle} />
                    ))}
                  </div>
                  <button onClick={createPoll} disabled={creating}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    {creating ? 'Creating…' : '📊 Create Poll'}
                  </button>
                </div>

                {/* Existing polls */}
                {polls.map((p: any) => (
                  <div key={p.id} className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text)' }}>{p.title}</h4>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          {p._count?.votes ?? 0} votes · Expires {new Date(p.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => publishPoll(p.id, !p.isPublished)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors"
                          style={{ background: p.isPublished ? '#F59E0B' : 'var(--green)' }}>
                          {p.isPublished ? 'Unpublish' : '🚀 Publish'}
                        </button>
                        <button onClick={() => deletePoll(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50">
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {p.options?.map((o: any) => {
                        const total = p.options.reduce((s: number, x: any) => s + (x._count?.votes ?? 0), 0)
                        const pct = total > 0 ? Math.round(((o._count?.votes ?? 0) / total) * 100) : 0
                        return (
                          <div key={o.id} className="relative rounded-xl overflow-hidden border text-sm px-3 py-2"
                            style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                            <div className="poll-bar-fill absolute inset-0 origin-left" style={{ width: `${pct}%`, background: 'rgba(124,58,237,.12)' }} />
                            <span className="relative z-10" style={{ color: 'var(--text)' }}>{o.text}</span>
                            <span className="relative z-10 float-right font-bold" style={{ color: 'var(--accent)' }}>{o._count?.votes ?? 0} ({pct}%)</span>
                          </div>
                        )
                      })}
                    </div>
                    {p.isPublished && <div className="mt-2 text-xs font-semibold" style={{ color: 'var(--green)' }}>● Live — visible to users</div>}
                  </div>
                ))}
              </div>
            )}

            {/* ── NOMINATIONS ── */}
            {tab === 'nominations' && (
              <div className="space-y-3">
                {nominations.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                    <p className="text-4xl mb-2">🗳️</p>
                    <p>No nominations yet</p>
                  </div>
                ) : nominations.map((n: any) => (
                  <div key={n.id} className="flex items-center gap-4 rounded-2xl p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate" style={{ color: 'var(--text)' }}>{n.submittedName}</div>
                      {n.note && <div className="text-sm truncate" style={{ color: 'var(--muted)' }}>{n.note}</div>}
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>by {n.submittedBy?.username} · {new Date(n.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => deleteNomination(n.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
