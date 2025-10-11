import { NextResponse } from 'next/server'

// Mock SGP spend optimization (in production, import from @prime-growth-os/sgp)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Mock response with guardrails and optimization
    const response = {
      current: body.current || {
        'Google Ads': 15000,
        'LinkedIn': 8000,
        'Facebook': 12000,
        'SEO': 5000,
        'Email': 3000,
        'Referidos': 7000
      },
      recommended: {
        'Google Ads': 12000,
        'LinkedIn': 14000,
        'Facebook': 8000,
        'SEO': 7000,
        'Email': 4000,
        'Referidos': 5000
      },
      guardrails: {
        capacity: { status: 'ok', message: 'Within CPQ capacity (85% utilization)' },
        rampRate: { status: 'warning', message: 'LinkedIn change exceeds 30% daily limit' },
        pacing: { status: 'ok', message: 'Monthly pacing on track' },
        minimums: { status: 'ok', message: 'All channels meet platform minimums' },
        diversity: { status: 'ok', message: 'Good channel diversification (max 28% concentration)' }
      },
      expectedImpact: {
        revenue: 285000,
        margin: 85500,
        leads: 142,
        roas: 5.7,
        confidence: 0.78
      },
      infeasible: null // or reason if plan can't work
    }

    // Check for infeasibility
    if (body.forceInfeasible) {
      response.infeasible = {
        reason: 'CPQ capacity exceeded by 40%. Cannot process 142 leads/month.',
        suggestions: [
          'Reduce lead generation target to 100 leads/month',
          'Hire additional CPQ specialist (+$60K/year)',
          'Implement CPQ automation tool (-72h to 24h processing)'
        ]
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate spend plan' },
      { status: 500 }
    )
  }
}