export const ADJECTIVES = [
  'Sneaky','Cosmic','Velvet','Midnight','Shadow','Neon','Mystic','Silent',
  'Wild','Dreamy','Fuzzy','Chaos','Lunar','Echo','Turbo','Blaze','Crispy',
  'Glitchy','Spicy','Frosted','Savage','Cursed','Phantom','Stormy','Electric',
]
export const ANIMALS = [
  'Panda','Falcon','Otter','Narwhal','Gecko','Moth','Fox','Raven','Llama',
  'Axolotl','Capybara','Platypus','Ferret','Quokka','Mantis','Chameleon',
  'Tapir','Binturong','Kinkajou','Pangolin','Fossa','Numbat','Wallaby','Wombat',
]
export const AVATAR_COLORS = [
  'gradient-purple','gradient-pink','gradient-teal','gradient-orange',
  'gradient-green','gradient-navy','gradient-slate',
]

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function generateUsername() {
  return `${rand(ADJECTIVES)} ${rand(ANIMALS)}`
}
export function randomAvatarColor() {
  return rand(AVATAR_COLORS)
}

export const CATEGORY_LABELS: Record<string, string> = {
  love:'Love', bite:'Back Bitch', tea:'Tea', other:'Others',
  news:'News', confession:'Confession', rateme:'Rate Me', secret:'Secret Reveal',
}

export const CATEGORY_ICONS: Record<string, string> = {
  love:'💗', bite:'🔥', tea:'☕', other:'🫧',
  news:'📰', confession:'🤫', rateme:'⭐', secret:'🔐',
}

export const ALLOWED_REACTIONS = ['😂','🔥','💀','😮','❤️','👍']

export function timeAgo(date: Date | string) {
  const d    = new Date(date)
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function getInitials(name: string) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '??'
}

export const AVATAR_GRADIENTS: Record<string, string> = {
  'gradient-purple': 'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'gradient-pink':   'linear-gradient(135deg,#EC4899,#F9A8D4)',
  'gradient-teal':   'linear-gradient(135deg,#0D9488,#34D399)',
  'gradient-orange': 'linear-gradient(135deg,#EA580C,#FDBA74)',
  'gradient-green':  'linear-gradient(135deg,#15803D,#4ADE80)',
  'gradient-navy':   'linear-gradient(135deg,#2D3748,#7B87A0)',
  'gradient-slate':  'linear-gradient(135deg,#4A5568,#7B87A0)',
}

export function getAvatarGradient(color: string) {
  return AVATAR_GRADIENTS[color] ?? AVATAR_GRADIENTS['gradient-purple']
}

export const DAILY_POST_LIMIT = 2

export const TERMS_TEXT = `
1. Anonymous Identity — All users interact under anonymous usernames. While identities are hidden from other users, the platform securely maintains user data for safety and legal compliance.

2. Conditional Identity Disclosure — User identity may be disclosed only if required by law, legal authorities, or in response to valid legal processes such as court orders or government requests.

3. User Responsibility for Content — Users are solely responsible for any content they post. The platform does not take responsibility for user-generated content.

4. No Platform Liability — BCAS Whisper and its creators are not liable for any legal consequences arising from user-generated content.

5. Prohibited Content — Users must not post: hate speech, defamation, harassment or threats, content promoting animal cruelty, or any degrading content toward individuals or groups.

6. Legal Consequences of Misuse — If any post leads to legal complications, BCAS Whisper reserves the right to cooperate fully with authorities and reveal the identity of the responsible user.

7. Healthy Environment Policy — Any behavior violating community standards may result in content removal or account suspension.

8. Content Moderation Rights — The platform reserves the right to remove, edit, or restrict any content that violates these terms without prior notice.

9. Account Suspension — Users found violating these terms may be restricted, suspended, or permanently banned.

10. Acceptance of Terms — By using BCAS Whisper, users agree to these Terms & Conditions and acknowledge that misuse of anonymity may result in legal action and identity disclosure under applicable laws.
`

export const BLOCKED_WORDS: string[] = []

export function containsBlocked(text: string) {
  const l = text.toLowerCase()
  return BLOCKED_WORDS.some(w => l.includes(w))
}

export const OFFENSIVE_KEYWORDS = ['hate','kill','die','ugly','stupid','loser']

export function isLikelyOffensive(text: string) {
  const l = text.toLowerCase()
  return OFFENSIVE_KEYWORDS.filter(w => l.includes(w)).length >= 2
}
