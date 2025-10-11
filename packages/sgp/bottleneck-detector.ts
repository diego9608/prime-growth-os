/**
 * Bottleneck Detection Engine
 * Identifies and prioritizes operational constraints limiting growth
 */

import type {
  ProcessFlow,
  ProcessStage,
  Bottleneck,
  KPISnapshot,
  Evidence,
  Insight,
  Recommendation,
  ImpactEstimate,
  Action,
  RiskFactor
} from './types';

// ============================================================================
// BOTTLENECK DETECTION ALGORITHMS
// ============================================================================

export class BottleneckDetector {
  private readonly CRITICAL_THRESHOLD = 0.8;  // 80% bottleneck score
  private readonly HIGH_THRESHOLD = 0.6;
  private readonly MEDIUM_THRESHOLD = 0.4;

  /**
   * Analyzes process flows to identify bottlenecks
   */
  analyzeProcessFlows(flows: ProcessFlow[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    for (const flow of flows) {
      const stageBottlenecks = this.analyzeStages(flow);
      bottlenecks.push(...stageBottlenecks);
    }

    return this.prioritizeBottlenecks(bottlenecks);
  }

  /**
   * Analyzes individual stages within a process
   */
  private analyzeStages(flow: ProcessFlow): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const avgFlowTime = flow.avgCycleTime;

    for (const stage of flow.stages) {
      const bottleneckScore = this.calculateBottleneckScore(stage, flow);

      if (bottleneckScore > this.MEDIUM_THRESHOLD) {
        const severity = this.getSeverity(bottleneckScore);
        const rootCauses = this.identifyRootCauses(stage, flow);
        const costOfDelay = this.calculateCostOfDelay(stage, flow);

        const bottleneck: Bottleneck = {
          id: `btl-${flow.id}-${stage.id}-${Date.now()}`,
          process: flow,
          stage,
          severity,
          impactedVolume: flow.volumePerMonth * (stage.dropOffRate + stage.reworkRate),
          costOfDelay,
          rootCauses,
          recommendedFixes: this.generateFixes(stage, flow, rootCauses)
        };

        bottlenecks.push(bottleneck);
      }
    }

    return bottlenecks;
  }

  /**
   * Calculates bottleneck score using Theory of Constraints principles
   */
  private calculateBottleneckScore(stage: ProcessStage, flow: ProcessFlow): number {
    const factors = {
      // Time-based factors
      durationRatio: stage.avgDuration / flow.avgCycleTime,
      variability: (stage.maxDuration - stage.minDuration) / stage.avgDuration,
      waitTimeRatio: stage.waitTime / stage.avgDuration,

      // Quality factors
      reworkImpact: stage.reworkRate,
      dropOffImpact: stage.dropOffRate,

      // Throughput factors
      utilization: this.estimateUtilization(stage, flow),
      queueLength: this.estimateQueueLength(stage, flow)
    };

    // Weighted scoring
    const score =
      factors.durationRatio * 0.25 +
      factors.variability * 0.15 +
      factors.waitTimeRatio * 0.15 +
      factors.reworkImpact * 0.15 +
      factors.dropOffImpact * 0.10 +
      factors.utilization * 0.10 +
      factors.queueLength * 0.10;

    return Math.min(1, score);
  }

  /**
   * Identifies root causes using pattern analysis
   */
  private identifyRootCauses(stage: ProcessStage, flow: ProcessFlow): string[] {
    const causes: string[] = [];

    // High duration causes
    if (stage.avgDuration > flow.avgCycleTime * 0.3) {
      if (stage.waitTime > stage.avgDuration * 0.5) {
        causes.push('Excessive wait time - likely resource constraint or approval bottleneck');
      }
      if (stage.maxDuration > stage.avgDuration * 2) {
        causes.push('High variability - inconsistent process or skill gaps');
      }
    }

    // Quality issues
    if (stage.reworkRate > 0.15) {
      causes.push(`High rework rate (${(stage.reworkRate * 100).toFixed(1)}%) - quality control or requirements clarity issue`);
    }

    // Throughput issues
    if (stage.dropOffRate > 0.1) {
      causes.push(`High drop-off rate (${(stage.dropOffRate * 100).toFixed(1)}%) - customer experience or value perception issue`);
    }

    // Capacity issues
    const utilization = this.estimateUtilization(stage, flow);
    if (utilization > 0.85) {
      causes.push('Over-utilization - insufficient capacity for demand');
    }

    return causes.length > 0 ? causes : ['Complex interdependencies requiring detailed analysis'];
  }

