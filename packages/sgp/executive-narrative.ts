/**
 * Executive Narrative Generator
 * Transforms complex data into clear, actionable executive communications
 */

import type {
  ExecutiveNarrative,
  KPISnapshot,
  Insight,
  Action,
  Recommendation,
  Bottleneck,
  SpendPlan,
  DateRange,
  Confidence
} from './types';

// ============================================================================
// NARRATIVE GENERATION ENGINE
// ============================================================================

export class ExecutiveNarrativeGenerator {
  /**
   * Generates BLUF (Bottom Line Up Front) executive summary
   */
  generateBLUF(params: {
    primaryRecommendation: Recommendation;
    expectedImpact: ImpactEstimate;
    timeframe: number;  // days
    confidence: number;  // 0-1
    topRisk?: RiskFactor;
    evidenceCount: number;
  }): string {
    const { primaryRecommendation, expectedImpact, timeframe, confidence, topRisk, evidenceCount } = params;

    // Format impact
    let impactSummary = '';
    if (expectedImpact.revenue?.deltaPercent) {
      impactSummary = `increase revenue ${expectedImpact.revenue.deltaPercent.toFixed(0)}%`;
    } else if (expectedImpact.margin?.delta) {
      impactSummary = `improve margin ${expectedImpact.margin.delta.toFixed(1)} percentage points`;
    } else if (expectedImpact.velocity?.deltaPercent) {
      impactSummary = `accelerate delivery ${Math.abs(expectedImpact.velocity.deltaPercent).toFixed(0)}%`;
    } else {
      impactSummary = 'drive measurable improvement';
    }

    // Build BLUF
    const bluf = `
BOTTOM LINE: ${primaryRecommendation.title} will ${impactSummary} within ${timeframe} days.

ACTION REQUIRED: ${primaryRecommendation.actions[0]?.label || 'Review and approve implementation plan'}

RISK: ${topRisk ? `${topRisk.description} (${topRisk.probability} probability, ${topRisk.impact} impact)` : 'Minimal identified risks'}
MITIGATION: ${topRisk?.mitigation || 'Standard monitoring and rollback procedures'}

CONFIDENCE: ${(confidence * 100).toFixed(0)}% based on ${evidenceCount} data points

NEXT STEPS:
1. ${primaryRecommendation.actions[0]?.label || 'Initiate implementation'}
2. ${primaryRecommendation.actions[1]?.label || 'Set up tracking metrics'}
3. ${primaryRecommendation.actions[2]?.label || 'Schedule review checkpoint'}
`.trim();

    return bluf;
  }

  /**
   * Generates a complete executive narrative from current state
   */
  generateNarrative(params: {
    period: DateRange;
    kpis: KPISnapshot[];
    insights: Insight[];
    recommendations: Recommendation[];
    bottlenecks: Bottleneck[];
    spendPlans?: SpendPlan[];
  }): ExecutiveNarrative {
    const { period, kpis, insights, recommendations, bottlenecks, spendPlans } = params;

    // Analyze current state
    const analysis = this.analyzeCurrentState(kpis, insights, bottlenecks);

    // Generate narrative sections
    const situation = this.generateSituation(analysis, kpis);
    const complication = this.generateComplication(analysis, insights);
    const question = this.generateQuestion(analysis);
    const answer = this.generateAnswer(recommendations, spendPlans);

    // Prioritize actions
    const prioritizedActions = this.prioritizeActions(recommendations);
    const immediateActions = this.extractImmediateActions(prioritizedActions);
    const plannedActions = this.extractPlannedActions(prioritizedActions);
    const strategicConsiderations = this.extractStrategicConsiderations(insights, recommendations);

    // Determine confidence level
    const confidence = this.calculateOverallConfidence(recommendations);

    return {
      id: `narrative-${Date.now()}`,
      period,
      generatedAt: new Date(),
      situation,
      complication,
      question,
      answer,
      keyMetrics: this.selectKeyMetrics(kpis),
      topInsights: this.selectTopInsights(insights),
      prioritizedActions: prioritizedActions.slice(0, 5),
      immediateActions,
      plannedActions,
      strategicConsiderations,
      confidence
    };
  }

