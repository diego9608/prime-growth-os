import { NextResponse } from 'next/server'

// In-memory experiments (in production, use database)
let experiments: any[] = [
  {
    id: 'exp-001',
    name: 'LinkedIn Premium Targeting',
    status: 'running',
    hypothesis: 'Architecture decision-makers engage 3x more with case studies',
    metric: 'CTR',
    baseline: 0.02,
    target: 0.06,
    currentValue: 0.045,
    sampleSize: 1000,
    currentSample: 650,
    confidence: 0.82,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.action === 'create') {
      const experiment = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: body.name,
        status: 'designed',
        hypothesis: body.hypothesis,
        metric: body.metric,
        baseline: body.baseline,
        target: body.target,
        sampleSize: body.sampleSize || 1000,
        currentSample: 0,
        confidence: 0,
        startDate: null,
        estimatedCompletion: null,
        recommendationId: body.recommendationId
      }

      experiments.push(experiment)
      return NextResponse.json({ success: true, experiment })
    }

    if (body.action === 'start') {
      const experiment = experiments.find(e => e.id === body.experimentId)
      if (experiment) {
        experiment.status = 'running'
        experiment.startDate = new Date().toISOString()
        experiment.estimatedCompletion = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
      return NextResponse.json({ success: true, experiment })
    }

    if (body.action === 'complete') {
      const experiment = experiments.find(e => e.id === body.experimentId)
      if (experiment) {
        experiment.status = 'completed'
        experiment.endDate = new Date().toISOString()
        experiment.result = body.result
        experiment.decision = body.decision
        experiment.confidence = body.confidence || 0.94
      }
      return NextResponse.json({ success: true, experiment })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to manage experiment' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Calculate batting average
  const completed = experiments.filter(e => e.status === 'completed')
  const successful = completed.filter(e => e.decision === 'roll_out')
  const battingAverage = completed.length > 0 ? successful.length / completed.length : 0

  // Calculate time to value
  const timeToValue = completed
    .filter(e => e.startDate && e.endDate)
    .map(e => (new Date(e.endDate).getTime() - new Date(e.startDate).getTime()) / (1000 * 60 * 60 * 24))
    .reduce((sum, days, _, arr) => sum + days / arr.length, 0)

  return NextResponse.json({
    experiments,
    stats: {
      total: experiments.length,
      running: experiments.filter(e => e.status === 'running').length,
      completed: completed.length,
      battingAverage,
      timeToValue: Math.round(timeToValue)
    }
  })
}