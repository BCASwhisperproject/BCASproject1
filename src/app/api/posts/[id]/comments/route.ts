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

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { body: text.trim(), postId: id, authorId: userId },
    include: { author: { select: { username: true, avatarColor: true } } },
  })
  await prisma.post.update({ where: { id }, data: { hotScore: { increment: 1 } } }).catch(() => {})

  return NextResponse.json({
    comment: {
      id: comment.id, text: comment.body,
      authorUsername: comment.author.username,
      authorAvatarColor: comment.author.avatarColor,
      createdAt: comment.createdAt,
    }
  }, { status: 201 })
}
