export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId: id, userId } } })
  if (existing) {
    await prisma.postLike.delete({ where: { postId_userId: { postId: id, userId } } })
    await prisma.post.update({ where: { id }, data: { hotScore: { decrement: 2 } } }).catch(() => {})
  } else {
    await prisma.postLike.create({ data: { postId: id, userId } })
    await prisma.post.update({ where: { id }, data: { hotScore: { increment: 2 } } }).catch(() => {})
  }

  const likeCount = await prisma.postLike.count({ where: { postId: id } })
  return NextResponse.json({ likedByMe: !existing, likeCount })
}
