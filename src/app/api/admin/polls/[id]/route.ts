export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

async function requireAdmin(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } })
  return u?.isAdmin ?? false
}

async function archivePoll(pollId: string) {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } })
  if (!poll) return
  const options = await prisma.pollOption.findMany({
    where: { pollId },
    include: { _count: { select: { votes: true } } },
    orderBy: { votes: { _count: 'desc' } },
  })
  for (let i = 0; i < options.length; i++) {
    await prisma.pollRanking.create({
      data: { optionText: options[i].text, pollTitle: poll.title, voteCount: options[i]._count.votes, rank: i + 1 },
    })
  }
}

export async function PATCH(req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { isPublished } = await req.json()
  const poll = await prisma.poll.update({ where: { id }, data: { isPublished } })
  return NextResponse.json({ poll })
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await archivePoll(id)
  await prisma.poll.delete({ where: { id } })
  return NextResponse.json({ message: 'Poll archived and deleted' })
}
