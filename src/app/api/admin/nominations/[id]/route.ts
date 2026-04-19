export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

async function requireAdmin(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } })
  return u?.isAdmin ?? false
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.nomination.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted' })
}