  /**
   * Calculates financial impact of delays
   */
  private calculateCostOfDelay(stage: ProcessStage, flow: ProcessFlow): number {
    // Base calculation: volume * delay * value
    const avgDealValue = 50000;  // Would come from actual data
    const delayDays = stage.avgDuration + stage.waitTime;
    const monthlyImpact = flow.volumePerMonth;

    // Cost components
    const opportunityCost = (monthlyImpact * avgDealValue * 0.1) / 30 * delayDays;  // 10% of deal value
    const holdingCost = monthlyImpact * 100 * delayDays;  // $100/day holding cost
    const reworkCost = stage.reworkRate * monthlyImpact * 5000;  // $5K per rework

    return opportunityCost + holdingCost + reworkCost;
  }

  /**
   * Generates targeted recommendations for bottleneck resolution
   */
  private generateFixes(stage: ProcessStage, flow: ProcessFlow, rootCauses: string[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // For each root cause, generate specific recommendation
    for (const cause of rootCauses) {
      if (cause.includes('resource constraint')) {
        recommendations.push(this.createResourceRecommendation(stage, flow));
      }
      if (cause.includes('quality control')) {
        recommendations.push(this.createQualityRecommendation(stage, flow));
      }
      if (cause.includes('variability')) {
        recommendations.push(this.createStandardizationRecommendation(stage, flow));
      }
      if (cause.includes('drop-off')) {
        recommendations.push(this.createEngagementRecommendation(stage, flow));
      }
    }

    return recommendations;
  }

  /**
   * Creates resource optimization recommendation
   */
  private createResourceRecommendation(stage: ProcessStage, flow: ProcessFlow): Recommendation {
    const impactEstimate: ImpactEstimate = {
      velocity: {
        baseline: stage.avgDuration,
        target: stage.avgDuration * 0.6,
        delta: -stage.avgDuration * 0.4,
        deltaPercent: -40,
        unit: 'days'
      },
      timeToImpact: 14,
      sustainabilityMonths: 12
    };

    const actions: Action[] = [
      {
        id: 'act-1',
        label: 'Implement parallel processing',
        description: 'Split stage into parallel tracks for different work types',
        type: 'immediate',
        automatable: false,
        estimatedEffort: 40
      },
      {
        id: 'act-2',
        label: 'Add surge capacity',
        description: 'Cross-train 2 team members from adjacent stages',
        type: 'planned',
        automatable: false,
        estimatedEffort: 80
      }
    ];

    return {
      id: `rec-resource-${Date.now()}`,
      title: `Optimize resource allocation in ${stage.name}`,
      executiveSummary: `Reduce ${stage.name} processing time by 40% through parallel processing and cross-training.`,
      rationale: `Current bottleneck costs $${Math.round(this.calculateCostOfDelay(stage, flow)/1000)}K/month in delays`,
      insight: {} as Insight,  // Would link to actual insight
      expectedImpact: impactEstimate,
      confidence: 0.75,
      confidenceFactors: ['Based on 3 similar implementations', 'Team capability confirmed'],
      actions,
      successCriteria: [`${stage.name} cycle time < ${stage.avgDuration * 0.6} days`, 'Maintain quality score > 95%'],
      risks: [{
        description: 'Temporary productivity dip during transition',
        probability: 'medium',
        impact: 'low',
        mitigation: 'Phased rollout with parallel old process'
      }],
      assumptions: ['No significant volume increase', 'Resources available for training'],
      status: 'proposed',
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      testable: true
    };
  }

  /**
   * Creates quality improvement recommendation
   */
  private createQualityRecommendation(stage: ProcessStage, flow: ProcessFlow): Recommendation {
    const currentRework = stage.reworkRate;
    const targetRework = 0.05;  // 5% target

    const impactEstimate: ImpactEstimate = {
      margin: {
        baseline: 20,  // Current margin %
        target: 23,
        delta: 3,
        deltaPercent: 15,
        unit: '%'
      },
      timeToImpact: 30,
      sustainabilityMonths: 24
    };

    return {
      id: `rec-quality-${Date.now()}`,
      title: `Implement quality gates in ${stage.name}`,
      executiveSummary: `Reduce rework from ${(currentRework*100).toFixed(1)}% to 5% through automated quality checks.`,
      rationale: `Rework costs $${Math.round(currentRework * flow.volumePerMonth * 5000/1000)}K/month`,
      insight: {} as Insight,
      expectedImpact: impactEstimate,
      confidence: 0.82,
      confidenceFactors: ['Proven approach', 'Clear quality metrics available'],
      actions: [
        {
          id: 'act-1',
          label: 'Define quality checklist',
          description: 'Create stage-specific quality criteria',
          type: 'immediate',
          automatable: false,
          estimatedEffort: 16
        },
        {
          id: 'act-2',
          label: 'Implement automated checks',
          description: 'Add validation rules to system',
          type: 'planned',
          automatable: true,
          estimatedEffort: 40
        }
      ],
      successCriteria: ['Rework rate < 5%', 'No increase in cycle time'],
      risks: [{
        description: 'Initial slowdown from additional checks',
        probability: 'high',
        impact: 'low',
        mitigation: 'Optimize checklist after 2 weeks'
      }],
      assumptions: ['Quality issues are detectable', 'Team adopts new process'],
      status: 'proposed',
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      testable: true
    };
  }

  /**
   * Creates process standardization recommendation
   */
  private createStandardizationRecommendation(stage: ProcessStage, flow: ProcessFlow): Recommendation {
    return {
      id: `rec-standard-${Date.now()}`,
      title: `Standardize ${stage.name} process`,
      executiveSummary: `Reduce variability by 60% through templating and automation.`,
      rationale: `High variability (${((stage.maxDuration - stage.minDuration)/stage.avgDuration*100).toFixed(0)}%) causes unpredictable delivery`,
      insight: {} as Insight,
      expectedImpact: {
        velocity: {
          baseline: stage.maxDuration - stage.minDuration,
          target: (stage.maxDuration - stage.minDuration) * 0.4,
          delta: -(stage.maxDuration - stage.minDuration) * 0.6,
          deltaPercent: -60,
          unit: 'days variance'
        },
        timeToImpact: 21,
        sustainabilityMonths: 18
      },
      confidence: 0.78,
      confidenceFactors: ['Clear patterns identified', 'Templates exist in other areas'],
      actions: [
        {
          id: 'act-1',
          label: 'Document best practices',
          description: 'Capture top performer methods',
          type: 'immediate',
          automatable: false,
          estimatedEffort: 24
        },
        {
          id: 'act-2',
          label: 'Create process templates',
          description: 'Build reusable templates for common scenarios',
          type: 'planned',
          automatable: true,
          estimatedEffort: 60
        }
      ],
      successCriteria: ['Variance < 20% of mean', '80% tasks use templates'],
      risks: [{
        description: 'Resistance to standardization',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Involve team in template creation'
      }],
      assumptions: ['80% of work is templateable'],
      status: 'proposed',
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      testable: true
    };
  }

  /**
   * Creates customer engagement recommendation
   */
  private createEngagementRecommendation(stage: ProcessStage, flow: ProcessFlow): Recommendation {
    return {
      id: `rec-engage-${Date.now()}`,
      title: `Improve engagement at ${stage.name}`,
      executiveSummary: `Reduce drop-off from ${(stage.dropOffRate*100).toFixed(1)}% to 5% through proactive communication.`,
      rationale: `Losing ${Math.round(stage.dropOffRate * flow.volumePerMonth)} opportunities/month at this stage`,
      insight: {} as Insight,
      expectedImpact: {
        revenue: {
          baseline: 1000000,
          target: 1000000 * (1 + stage.dropOffRate * 0.7),
          delta: 1000000 * stage.dropOffRate * 0.7,
          deltaPercent: stage.dropOffRate * 70,
          unit: '$'
        },
        timeToImpact: 7,
        sustainabilityMonths: 12
      },
      confidence: 0.70,
      confidenceFactors: ['Customer feedback available', 'Competitor benchmarks known'],
      actions: [
        {
          id: 'act-1',
          label: 'Implement progress tracking',
          description: 'Show customers their progress through the process',
          type: 'immediate',
          automatable: true,
          estimatedEffort: 20
        },
        {
          id: 'act-2',
          label: 'Add proactive touchpoints',
          description: 'Automated check-ins at key milestones',
          type: 'planned',
          automatable: true,
          estimatedEffort: 32
        }
      ],
      successCriteria: ['Drop-off rate < 5%', 'NPS > 50 at this stage'],
      risks: [{
        description: 'Over-communication fatigue',
        probability: 'low',
        impact: 'low',
        mitigation: 'Test frequency with small group'
      }],
      assumptions: ['Drop-offs are due to lack of engagement'],
      status: 'proposed',
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      testable: true
    };
  }

  /**
   * Helper: Estimate stage utilization
   */
  private estimateUtilization(stage: ProcessStage, flow: ProcessFlow): number {
    const demandHoursPerMonth = flow.volumePerMonth * stage.avgDuration * 8;  // 8 hours/day
    const capacityHoursPerMonth = 22 * 8 * 2;  // 22 days, 8 hours, 2 people (estimated)
    return Math.min(1, demandHoursPerMonth / capacityHoursPerMonth);
  }

  /**
   * Helper: Estimate queue length
   */
  private estimateQueueLength(stage: ProcessStage, flow: ProcessFlow): number {
    // Little's Law: L = λW
    const arrivalRate = flow.volumePerMonth / 22;  // Daily arrivals
    const waitTime = stage.waitTime;
    return arrivalRate * waitTime;
  }

  /**
   * Helper: Determine severity based on score
   */
  private getSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= this.CRITICAL_THRESHOLD) return 'critical';
    if (score >= this.HIGH_THRESHOLD) return 'high';
    if (score >= this.MEDIUM_THRESHOLD) return 'medium';
    return 'low';
  }

  /**
   * Prioritize bottlenecks by impact
   */
  private prioritizeBottlenecks(bottlenecks: Bottleneck[]): Bottleneck[] {
    return bottlenecks.sort((a, b) => {
      // Sort by cost of delay (highest first)
      return b.costOfDelay - a.costOfDelay;
    });
  }
}

