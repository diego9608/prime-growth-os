import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const scenario = body.scenario || 'base'

    // Generate executive brief based on scenario
    const brief = {
      bluf: scenario === 'conservative'
        ? 'Revenue growth limited to 8%. Focus on efficiency over expansion. CPQ bottleneck fix = +$85K/year.'
        : scenario === 'optimistic'
        ? 'Revenue growth potential 25%. Aggressive LinkedIn expansion = +60% qualified leads. Full automation = +$200K/year.'
        : 'Revenue growth constrained by CPQ bottleneck. Fix = +$125K/year. LinkedIn reallocation = +40% qualified leads.',

      situation: 'Cuarzo operates in a competitive architecture market with increasing demand for sustainable designs.',

      complication: scenario === 'conservative'
        ? 'Market uncertainty and budget constraints limit growth options.'
        : 'Current CPQ process takes 72+ hours, losing 30% of hot leads to faster competitors.',

      question: 'How can we accelerate quote delivery while maintaining pricing accuracy?',

      answer: scenario === 'conservative'
        ? 'Focus on process optimization and selective automation within current budget.'
        : scenario === 'optimistic'
        ? 'Full CPQ automation plus aggressive channel expansion and team scaling.'
        : 'Implement dynamic pricing engine with pre-approved discount matrices, reducing CPQ to <24 hours.',

      topActions: [
        { action: 'Fix CPQ bottleneck', impact: 125000, confidence: 0.85, timeline: '30 days' },
        { action: 'Reallocate to LinkedIn', impact: 85000, confidence: 0.78, timeline: '7 days' },
        { action: 'Implement chatbot', impact: 45000, confidence: 0.72, timeline: '45 days' },
        { action: 'Optimize SEO content', impact: 35000, confidence: 0.68, timeline: '60 days' },
        { action: 'Launch referral program', impact: 25000, confidence: 0.65, timeline: '14 days' }
      ],

      metrics: {
        currentRevenue: 850000,
        projectedRevenue: scenario === 'conservative' ? 920000 : scenario === 'optimistic' ? 1050000 : 985000,
        currentMargin: 0.28,
        projectedMargin: scenario === 'conservative' ? 0.30 : scenario === 'optimistic' ? 0.38 : 0.34,
        confidence: scenario === 'conservative' ? 0.85 : scenario === 'optimistic' ? 0.65 : 0.78
      },

      generatedAt: new Date().toISOString(),
      model: body.impact > 100000 ? 'opus' : 'sonnet' // LLM router logic
    }

    return NextResponse.json(brief)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate executive brief' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Export endpoint for PDF/MD
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  // Mock brief for export
  const brief = {
    title: 'Strategic Growth Brief - Cuarzo Architecture',
    date: new Date().toLocaleDateString('es-MX'),
    content: `# Strategic Growth Brief

## BLUF
Revenue growth constrained by CPQ bottleneck. Fix = +$125K/year. LinkedIn reallocation = +40% qualified leads.

## Situation
Cuarzo operates in a competitive architecture market with increasing demand for sustainable designs.

## Complication
Current CPQ process takes 72+ hours, losing 30% of hot leads to faster competitors.

## Question
How can we accelerate quote delivery while maintaining pricing accuracy?

## Answer
Implement dynamic pricing engine with pre-approved discount matrices, reducing CPQ to <24 hours.

## Top 5 Actions
1. **Fix CPQ bottleneck** - Impact: $125K/year - Timeline: 30 days
2. **Reallocate to LinkedIn** - Impact: $85K/year - Timeline: 7 days
3. **Implement chatbot** - Impact: $45K/year - Timeline: 45 days
4. **Optimize SEO content** - Impact: $35K/year - Timeline: 60 days
5. **Launch referral program** - Impact: $25K/year - Timeline: 14 days

---
Generated: ${new Date().toISOString()}
Model: Sonnet 3.5 (Cost-optimized)`
  }

  if (format === 'markdown') {
    return new Response(brief.content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="strategic-brief-${Date.now()}.md"`
      }
    })
  }

  return NextResponse.json(brief)
}