export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function requireAdmin(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } })
  return u?.isAdmin ?? false
}

export async function GET() {
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const nominations = await prisma.nomination.findMany({
    orderBy: { createdAt: 'desc' }, take: 100,
    include: { submittedBy: { select: { username: true } } },
  })
  return NextResponse.json({ nominations })
}
