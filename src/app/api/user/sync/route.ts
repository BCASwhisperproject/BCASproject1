export const dynamic = 'force-dynamic'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateUsername, randomAvatarColor } from '@/lib/utils'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const adminIds = (process.env.ADMIN_CLERK_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)
    const isAdmin = adminIds.includes(userId)

    let user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      let username = generateUsername()
      let attempts = 0
      while (attempts < 50) {
        const exists = await prisma.user.findUnique({ where: { username } })
        if (!exists) break
        username = generateUsername()
        attempts++
      }
      user = await prisma.user.create({
        data: { id: userId, email, username, avatarColor: randomAvatarColor(), isAdmin, isApproved: isAdmin },
      })
    } else if (isAdmin && !user.isAdmin) {
      user = await prisma.user.update({ where: { id: userId }, data: { isAdmin: true, isApproved: true } })
    }

    // Update streak
    const today = new Date().toISOString().slice(0,10)
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10)
    const lastActive = user.lastActive?.toISOString().slice(0,10)
    if (lastActive !== today) {
      const newStreak = lastActive === yesterday ? user.streak + 1 : 1
      user = await prisma.user.update({ where: { id: userId }, data: { streak: newStreak, lastActive: new Date() } })
    }

    // Calculate posts today
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const postsToday = await prisma.post.count({ where: { authorId: userId, createdAt: { gte: todayStart } } })

    return NextResponse.json({ user: { ...user, postsToday } })
  } catch (err) {
    console.error('User sync error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
