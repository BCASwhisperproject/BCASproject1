'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useDBUser } from '@/hooks/useDBUser'
import PostCard, { type PostData } from '@/components/PostCard'
import Avatar from '@/components/Avatar'

export default function PostPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { dbUser, loading: userLoading } = useDBUser()
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!dbUser) return
    fetch(`/api/posts/${id}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null } return r.json() })
      .then(d => { if (d) setPost(d.post) })
      .finally(() => setLoading(false))
  }, [id, dbUser])

  if (userLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  )

  if (notFound || !dbUser) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <p className="text-4xl mb-3">🫥</p>
        <p className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Post not found</p>
        <button onClick={() => router.push('/')} className="text-sm px-4 py-2 rounded-xl font-semibold text-white mt-2" style={{ background: 'var(--accent)' }}>← Back to feed</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors hover:bg-[var(--surface2)]"
          style={{ color: 'var(--text)' }}>←</button>
        <span className="font-bold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Post</span>
        <div className="flex-1" />
        <Avatar username={dbUser.username} avatarColor={dbUser.avatarColor} size={32} fontSize=".6rem" />
      </header>

      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4">
        {post && (
          <PostCard
            post={post}
            dbUser={dbUser}
            inDetail
            onUpdate={updated => setPost(p => p ? { ...p, ...updated } : p)}
            onDelete={() => router.push('/')}
          />
        )}
      </div>
    </div>
  )
}