  /**
   * Analyzes current state to identify key themes
   */
  private analyzeCurrentState(
    kpis: KPISnapshot[],
    insights: Insight[],
    bottlenecks: Bottleneck[]
  ): StateAnalysis {
    // Categorize KPI trends
    const improving = kpis.filter(k => k.trend === 'improving');
    const declining = kpis.filter(k => k.trend === 'declining');
    const stable = kpis.filter(k => k.trend === 'stable');

    // Identify critical issues
    const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
    const highRiskInsights = insights.filter(i => i.category === 'risk');
    const opportunities = insights.filter(i => i.category === 'opportunity');

    // Calculate overall health
    const healthScore = this.calculateHealthScore(kpis);

    // Determine primary focus
    let primaryFocus: 'growth' | 'efficiency' | 'risk' | 'transformation';
    if (criticalBottlenecks.length > 0 || declining.length > improving.length) {
      primaryFocus = 'risk';
    } else if (opportunities.length > 2 && healthScore > 70) {
      primaryFocus = 'growth';
    } else if (bottlenecks.length > 3) {
      primaryFocus = 'efficiency';
    } else {
      primaryFocus = 'transformation';
    }

    return {
      improving,
      declining,
      stable,
      criticalBottlenecks,
      highRiskInsights,
      opportunities,
      healthScore,
      primaryFocus
    };
  }

  /**
   * Generates the Situation section (What's happening)
   */
  private generateSituation(analysis: StateAnalysis, kpis: KPISnapshot[]): string {
    const { healthScore, improving, declining, primaryFocus } = analysis;

    // Lead with health status
    let opening: string;
    if (healthScore > 80) {
      opening = 'The business is performing strongly across key metrics.';
    } else if (healthScore > 60) {
      opening = 'Business performance shows mixed signals requiring attention.';
    } else {
      opening = 'Several critical metrics are underperforming and need immediate intervention.';
    }

    // Add specific metric context
    const topMetric = kpis.find(k => k.kpi.category === 'financial') || kpis[0];
    const metricContext = topMetric
      ? `${topMetric.kpi.name} is at ${this.formatMetric(topMetric)}, ${
          topMetric.trend === 'improving' ? 'up' : topMetric.trend === 'declining' ? 'down' : 'flat'
        } ${Math.abs(topMetric.trendMagnitude).toFixed(1)}% from last period.`
      : '';

    // Add operational context based on focus
    let operationalContext: string;
    switch (primaryFocus) {
      case 'growth':
        operationalContext = `Growth opportunities are emerging with ${analysis.opportunities.length} high-potential initiatives identified.`;
        break;
      case 'efficiency':
        operationalContext = `Operational efficiency is constrained by ${analysis.criticalBottlenecks.length} critical bottlenecks impacting throughput.`;
        break;
      case 'risk':
        operationalContext = `Risk indicators suggest immediate action needed on ${declining.length} declining metrics.`;
        break;
      default:
        operationalContext = 'The organization is at an inflection point requiring strategic choices.';
    }

    return `${opening} ${metricContext} ${operationalContext}`;
  }

