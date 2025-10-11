import { NextResponse } from 'next/server'

// In-memory audit log (in production, use database)
let auditLog: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: body.userId || 'user-001',
      userName: body.userName || 'Diego Ramos',
      action: body.action,
      entityType: body.entityType || 'recommendation',
      entityId: body.entityId,
      entityTitle: body.entityTitle,
      reasoning: body.reasoning,
      expectedImpact: body.expectedImpact,
      tags: body.tags || []
    }

    auditLog.push(entry)

    // Keep only last 100 entries in memory
    if (auditLog.length > 100) {
      auditLog = auditLog.slice(-100)
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to log audit entry' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  const limit = parseInt(searchParams.get('limit') || '50')

  const entries = auditLog.slice(-limit).reverse()

  if (format === 'csv') {
    const csv = [
      'Timestamp,User,Action,Entity,Title,Impact,Reasoning',
      ...entries.map(e =>
        `"${e.timestamp}","${e.userName}","${e.action}","${e.entityType}","${e.entityTitle}","${e.expectedImpact?.revenue || 0}","${e.reasoning || ''}"`
      )
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${Date.now()}.csv"`
      }
    })
  }

  // Calculate summary stats
  const summary = {
    totalDecisions: entries.filter(e => ['accept', 'reject', 'defer'].includes(e.action)).length,
    acceptanceRate: entries.filter(e => e.action === 'accept').length / Math.max(entries.filter(e => ['accept', 'reject'].includes(e.action)).length, 1),
    recentEntries: entries.slice(0, 10),
    byAction: entries.reduce((acc, e) => {
      acc[e.action] = (acc[e.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return NextResponse.json({ entries, summary })
}