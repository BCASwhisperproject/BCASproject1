import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const poll = await prisma.poll.findFirst({
    where: {
      isPublished: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      isPublished: true,
      expiresAt: true,
      options: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          text: true,
          sortOrder: true,
          _count: {
            select: { votes: true },
          },
        },
      },
      votes: {
        where: { userId },
        select: { optionId: true },
        take: 1,
      },
    },
  })

  if (!poll) {
    return NextResponse.json({ poll: null })
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option._count.votes, 0)
  const myVote = poll.votes[0]?.optionId ?? null

  return NextResponse.json({
    poll: {
      id: poll.id,
      title: poll.title,
      isPublished: poll.isPublished,
      expiresAt: poll.expiresAt,
      totalVotes,
      myVoteOptionId: myVote,
      options: poll.options.map((o) => ({
        id: o.id,
        text: o.text,
        sortOrder: o.sortOrder,
        voteCount: o._count.votes,
      })),
    },
  })
}