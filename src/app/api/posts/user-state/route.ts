import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isApproved: true, isAdmin: true },
  })

  if (!user?.isApproved && !user?.isAdmin) {
    return NextResponse.json({ error: 'Pending approval' }, { status: 403 })
  }

  const body = await req.json()
  const postIds = Array.isArray(body?.postIds) ? body.postIds : []

  if (!postIds.length) {
    return NextResponse.json({ states: {} })
  }

  const [myLikes, myReactions] = await Promise.all([
    prisma.postLike.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: {
        postId: true,
      },
    }),
    prisma.postReaction.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: {
        postId: true,
        emoji: true,
      },
    }),
  ])

  const likedSet = new Set(myLikes.map((l) => l.postId))
  const reactionMap = new Map(myReactions.map((r) => [r.postId, r.emoji]))

  const states: Record<string, { likedByMe: boolean; myReaction: string | null }> = {}

  for (const postId of postIds) {
    states[postId] = {
      likedByMe: likedSet.has(postId),
      myReaction: reactionMap.get(postId) ?? null,
    }
  }

  return NextResponse.json({ states })
}