  /**
   * Generates the Complication section (Risk or opportunity)
   */
  private generateComplication(analysis: StateAnalysis, insights: Insight[]): string {
    const { criticalBottlenecks, highRiskInsights, opportunities, primaryFocus } = analysis;

    // Identify the most pressing complication
    if (criticalBottlenecks.length > 0) {
      const topBottleneck = criticalBottlenecks[0];
      const impact = Math.round(topBottleneck.costOfDelay / 1000);
      return `The ${topBottleneck.stage.name} bottleneck is costing $${impact}K/month in delays and lost opportunities. Without intervention, this will compound to $${impact * 3}K by quarter end.`;
    }

    if (highRiskInsights.length > 0) {
      const topRisk = highRiskInsights[0];
      return `${topRisk.title} poses a significant threat to planned growth. Early indicators suggest ${topRisk.summary.toLowerCase()}`;
    }

    if (opportunities.length > 0) {
      const topOpp = opportunities[0];
      return `A ${topOpp.title.toLowerCase()} could unlock significant value. The window to act is limited as ${topOpp.evidence[0]?.description || 'market conditions are shifting'}.`;
    }

    // Default complication
    return 'Competitive pressure is intensifying while internal capabilities lag market demands. The gap between current and required performance is widening.';
  }

  /**
   * Generates the Question section (Key decision)
   */
  private generateQuestion(analysis: StateAnalysis): string {
    const { primaryFocus, healthScore } = analysis;

    switch (primaryFocus) {
      case 'growth':
        return 'Should we accelerate growth investments or strengthen foundations first?';
      case 'efficiency':
        return 'Do we fix bottlenecks incrementally or pursue system-wide transformation?';
      case 'risk':
        return 'How aggressively should we mitigate risks versus maintaining growth momentum?';
      case 'transformation':
        return 'Is now the time for bold strategic moves or measured optimization?';
      default:
        return healthScore > 70
          ? 'How do we capitalize on our strong position to create sustainable competitive advantage?'
          : 'What immediate actions will stabilize performance and create momentum?';
    }
  }

  /**
   * Generates the Answer section (Recommendation with trade-offs)
   */
  private generateAnswer(recommendations: Recommendation[], spendPlans?: SpendPlan[]): string {
    if (recommendations.length === 0) {
      return 'Continue monitoring while gathering more data for informed decision-making. Set triggers for action at defined thresholds. Review again in 7 days with additional context.';
    }

    // Get top recommendation
    const topRec = recommendations[0];
    const impact = this.summarizeImpact(topRec.expectedImpact);

    // Build recommendation
    let recommendation = `Implement "${topRec.title}" to ${impact}.`;

    // Add spend reallocation if available
    if (spendPlans && spendPlans.length > 0) {
      const plan = spendPlans[0];
      const topShift = plan.allocations.sort((a, b) =>
        Math.abs(b.recommendedPercent - b.currentPercent) -
        Math.abs(a.recommendedPercent - a.currentPercent)
      )[0];
      recommendation += ` Reallocate ${Math.abs(topShift.recommendedPercent - topShift.currentPercent).toFixed(0)}% of marketing spend to ${topShift.channel.name}.`;
    }

    // Add trade-offs
    const tradeoff = topRec.risks[0]
      ? ` Trade-off: ${topRec.risks[0].description.toLowerCase()}, mitigated by ${topRec.risks[0].mitigation?.toLowerCase() || 'careful execution'}.`
      : ' Minimal downside risk identified.';

    return recommendation + tradeoff;
  }

  /**
   * Prioritizes actions across all recommendations
   */
  private prioritizeActions(recommendations: Recommendation[]): Action[] {
    const allActions: Action[] = [];

    for (const rec of recommendations) {
      for (const action of rec.actions) {
        allActions.push({
          ...action,
          // Add metadata for prioritization
          _priority: rec.priority,
          _confidence: rec.confidence,
          _impact: this.estimateActionImpact(rec.expectedImpact)
        } as Action & ActionMeta);
      }
    }

    // Sort by composite score
    return allActions.sort((a, b) => {
      const scoreA = this.calculateActionScore(a as Action & ActionMeta);
      const scoreB = this.calculateActionScore(b as Action & ActionMeta);
      return scoreB - scoreA;
    });
  }

  /**
   * Extracts immediate actions (this week)
   */
  private extractImmediateActions(actions: Action[]): string[] {
    return actions
      .filter(a => a.type === 'immediate')
      .slice(0, 3)
      .map(a => a.label);
  }

