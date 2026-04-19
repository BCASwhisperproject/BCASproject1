'use client'
import { getAvatarGradient, getInitials } from '@/lib/utils'

interface AvatarProps {
  username: string
  avatarColor: string
  size?: number
  fontSize?: string
  className?: string
}

export default function Avatar({ username, avatarColor, size = 42, fontSize = '0.7rem', className = '' }: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 font-display ${className}`}
      style={{
        width: size,
        height: size,
        background: getAvatarGradient(avatarColor),
        fontSize,
      }}
    >
      {getInitials(username)}
    </div>
  )
}
