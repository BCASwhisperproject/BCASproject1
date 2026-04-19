export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ranking = await prisma.pollRanking.findMany({
    orderBy: [{ voteCount: 'desc' }, { archivedAt: 'desc' }],
    take: 20,
  })

  return NextResponse.json({ ranking })
}
