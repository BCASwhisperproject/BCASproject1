export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user?.isAdmin ?? false
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const approved = searchParams.get('approved')

  const users = await prisma.user.findMany({
    where: approved === 'false' ? { isApproved: false, isAdmin: false } : approved === 'true' ? { isApproved: true } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ users })
}
