export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const poll = await prisma.poll.findFirst({
    where: { isPublished: true, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    include: {
      options: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { votes: true } } },
      },
      votes: { where: { userId }, select: { optionId: true } },
    },
  })

  if (!poll) return NextResponse.json({ poll: null })

  const totalVotes = await prisma.pollVote.count({ where: { pollId: poll.id } })
  const myVote     = poll.votes[0]?.optionId ?? null

  return NextResponse.json({
    poll: {
      id: poll.id, title: poll.title,
      isPublished: poll.isPublished,
      expiresAt: poll.expiresAt,
      totalVotes,
      myVoteOptionId: myVote,
      options: poll.options.map((o: any) => ({
        id: o.id, text: o.text,
        sortOrder: o.sortOrder,
        voteCount: o._count.votes,
      })),
    },
  })
}
