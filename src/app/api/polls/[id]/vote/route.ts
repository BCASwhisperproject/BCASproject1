export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.isApproved && !user?.isAdmin) return NextResponse.json({ error: 'Pending approval' }, { status: 403 })

  const poll = await prisma.poll.findUnique({ where: { id } })
  if (!poll || poll.expiresAt < new Date()) return NextResponse.json({ error: 'Poll expired or not found' }, { status: 404 })

  const { optionId } = await req.json()
  const option = await prisma.pollOption.findUnique({ where: { id: optionId } })
  if (!option || option.pollId !== id) return NextResponse.json({ error: 'Invalid option' }, { status: 400 })

  await prisma.pollVote.upsert({
    where:  { pollId_userId: { pollId: id, userId } },
    create: { pollId: id, userId, optionId },
    update: { optionId },
  })

  return NextResponse.json({ success: true })
}
