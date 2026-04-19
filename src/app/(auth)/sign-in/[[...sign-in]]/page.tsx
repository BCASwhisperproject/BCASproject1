import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>BCAS Whisper</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Your college. Your secrets. 100% anonymous.</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
