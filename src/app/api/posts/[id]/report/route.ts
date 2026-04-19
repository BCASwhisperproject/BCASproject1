export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type P = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: P) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reason } = await req.json()
  if (!reason) return NextResponse.json({ error: 'Reason required' }, { status: 400 })

  await prisma.report.upsert({
    where:  { postId_reporterId: { postId: id, reporterId: userId } },
    create: { postId: id, reporterId: userId, reason },
    update: { reason },
  })

  return NextResponse.json({ message: 'Report submitted' })
}
