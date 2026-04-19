'use client'

interface TermsModalProps {
  open: boolean
  onClose: () => void
}

const TERMS = [
  { n: 1, title: 'Anonymous Identity', body: 'All users on BCAS Whisper interact under anonymous usernames. While identities are hidden from other users, the platform securely maintains user data for safety and legal compliance.' },
  { n: 2, title: 'Conditional Identity Disclosure', body: 'User identity may be disclosed only if required by law, legal authorities, or in response to valid legal processes such as court orders or government requests.' },
  { n: 3, title: 'User Responsibility for Content', body: 'Users are solely responsible for any content they post, including confessions, comments, or interactions. The platform does not take responsibility for user-generated content.' },
  { n: 4, title: 'No Platform Liability', body: 'BCAS Whisper and its creators are not liable for any legal consequences arising from user-generated content. The platform is built solely for social interaction, healthy engagement, and entertainment purposes.' },
  { n: 5, title: 'Prohibited Content', body: 'Users must not post: hate speech or abusive content, defamation or false allegations, harassment or threats, content promoting animal cruelty, or any degrading or harmful content toward individuals or groups.' },
  { n: 6, title: 'Legal Consequences of Misuse', body: 'If any post leads to legal complications, BCAS Whisper reserves the right to cooperate fully with authorities and reveal the identity of the responsible user.' },
  { n: 7, title: 'Healthy Environment Policy', body: 'BCAS Whisper is intended to maintain a safe, respectful, and fun environment. Any behavior violating this principle may result in content removal or account suspension.' },
  { n: 8, title: 'Content Moderation Rights', body: 'The platform reserves the right to remove, edit, or restrict any content that violates these terms or is deemed inappropriate without prior notice.' },
  { n: 9, title: 'Account Suspension or Termination', body: 'Users found violating these terms may have their access restricted, suspended, or permanently banned from the platform.' },
  { n: 10, title: 'Acceptance of Terms', body: 'By using BCAS Whisper, users agree to these Terms & Conditions and acknowledge that misuse of anonymity may result in legal action and identity disclosure under applicable laws.' },
]

export default function TermsModal({ open, onClose }: TermsModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up" style={{ background: 'var(--surface)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>📜 Terms &amp; Conditions</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[65vh] px-6 py-5 space-y-5">
          {TERMS.map((t: any) => (
            <div key={t.n}>
              <h3 className="font-bold text-[.92rem] mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                {t.n}. {t.title}
              </h3>
              <p className="text-[.88rem] leading-relaxed" style={{ color: 'var(--muted)' }}>{t.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-xl" style={{ color: 'var(--muted)' }}>Close</button>
          <button onClick={onClose}
            className="text-sm px-5 py-2 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
