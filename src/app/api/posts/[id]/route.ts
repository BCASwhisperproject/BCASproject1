export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { deleteImage } from '@/lib/cloudinary'

type P = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.isApproved && !user?.isAdmin) return NextResponse.json({ error: 'Pending approval' }, { status: 403 })

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author:    { select: { username: true, avatarColor: true, isAdmin: true, id: true } },
      likes:     { select: { userId: true } },
      reactions: { select: { userId: true, emoji: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { username: true, avatarColor: true } } },
      },
      _count: { select: { likes: true, comments: true } },
    },
  })

  if (!post || (post.isHidden && !user?.isAdmin)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reactions: Record<string, number> = {}
  for (const r of (post.reactions as any[])) reactions[r.emoji] = (reactions[r.emoji] ?? 0) + 1

  return NextResponse.json({
    post: {
      ...post,
      likedByMe:  post.likes.some((l: any) => l.userId === userId),
      myReaction: post.reactions.find((r: any) => r.userId === userId)?.emoji ?? null,
      reactions,
      authorId:         post.authorId,
      authorUsername:   post.author.username,
      authorAvatarColor:post.author.avatarColor,
      isAdminPost:      post.author.isAdmin,
      likeCount:        post._count.likes,
      commentCount:     post._count.comments,
      comments: post.comments.map((c: any) => ({
        id: c.id, text: c.body,
        authorUsername: c.author.username,
        authorAvatarColor: c.author.avatarColor,
        createdAt: c.createdAt,
      })),
    },
  })
}

export async function PATCH(req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (post.authorId !== userId && !user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.title    !== undefined) data.title    = body.title
  if (body.body     !== undefined) data.body     = body.body
  if (user?.isAdmin) {
    if (body.isHidden  !== undefined) data.isHidden  = body.isHidden
    if (body.isPinned  !== undefined) data.isPinned  = body.isPinned
    if (body.adminNote !== undefined) data.adminNote = body.adminNote
  }

  const updated = await prisma.post.update({ where: { id }, data })
  return NextResponse.json({ post: updated })
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (post.authorId !== userId && !user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (post.imagePublicId) await deleteImage(post.imagePublicId).catch(() => {})
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted' })
}
