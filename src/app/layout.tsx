import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'BCAS Whisper',
  description: 'Anonymous campus social — your college, your secrets.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body style={{ margin: 0 }}>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#131520',
                color: '#fff',
                borderRadius: '999px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                fontWeight: '600',
                padding: '0.65rem 1.25rem',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
