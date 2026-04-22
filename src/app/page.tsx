'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDBUser } from '@/hooks/useDBUser'
import Topbar from '@/components/Topbar'
import Sidebar from '@/components/Sidebar'
import PostComposer from '@/components/PostComposer'
import PostCard, { type PostData } from '@/components/PostCard'
import PollWidget from '@/components/PollWidget'
import TrendingSidebar from '@/components/TrendingSidebar'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils'

const TABS = [
  { cat: 'all',      label: 'All' },
  { cat: 'trending', label: '🔥 Trending' },
  ...Object.entries(CATEGORY_LABELS).map(([cat, label]) => ({ cat, label: `${CATEGORY_ICONS[cat]} ${label}` })),
]

export default function FeedPage() {
  const router = useRouter()
  const { dbUser, loading: userLoading } = useDBUser()

  const [posts, setPosts]           = useState<PostData[]>([])
  const [filtered, setFiltered]     = useState<PostData[]>([])
  const [activeFilter, setFilter]   = useState('all')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [newPostsBanner, setNewBanner]  = useState(false)
  const [postsToday, setPostsToday]     = useState(0)
  const prevCountRef = useRef(0)

  /* ── Redirect if not approved ── */
  useEffect(() => {
    if (!userLoading && dbUser && !dbUser.isApproved && !dbUser.isAdmin) {
      router.replace('/pending')
    }
    if (dbUser) setPostsToday((dbUser as any).postsToday ?? 0)
  }, [dbUser, userLoading, router])

  /* ── Fetch posts ── */
  const fetchPosts = useCallback(async (filter = activeFilter, silent = false) => {
    if (!silent) setFetchLoading(true)
    try {
      const url = (filter === 'all' || filter === 'trending')
        ? '/api/posts'
        : `/api/posts?category=${filter}`
      const r = await fetch(url)
      if (!r.ok) return
      const { posts: raw } = await r.json()
      let list: PostData[] = raw

      if (filter === 'trending') {
        list = [...list]
          .map((p: any) => ({ ...p, _score: p.likeCount * 2 + p.commentCount * 1.5 }))
          .sort((a: any, b: any) => b._score - a._score)
      }

      if (silent && list.length > prevCountRef.current) setNewBanner(true)
      prevCountRef.current = list.length
      setPosts(list)
      setFiltered(list)
    } catch (err){
  console.error(err)
}
    setFetchLoading(false)
  }, [activeFilter])

  useEffect(() => { if (dbUser?.isApproved || dbUser?.isAdmin) fetchPosts() }, [dbUser])

  /* ── Real-time polling every 60s ── */
  useEffect(() => {
    const id = setInterval(() => fetchPosts(activeFilter, true), 120000)
    return () => clearInterval(id)
  }, [activeFilter, fetchPosts])

  /* ── Search ── */
  function handleSearch(q: string) {
    if (!q.trim()) { setFiltered(posts); return }
    const lq = q.toLowerCase()
    setFiltered(posts.filter((p: any) =>
      p.title.toLowerCase().includes(lq) ||
      p.body.toLowerCase().includes(lq) ||
      (CATEGORY_LABELS[p.category] ?? p.category).toLowerCase().includes(lq)
    ))
  }

  /* ── Filter tab ── */
  function handleFilter(cat: string) {
    setFilter(cat)
    fetchPosts(cat)
  }

  /* ── Post CRUD handlers ── */
  function handleNewPost(post: PostData) {
    setPosts(ps => [post, ...ps])
    setFiltered(ps => [post, ...ps])
    setPostsToday(n => n + 1)
  }

  function handleUpdatePost(updated: PostData) {
    const update = (ps: PostData[]) => ps.map((p: any) => p.id === updated.id ? { ...p, ...updated } : p)
    setPosts(update); setFiltered(update)
  }

  function handleDeletePost(id: string) {
    const remove = (ps: PostData[]) => ps.filter((p: any) => p.id !== id)
    setPosts(remove); setFiltered(remove)
  }

  /* ── Loading screens ── */
  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center space-y-3">
        <div className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>BCAS Whisper</div>
        <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )

  if (!dbUser) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar dbUser={dbUser} onSearch={handleSearch} onNewPost={() => {}} />

      {/* Real-time new posts banner */}
      {newPostsBanner && (
        <div className="realtime-banner" onClick={() => { setNewBanner(false); fetchPosts() }}>
          ✨ New whispers just dropped — tap to see them
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 flex gap-4 items-start">

        {/* LEFT SIDEBAR — hidden on mobile */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[70px]">
          <div className="rounded-2xl p-3 shadow-sm" style={{ background: 'var(--surface)' }}>
            <Sidebar dbUser={dbUser} activeFilter={activeFilter} onFilter={handleFilter} />
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="flex-1 min-w-0 space-y-3">

          {/* Confession of the Day (top confession by likes) */}
          {(() => {
            const top = posts.filter((p: any) => p.category === 'confession').sort((a,b) => b.likeCount - a.likeCount)[0]
            if (!top) return null
            return (
              <div className="rounded-2xl overflow-hidden cursor-pointer" onClick={() => router.push(`/post/${top.id}`)}
                style={{ background: 'linear-gradient(135deg,#0F0C29,#302B63,#24243E)', color: '#fff' }}>
                <div className="p-4 pt-8 relative">
                  <span className="cod-badge absolute top-3 left-4">✨ Confession of the Day</span>
                  <p className="text-2xl mb-1">🤫</p>
                  <p className="text-sm leading-relaxed opacity-90 line-clamp-3">{top.body}</p>
                  <p className="text-xs mt-2 opacity-50 border-t border-white/10 pt-2">🔒 Anonymous · {top.likeCount} likes</p>
                </div>
              </div>
            )
          })()}

          {/* Poll — shown inline on mobile, sidebar on desktop */}
          
          <div className="lg:hidden">
            <PollWidget dbUser={dbUser} />
          </div>
          {/*streak */}
          {dbUser.streak > 0 && (
          <div
            className="lg:hidden flex items-center gap-3 px-3 py-3 rounded-2xl shadow-sm"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)', color: '#fff' }}
          >
            <span className="text-2xl animate-streak">🔥</span>
            <div>
              <div className="font-extrabold text-[1.05rem]" style={{ fontFamily: 'var(--font-display)' }}>
                {dbUser.streak} day streak
              </div>
              <div className="text-[.75rem] opacity-80">Keep posting to maintain it!</div>
            </div>
          </div>
            )}
            {/*trending and nomination */}
          <div className="xl:hidden">
            <TrendingSidebar dbUser={dbUser} posts={posts} />
          </div>
          {/* Post Composer */}
          <PostComposer dbUser={dbUser} postsToday={postsToday} onPost={handleNewPost} />

          {/* Category filter tabs */}
          <div className="rounded-2xl overflow-x-auto flex gap-1 p-2 shadow-sm" style={{ background: 'var(--surface)' }}>
            {TABS.map(({ cat, label }) => (
              <button key={cat} onClick={() => handleFilter(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeFilter === cat ? 'text-white' : 'hover:bg-[var(--surface2)]'}`}
                style={{
                  background: activeFilter === cat ? 'var(--accent)' : 'transparent',
                  color: activeFilter === cat ? '#fff' : 'var(--muted)',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Posts list */}
          {fetchLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl skeleton-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
              <p className="text-4xl mb-3">👀</p>
              <p className="font-semibold">No whispers here yet</p>
              <p className="text-sm mt-1">Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  dbUser={dbUser}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR — hidden below 1100px */}
        <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-[70px] space-y-4">
          <PollWidget dbUser={dbUser} />
          <TrendingSidebar dbUser={dbUser} posts={posts} />
        </aside>
      </div>

      {/* Mobile FAB */}
      <button className="fab lg:hidden" onClick={() => document.querySelector<HTMLButtonElement>('[data-composer-trigger]')?.click()}>
        +
      </button>
    </div>
  )
}
