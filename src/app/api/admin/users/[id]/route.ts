export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

async function requireAdmin(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } })
  return u?.isAdmin ?? false
}

export async function PATCH(req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const data: Record<string, boolean> = {}
  if (body.isApproved !== undefined) data.isApproved = body.isApproved
  if (body.isAdmin    !== undefined) data.isAdmin    = body.isAdmin
  const user = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ user })
}

export async function DELETE(_req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId || !(await requireAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: 'User deleted' })
}
