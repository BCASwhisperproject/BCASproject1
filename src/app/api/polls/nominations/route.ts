export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.isApproved && !user?.isAdmin) return NextResponse.json({ error: 'Pending approval' }, { status: 403 })

  const { submittedName, note } = await req.json()
  if (!submittedName?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const nom = await prisma.nomination.create({
    data: { submittedName: submittedName.trim(), note: note?.trim() ?? '', submittedById: userId },
  })

  return NextResponse.json({ nomination: nom }, { status: 201 })
}
