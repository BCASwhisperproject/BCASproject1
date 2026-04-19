export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user?.isAdmin ?? false
}

export async function GET() {
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
  })
  return NextResponse.json({ polls })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, options } = await req.json()
  if (!title || !Array.isArray(options) || options.length < 2)
    return NextResponse.json({ error: 'Title and at least 2 options required' }, { status: 400 })

  // Expire any currently active polls
  await prisma.poll.updateMany({
    where: { isPublished: true, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  })

  const midnight = new Date()
  midnight.setHours(23, 59, 59, 999)

  const poll = await prisma.poll.create({
    data: {
      title, createdById: userId, expiresAt: midnight,
      options: { create: options.filter(Boolean).map((text: string, i: number) => ({ text, sortOrder: i })) },
    },
    include: { options: true },
  })
  return NextResponse.json({ poll }, { status: 201 })
}