// ============================================================================
// SAMPLE DATA GENERATORS (for testing)
// ============================================================================

export function generateSampleProcessFlow(): ProcessFlow {
  return {
    id: 'sales-process',
    name: 'Sales to Delivery',
    avgCycleTime: 21,  // days
    volumePerMonth: 50,
    stages: [
      {
        id: 'lead-response',
        name: 'Lead Response',
        avgDuration: 2,
        maxDuration: 5,
        minDuration: 0.5,
        bottleneckScore: 0.3,
        waitTime: 0.5,
        reworkRate: 0.05,
        dropOffRate: 0.15
      },
      {
        id: 'proposal-creation',
        name: 'Proposal Creation',
        avgDuration: 5,
        maxDuration: 14,
        minDuration: 2,
        bottleneckScore: 0.7,
        waitTime: 2,
        reworkRate: 0.25,
        dropOffRate: 0.1
      },
      {
        id: 'negotiation',
        name: 'Negotiation',
        avgDuration: 7,
        maxDuration: 21,
        minDuration: 3,
        bottleneckScore: 0.5,
        waitTime: 3,
        reworkRate: 0.15,
        dropOffRate: 0.2
      },
      {
        id: 'contract-approval',
        name: 'Contract Approval',
        avgDuration: 3,
        maxDuration: 7,
        minDuration: 1,
        bottleneckScore: 0.6,
        waitTime: 2,
        reworkRate: 0.1,
        dropOffRate: 0.05
      },
      {
        id: 'project-kickoff',
        name: 'Project Kickoff',
        avgDuration: 4,
        maxDuration: 7,
        minDuration: 2,
        bottleneckScore: 0.2,
        waitTime: 1,
        reworkRate: 0.02,
        dropOffRate: 0.01
      }
    ]
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BottleneckDetector;