  /**
   * Extracts planned actions (this month)
   */
  private extractPlannedActions(actions: Action[]): string[] {
    return actions
      .filter(a => a.type === 'planned')
      .slice(0, 3)
      .map(a => a.label);
  }

  /**
   * Extracts strategic considerations (this quarter)
   */
  private extractStrategicConsiderations(insights: Insight[], recommendations: Recommendation[]): string[] {
    const considerations: string[] = [];

    // Add insight-driven considerations
    const trendInsights = insights.filter(i => i.category === 'trend');
    if (trendInsights.length > 0) {
      considerations.push(`Monitor emerging trend: ${trendInsights[0].title}`);
    }

    // Add assumption-driven considerations
    const criticalAssumptions = recommendations
      .flatMap(r => r.assumptions)
      .filter((a, i, arr) => arr.indexOf(a) === i)  // Unique
      .slice(0, 2);

    for (const assumption of criticalAssumptions) {
      considerations.push(`Validate assumption: ${assumption}`);
    }

    // Add capability considerations
    if (recommendations.some(r => r.actions.some(a => a.estimatedEffort && a.estimatedEffort > 100))) {
      considerations.push('Build internal capabilities for complex implementations');
    }

    return considerations.slice(0, 3);
  }

  /**
   * Selects most important KPIs for narrative
   */
  private selectKeyMetrics(kpis: KPISnapshot[]): KPISnapshot[] {
    // Prioritize by category and trend
    const priorityOrder: Record<string, number> = {
      'financial': 1,
      'conversion': 2,
      'acquisition': 3,
      'delivery': 4,
      'operational': 5
    };

    return kpis
      .sort((a, b) => {
        // First by category priority
        const catDiff = (priorityOrder[a.kpi.category] || 10) - (priorityOrder[b.kpi.category] || 10);
        if (catDiff !== 0) return catDiff;

        // Then by trend magnitude (bigger changes first)
        return Math.abs(b.trendMagnitude) - Math.abs(a.trendMagnitude);
      })
      .slice(0, 5);
  }

