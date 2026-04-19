'use client'
import { useState, useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import type { DBUser } from '@/hooks/useDBUser'
import Avatar from './Avatar'
import TermsModal from './TermsModal'

interface TopbarProps {
  dbUser: DBUser
  onSearch: (q: string) => void
  onNewPost: () => void
}

export default function Topbar({ dbUser, onSearch, onNewPost }: TopbarProps) {
  const { signOut } = useClerk()
  const router = useRouter()
  const [dark, setDark]       = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [onlineCount] = useState(() => Math.floor(Math.random() * 30) + 8)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') { document.documentElement.setAttribute('data-theme','dark'); setDark(true) }
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 h-14 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            BCAS Whisper
          </span>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="🔍 Search whispers…"
          onChange={e => onSearch(e.target.value)}
          className="flex-1 max-w-xs rounded-full px-4 py-2 text-sm border outline-none focus:border-[var(--accent)] transition-colors hidden sm:block"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Online */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[.78rem] font-semibold"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--green)' }} />
            {onlineCount} online
          </div>

          {/* Dark mode */}
          <button onClick={toggleDark}
            className="w-9 h-9 rounded-full flex items-center justify-center border text-lg transition-colors hover:bg-[var(--border)]"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            {dark ? '☀️' : '🌙'}
          </button>

          {/* User avatar + dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-[var(--surface2)]">
              <Avatar username={dbUser.username} avatarColor={dbUser.avatarColor} size={34} fontSize=".6rem" />
              <span className="hidden sm:block text-sm font-semibold max-w-[90px] truncate" style={{ color: 'var(--text)' }}>
                {dbUser.username}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 rounded-xl shadow-xl border p-1 min-w-[200px] z-50 animate-fade-in-up"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {dbUser.isAdmin && (
                  <a href="/admin"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--surface2)]"
                    style={{ color: 'var(--text)' }}>
                    🛡️ Admin Panel
                  </a>
                )}
                <a href="/rankings"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--surface2)]"
                  style={{ color: 'var(--text)' }}>
                  🏆 Rankings &amp; Badges
                </a>
                <button onClick={toggleDark}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--surface2)] text-left"
                  style={{ color: 'var(--text)' }}>
                  {dark ? '☀️' : '🌙'} Toggle Dark Mode
                </button>
                <button onClick={() => { setMenuOpen(false); setTermsOpen(true) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--surface2)] text-left"
                  style={{ color: 'var(--text)' }}>
                  📜 Terms &amp; Conditions
                </button>
                <div className="h-px my-1" style={{ background: 'var(--border)' }} />
                <button onClick={() => signOut(() => router.push('/sign-in'))}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  )
}
