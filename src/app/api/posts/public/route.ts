import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_CATS = ['GENERAL', 'CONFESSION', 'MEME', 'QUESTION', 'RANT', 'POLL'] as const

export const revalidate = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 30

  const where = {
    isHidden: false,
    ...(category && VALID_CATS.includes(category as any)
      ? { category: category as any }
      : {}),
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    skip: (page - 1) * limit,
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      imageUrl: true,
      isPinned: true,
      isHot: true,
      hotScore: true,
      adminNote: true,
      createdAt: true,
      authorId: true,
      author: {
        select: {
          username: true,
          avatarColor: true,
          isAdmin: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  })

  const postIds = posts.map((p) => p.id)

  const reactionGroups =
  postIds.length > 0
    ? await prisma.postReaction.groupBy({
        by: ['postId', 'emoji'],
        where: {
          postId: { in: postIds },
        },
        _count: {
          _all: true,
        },
      })
    : []

  const reactionCountMap: Record<string, Record<string, number>> = {}

  for (const row of reactionGroups) {
    if (!reactionCountMap[row.postId]) {
      reactionCountMap[row.postId] = {}
    }
    reactionCountMap[row.postId][row.emoji] = row._count._all
  }

  const formatted = posts.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    category: p.category,
    imageUrl: p.imageUrl,
    isPinned: p.isPinned,
    isHot: p.isHot,
    hotScore: p.hotScore,
    adminNote: p.adminNote,
    createdAt: p.createdAt,
    authorId: p.authorId,
    authorUsername: p.author.username,
    authorAvatarColor: p.author.avatarColor,
    isAdminPost: p.author.isAdmin,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    reactions: reactionCountMap[p.id] ?? {},
  }))

  return NextResponse.json({ posts: formatted, page })
}