  /**
   * Selects most important insights
   */
  private selectTopInsights(insights: Insight[]): Insight[] {
    // Score insights by importance
    const scored = insights.map(insight => ({
      insight,
      score: this.scoreInsight(insight)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.insight);
  }

  /**
   * Calculates overall confidence level
   */
  private calculateOverallConfidence(recommendations: Recommendation[]): Confidence {
    if (recommendations.length === 0) return 'low';

    const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;

    if (avgConfidence > 0.8) return 'high';
    if (avgConfidence > 0.6) return 'medium';
    return 'low';
  }

  /**
   * Helper: Calculate health score from KPIs
   */
  private calculateHealthScore(kpis: KPISnapshot[]): number {
    if (kpis.length === 0) return 50;

    let score = 50;  // Baseline

    for (const kpi of kpis) {
      // Adjust based on trend
      if (kpi.trend === 'improving') score += 5;
      if (kpi.trend === 'declining') score -= 5;

      // Adjust based on target achievement (if available)
      if (kpi.kpi.targetValue) {
        const achievement = kpi.value / kpi.kpi.targetValue;
        if (achievement >= 1) score += 3;
        if (achievement < 0.8) score -= 5;
      }

      // Adjust based on critical thresholds
      if (kpi.kpi.criticalThreshold && kpi.value < kpi.kpi.criticalThreshold) {
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Helper: Format metric for display
   */
  private formatMetric(snapshot: KPISnapshot): string {
    const { value, kpi } = snapshot;

    switch (kpi.format) {
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return `$${(value / 1000).toFixed(0)}K`;
      case 'days':
        return `${value.toFixed(1)} days`;
      default:
        return value.toFixed(1);
    }
  }

  /**
   * Helper: Summarize impact for narrative
   */
  private summarizeImpact(impact: ImpactEstimate): string {
    const impacts: string[] = [];

    if (impact.revenue) {
      impacts.push(`increase revenue ${impact.revenue.deltaPercent.toFixed(0)}%`);
    }
    if (impact.margin) {
      impacts.push(`improve margin ${impact.margin.delta.toFixed(1)}pp`);
    }
    if (impact.velocity) {
      impacts.push(`accelerate delivery ${Math.abs(impact.velocity.deltaPercent).toFixed(0)}%`);
    }

    return impacts.join(', ') || 'drive measurable improvement';
  }

  /**
   * Helper: Estimate action impact magnitude
   */
  private estimateActionImpact(impact: ImpactEstimate): number {
    let score = 0;

    if (impact.revenue) score += Math.abs(impact.revenue.deltaPercent);
    if (impact.margin) score += Math.abs(impact.margin.deltaPercent) * 2;  // Margin weighted higher
    if (impact.velocity) score += Math.abs(impact.velocity.deltaPercent) * 0.5;

    return score;
  }

  /**
   * Helper: Calculate action priority score
   */
  private calculateActionScore(action: Action & ActionMeta): number {
    const urgencyScore = action.type === 'immediate' ? 10 : action.type === 'planned' ? 5 : 1;
    const impactScore = action._impact || 0;
    const confidenceScore = (action._confidence || 0.5) * 10;
    const effortScore = action.estimatedEffort ? 100 / action.estimatedEffort : 5;

    return urgencyScore + impactScore + confidenceScore + effortScore;
  }

  /**
   * Helper: Score insight importance
   */
  private scoreInsight(insight: Insight): number {
    let score = 0;

    // Category scoring
    if (insight.category === 'risk') score += 20;
    if (insight.category === 'opportunity') score += 15;
    if (insight.category === 'bottleneck') score += 10;

    // Confidence scoring
    if (insight.confidence === 'high') score += 10;
    if (insight.confidence === 'medium') score += 5;

    // Evidence scoring
    score += insight.evidence.length * 2;

    // Recency scoring
    const hoursSinceDetection = (Date.now() - insight.evidence[0]?.detectedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDetection < 24) score += 10;
    if (hoursSinceDetection < 168) score += 5;

    return score;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface StateAnalysis {
  improving: KPISnapshot[];
  declining: KPISnapshot[];
  stable: KPISnapshot[];
  criticalBottlenecks: Bottleneck[];
  highRiskInsights: Insight[];
  opportunities: Insight[];
  healthScore: number;
  primaryFocus: 'growth' | 'efficiency' | 'risk' | 'transformation';
}

interface ActionMeta {
  _priority?: number;
  _confidence?: number;
  _impact?: number;
}

// ============================================================================
// TEMPLATE LIBRARY
// ============================================================================

export class NarrativeTemplates {
  /**
   * Growth-focused narrative template
   */
  static growthTemplate(): Partial<ExecutiveNarrative> {
    return {
      situation: 'Core business metrics are stable with emerging growth signals. Market conditions favor expansion with 3 qualified opportunities in pipeline.',
      complication: 'Competition is accelerating while our sales cycle remains 40% longer than industry average. First-mover advantage window closing in 60 days.',
      question: 'Should we optimize current operations or aggressively pursue growth opportunities?',
      answer: 'Pursue targeted growth in highest-margin segments while running parallel efficiency initiatives. Accept short-term operational strain for 25% revenue upside.'
    };
  }

  /**
   * Turnaround narrative template
   */
  static turnaroundTemplate(): Partial<ExecutiveNarrative> {
    return {
      situation: 'Multiple KPIs trending negative for 2+ quarters. Cash position adequate but declining. Team morale impacted by uncertainty.',
      complication: 'Current trajectory leads to crisis point in 90 days. Major client renewal at risk. Competitor actively recruiting our top talent.',
      question: 'Do we cut deep to preserve runway or invest to reverse the trend?',
      answer: 'Implement 30-day stabilization plan focusing on client retention and quick wins. Defer growth investments until baseline metrics recover.'
    };
  }

  /**
   * Efficiency narrative template
   */
  static efficiencyTemplate(): Partial<ExecutiveNarrative> {
    return {
      situation: 'Revenue growing steadily but margins compressed by operational inefficiencies. Process bottlenecks limiting scale.',
      complication: 'Manual processes consuming 40% more resources than needed. Quality issues causing 15% rework. Customer satisfaction declining.',
      question: 'Should we automate aggressively or improve processes incrementally?',
      answer: 'Launch phased automation starting with highest-impact bottlenecks. Target 30% efficiency gain in 90 days with measured rollout.'
    };
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export class ExecutiveBriefExporter {
  /**
   * Export to Markdown format
   */
  static toMarkdown(narrative: ExecutiveNarrative, bluf?: string): string {
    let markdown = '# Executive Brief\n\n';

    // Add BLUF if provided
    if (bluf) {
      markdown += '## BLUF (Bottom Line Up Front)\n\n';
      markdown += '```\n' + bluf + '\n```\n\n';
    }

    // Add date
    markdown += `**Period**: ${narrative.period.start.toLocaleDateString()} - ${narrative.period.end.toLocaleDateString()}\n`;
    markdown += `**Generated**: ${narrative.generatedAt.toLocaleDateString()}\n\n`;

    // SCQA sections
    markdown += '## Situation\n\n';
    markdown += narrative.situation + '\n\n';

    markdown += '## Complication\n\n';
    markdown += narrative.complication + '\n\n';

    markdown += '## Question\n\n';
    markdown += narrative.question + '\n\n';

    markdown += '## Answer\n\n';
    markdown += narrative.answer + '\n\n';

    // Key Metrics
    markdown += '## Key Metrics\n\n';
    markdown += '| Metric | Value | Trend | Target |\n';
    markdown += '|--------|-------|-------|--------|\n';

    for (const metric of narrative.keyMetrics) {
      const value = this.formatMetricValue(metric);
      const trend = metric.trend === 'improving' ? '↑' : metric.trend === 'declining' ? '↓' : '→';
      const target = metric.kpi.targetValue ? this.formatValue(metric.kpi.targetValue, metric.kpi.format) : 'N/A';

      markdown += `| ${metric.kpi.name} | ${value} | ${trend} | ${target} |\n`;
    }

    // Top Insights
    markdown += '\n## Top Insights\n\n';
    narrative.topInsights.forEach((insight, i) => {
      markdown += `${i + 1}. **${insight.title}**: ${insight.summary}\n`;
    });

    // Actions
    markdown += '\n## Actions\n\n';
    markdown += '### Immediate (This Week)\n\n';
    narrative.immediateActions.forEach((action, i) => {
      markdown += `${i + 1}. ${action}\n`;
    });

    markdown += '\n### Planned (This Month)\n\n';
    narrative.plannedActions.forEach((action, i) => {
      markdown += `${i + 1}. ${action}\n`;
    });

    markdown += '\n### Strategic Considerations (This Quarter)\n\n';
    narrative.strategicConsiderations.forEach((consideration, i) => {
      markdown += `${i + 1}. ${consideration}\n`;
    });

    // Footer
    markdown += '\n---\n';
    markdown += `*Confidence Level: ${narrative.confidence}*\n`;

    return markdown;
  }

  /**
   * Export to PDF-ready HTML
   */
  static toPDFHTML(narrative: ExecutiveNarrative, bluf?: string): string {
    const styles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #111; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #e5e5e5; padding-bottom: 5px; }
        .bluf { background: #f0f9ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .bluf pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
        .metadata { color: #666; font-size: 14px; }
        .metrics-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .metrics-table th, .metrics-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .metrics-table th { background: #f5f5f5; font-weight: 600; }
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        .trend-stable { color: #6b7280; }
        .section { margin: 30px 0; }
        .actions { background: #fafafa; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .confidence { text-align: center; color: #666; font-style: italic; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
        @media print { body { font-size: 11pt; } h1 { page-break-after: avoid; } .section { page-break-inside: avoid; } }
      </style>
    `;

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Brief - ${narrative.period.end.toLocaleDateString()}</title>
  ${styles}
</head>
<body>
  <h1>Executive Brief</h1>

  <div class="metadata">
    <p><strong>Period:</strong> ${narrative.period.start.toLocaleDateString()} - ${narrative.period.end.toLocaleDateString()}</p>
    <p><strong>Generated:</strong> ${narrative.generatedAt.toLocaleDateString()}</p>
  </div>`;

    // Add BLUF if provided
    if (bluf) {
      html += `
  <div class="bluf">
    <h2 style="margin-top: 0;">BLUF (Bottom Line Up Front)</h2>
    <pre>${bluf}</pre>
  </div>`;
    }

    // SCQA sections
    html += `
  <div class="section">
    <h2>Situation</h2>
    <p>${narrative.situation}</p>
  </div>

  <div class="section">
    <h2>Complication</h2>
    <p>${narrative.complication}</p>
  </div>

  <div class="section">
    <h2>Question</h2>
    <p>${narrative.question}</p>
  </div>

  <div class="section">
    <h2>Answer</h2>
    <p>${narrative.answer}</p>
  </div>`;

    // Key Metrics table
    html += `
  <div class="section">
    <h2>Key Metrics</h2>
    <table class="metrics-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Trend</th>
          <th>Target</th>
        </tr>
      </thead>
      <tbody>`;

    for (const metric of narrative.keyMetrics) {
      const value = this.formatMetricValue(metric);
      const trendIcon = metric.trend === 'improving' ? '↑' : metric.trend === 'declining' ? '↓' : '→';
      const trendClass = metric.trend === 'improving' ? 'trend-up' : metric.trend === 'declining' ? 'trend-down' : 'trend-stable';
      const target = metric.kpi.targetValue ? this.formatValue(metric.kpi.targetValue, metric.kpi.format) : 'N/A';

      html += `
        <tr>
          <td>${metric.kpi.name}</td>
          <td>${value}</td>
          <td class="${trendClass}">${trendIcon} ${(metric.trendMagnitude * 100).toFixed(1)}%</td>
          <td>${target}</td>
        </tr>`;
    }

    html += `
      </tbody>
    </table>
  </div>`;

    // Actions
    html += `
  <div class="section">
    <h2>Actions</h2>

    <div class="actions">
      <h3>Immediate (This Week)</h3>
      <ol>`;

    narrative.immediateActions.forEach(action => {
      html += `<li>${action}</li>`;
    });

    html += `
      </ol>
    </div>

    <div class="actions">
      <h3>Planned (This Month)</h3>
      <ol>`;

    narrative.plannedActions.forEach(action => {
      html += `<li>${action}</li>`;
    });

    html += `
      </ol>
    </div>

    <div class="actions">
      <h3>Strategic Considerations (This Quarter)</h3>
      <ol>`;

    narrative.strategicConsiderations.forEach(consideration => {
      html += `<li>${consideration}</li>`;
    });

    html += `
      </ol>
    </div>
  </div>`;

    // Confidence footer
    html += `
  <div class="confidence">
    <p>Confidence Level: ${narrative.confidence}</p>
  </div>

</body>
</html>`;

    return html;
  }

  private static formatMetricValue(snapshot: KPISnapshot): string {
    return this.formatValue(snapshot.value, snapshot.kpi.format);
  }

  private static formatValue(value: number, format: string): string {
    switch (format) {
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return `$${(value / 1000).toFixed(0)}K`;
      case 'days':
        return `${value.toFixed(1)} days`;
      default:
        return value.toFixed(1);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ExecutiveNarrativeGenerator;