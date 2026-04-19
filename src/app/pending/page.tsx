'use client'

export const dynamic = 'force-dynamic'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function PendingPage() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center rounded-2xl p-8 shadow-lg" style={{ background: 'var(--surface)' }}>
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Awaiting Approval
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
          Your account is being reviewed by an admin. You'll have full access to BCAS Whisper once approved. This usually takes a few minutes.
        </p>
        <button
          onClick={() => signOut(() => router.push('/sign-in'))}
          className="w-full py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-[var(--surface2)]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
