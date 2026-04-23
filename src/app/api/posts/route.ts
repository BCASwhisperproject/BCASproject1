export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'
import { containsBlocked, DAILY_POST_LIMIT, CATEGORY_LABELS } from '@/lib/utils'

const VALID_CATS = Object.keys(CATEGORY_LABELS)

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.isApproved && !user?.isAdmin) {
    return NextResponse.json({ error: 'Pending approval' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 30

  const where = {
    isHidden: false,
    ...(category && VALID_CATS.includes(category) ? { category: category as any } : {}),
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
      isHidden: true,
      adminNote: true,
      createdAt: true,
      authorId: true,
      author: {
        select: {
          id: true,
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

  if (postIds.length === 0) {
    return NextResponse.json({ posts: [], page })
  }

  const myLikes = await prisma.postLike.findMany({
    where: {
      userId,
      postId: { in: postIds },
    },
    select: {
      postId: true,
    },
  })

  const myReactions = await prisma.postReaction.findMany({
    where: {
      userId,
      postId: { in: postIds },
    },
    select: {
      postId: true,
      emoji: true,
    },
  })

  
  const reactionGroups = await prisma.postReaction.groupBy({
    by: ['postId', 'emoji'],
    where: {
      postId: { in: postIds },
    },
    _count: {
      emoji: true,
    },
  })

  const likedPostIds = new Set(myLikes.map((l) => l.postId))
  const myReactionMap = new Map(myReactions.map((r) => [r.postId, r.emoji]))

  const reactionCountMap: Record<string, Record<string, number>> = {}

  for (const row of reactionGroups) {
    if (!reactionCountMap[row.postId]) {
      reactionCountMap[row.postId] = {}
    }
    reactionCountMap[row.postId][row.emoji] = row._count.emoji
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
    isHidden: p.isHidden,
    adminNote: p.adminNote,
    createdAt: p.createdAt,
    authorId: p.authorId,
    authorUsername: p.author.username,
    authorAvatarColor: p.author.avatarColor,
    isAdminPost: p.author.isAdmin,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: likedPostIds.has(p.id),
    myReaction: myReactionMap.get(p.id) ?? null,
    reactions: reactionCountMap[p.id] ?? {},
    comments: [],
  }))

  return NextResponse.json({ posts: formatted, page })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.isApproved && !user?.isAdmin) return NextResponse.json({ error: 'Pending approval' }, { status: 403 })

  // Daily limit
  if (!user.isAdmin) {
    const today = new Date(); today.setHours(0,0,0,0)
    const count = await prisma.post.count({ where: { authorId: userId, createdAt: { gte: today } } })
    if (count >= DAILY_POST_LIMIT) return NextResponse.json({ error: `Daily limit of ${DAILY_POST_LIMIT} posts reached` }, { status: 429 })
  }

  const form = await req.formData()
  const title      = (form.get('title') as string)?.trim()
  const body       = (form.get('body')  as string)?.trim()
  const category   = (form.get('category') as string)?.trim()
  const imageBase64 = form.get('imageBase64') as string | null

  if (!title || !body || !category) return NextResponse.json({ error: 'Title, body, and category required' }, { status: 400 })
  if (!VALID_CATS.includes(category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  if (containsBlocked(`${title} ${body}`)) return NextResponse.json({ error: 'Post contains blocked words' }, { status: 400 })

  let imageUrl: string | undefined, imagePublicId: string | undefined
  if (imageBase64 && imageBase64.startsWith('data:image')) {
    try {
      const uploaded = await uploadImage(imageBase64)
      imageUrl      = uploaded.url
      imagePublicId = uploaded.publicId
    } catch (e) { console.error('Cloudinary upload error:', e) }
  }

  const post = await prisma.post.create({
    data: { title, body, category: category as any, imageUrl, imagePublicId, authorId: userId },
    include: { author: { select: { id: true, username: true, avatarColor: true, isAdmin: true } }, _count: { select: { comments: true, likes: true } } },
  })

  return NextResponse.json({
    post: {
      id: post.id, title: post.title, body: post.body, category: post.category,
      imageUrl: post.imageUrl, isPinned: post.isPinned, isHot: post.isHot,
      hotScore: post.hotScore, isHidden: post.isHidden, adminNote: post.adminNote,
      createdAt: post.createdAt, authorId: post.authorId,
      authorUsername: post.author.username, authorAvatarColor: post.author.avatarColor,
      isAdminPost: post.author.isAdmin,
      likeCount: 0, commentCount: 0, likedByMe: false, myReaction: null, reactions: {}, comments: [],
    }
  }, { status: 201 })
}
