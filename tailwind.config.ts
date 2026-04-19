import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        // Keep syne/dm aliases for backward compat
        syne: ['Space Grotesk', 'system-ui', 'sans-serif'],
        dm:   ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:       'var(--bg)',
        surface:  'var(--surface)',
        surface2: 'var(--surface2)',
        border:   'var(--border)',
        text:     'var(--text)',
        muted:    'var(--muted)',
        accent:   'var(--accent)',
        green:    'var(--green)',
        gold:     'var(--gold)',
      },
      borderRadius: { xl2: '1rem', xl3: '1.5rem' },
    },
  },
  plugins: [],
}
export default config
