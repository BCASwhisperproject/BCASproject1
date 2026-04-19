export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ALLOWED_REACTIONS } from '@/lib/utils'

type P = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { emoji } = await req.json()
  if (!ALLOWED_REACTIONS.includes(emoji)) return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })

  await prisma.postReaction.upsert({
    where:  { postId_userId: { postId: id, userId } },
    create: { postId: id, userId, emoji },
    update: { emoji },
  })
  await prisma.post.update({ where: { id }, data: { hotScore: { increment: 1 } } }).catch(() => {})

  const rxns = await prisma.postReaction.findMany({ where: { postId: id }, select: { emoji: true } })
  const reactions: Record<string, number> = {}
  for (const r of rxns) reactions[r.emoji] = (reactions[r.emoji] ?? 0) + 1

  return NextResponse.json({ reactions, myReaction: emoji })
}
