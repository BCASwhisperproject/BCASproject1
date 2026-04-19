'use client'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils'
import type { DBUser } from '@/hooks/useDBUser'
import Avatar from './Avatar'

const CATEGORIES = Object.keys(CATEGORY_LABELS)

interface SidebarProps {
  dbUser: DBUser
  activeFilter: string
  onFilter: (cat: string) => void
}

export default function Sidebar({ dbUser, activeFilter, onFilter }: SidebarProps) {
  return (
    <nav className="flex flex-col gap-1">
      {/* User card */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 cursor-pointer hover:bg-[var(--surface2)] transition-colors">
        <Avatar username={dbUser.username} avatarColor={dbUser.avatarColor} size={38} fontSize=".65rem" />
        <div>
          <div className="font-semibold text-[.92rem]" style={{ color: 'var(--text)' }}>{dbUser.username}</div>
          <div className="text-[.72rem]" style={{ color: 'var(--muted)' }}>Anonymous identity</div>
        </div>
      </div>

      {/* Streak */}
      {dbUser.streak > 0 && (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)', color: '#fff' }}>
          <span className="text-2xl animate-streak">🔥</span>
          <div>
            <div className="font-extrabold text-[1.1rem]" style={{ fontFamily: 'var(--font-display)' }}>{dbUser.streak} day streak</div>
            <div className="text-[.72rem] opacity-80">Keep posting to maintain it!</div>
          </div>
        </div>
      )}

      <p className="text-[.73rem] font-bold uppercase tracking-widest px-3 mt-2 mb-1" style={{ color: 'var(--muted)' }}>Explore</p>

      {/* All & Trending */}
      {[
        { cat: 'all',      icon: '🏠', label: 'All Whispers' },
        { cat: 'trending', icon: '🔥', label: 'Trending Today', badge: 'HOT' },
      ].map(({ cat, icon, label, badge }) => (
        <button key={cat} onClick={() => onFilter(cat)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[.92rem] font-medium transition-colors text-left ${activeFilter === cat ? 'text-[var(--accent)] font-semibold' : 'hover:bg-[var(--surface2)]'}`}
          style={{ background: activeFilter === cat ? 'rgba(124,58,237,.12)' : 'transparent', color: activeFilter === cat ? 'var(--accent)' : 'var(--text)' }}>
          <span className="w-6 text-center text-[1.05rem]">{icon}</span>
          <span className="flex-1">{label}</span>
          {badge && <span className="text-[.7rem] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,.15)', color: 'var(--green)' }}>{badge}</span>}
        </button>
      ))}

      {/* Category filters */}
      {CATEGORIES.map(cat => (
        <button key={cat} onClick={() => onFilter(cat)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[.92rem] font-medium transition-colors text-left ${activeFilter === cat ? 'text-[var(--accent)] font-semibold' : 'hover:bg-[var(--surface2)]'}`}
          style={{ background: activeFilter === cat ? 'rgba(124,58,237,.12)' : 'transparent', color: activeFilter === cat ? 'var(--accent)' : 'var(--text)' }}>
          <span className="w-6 text-center text-[1.05rem]">{CATEGORY_ICONS[cat]}</span>
          {CATEGORY_LABELS[cat]}
        </button>
      ))}

      <div className="h-px my-2" style={{ background: 'var(--border)' }} />
      <a href="/rankings"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[.92rem] font-medium transition-colors hover:bg-[var(--surface2)]"
        style={{ color: 'var(--text)' }}>
        <span className="w-6 text-center">🏆</span> Rankings
      </a>
    </nav>
  )
}
