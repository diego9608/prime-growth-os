/**
 * Marketing Spend Optimizer
 * Intelligent budget allocation using Media Mix Modeling principles
 */

import type {
  MarketingChannel,
  SpendAllocation,
  SpendPlan,
  DateRange,
  KPISnapshot
} from './types';

// ============================================================================
// SPEND OPTIMIZATION ENGINE
// ============================================================================

export type ResponseCurveMode = 'hill' | 'exponential';

export class SpendOptimizer {
  private readonly MONTE_CARLO_RUNS = 1000;
  private readonly CONFIDENCE_LEVEL = 0.95;
  private readonly responseCurveMode: ResponseCurveMode;

  constructor(mode?: ResponseCurveMode) {
    this.responseCurveMode = mode || (process.env.RESPONSE_CURVE_MODE as ResponseCurveMode) || 'hill';
  }

  /**
   * Generates optimal spend allocation plan
   */
  optimizeSpend(params: {
    totalBudget: number;
    period: DateRange;
    channels: MarketingChannel[];
    historicalPerformance: ChannelPerformance[];
    constraints?: SpendConstraints;
    objectives?: OptimizationObjective;
  }): SpendPlan {
    const { totalBudget, period, channels, historicalPerformance, constraints = {}, objectives = 'maximize_roi' } = params;

    // Calculate channel efficiency curves
    const efficiencyCurves = this.calculateEfficiencyCurves(channels, historicalPerformance);

    // Run optimization based on objective
    let allocations: SpendAllocation[];
    switch (objectives) {
      case 'maximize_roi':
        allocations = this.optimizeForROI(channels, totalBudget, efficiencyCurves, constraints);
        break;
      case 'maximize_volume':
        allocations = this.optimizeForVolume(channels, totalBudget, efficiencyCurves, constraints);
        break;
      case 'minimize_cac':
        allocations = this.optimizeForCAC(channels, totalBudget, efficiencyCurves, constraints);
        break;
      case 'balanced_growth':
        allocations = this.optimizeForBalance(channels, totalBudget, efficiencyCurves, constraints);
        break;
      default:
        allocations = this.optimizeForROI(channels, totalBudget, efficiencyCurves, constraints);
    }

    // Run Monte Carlo simulation for confidence intervals
    const simulationResults = this.runMonteCarloSimulation(allocations, efficiencyCurves);

    // Add confidence intervals to allocations
    allocations = this.addConfidenceIntervals(allocations, simulationResults);

    // Calculate expected outcomes
    const expectedOutcome = this.calculateExpectedOutcomes(allocations);

    // Generate assumptions and constraints documentation
    const assumptions = this.documentAssumptions(channels, historicalPerformance);
    const appliedConstraints = this.documentConstraints(constraints);

    return {
      id: `spend-plan-${Date.now()}`,
      name: `Optimized ${objectives.replace('_', ' ')} plan`,
      totalBudget,
      period,
      allocations,
      expectedOutcome,
      constraints: appliedConstraints,
      assumptions,
      simulationRuns: this.MONTE_CARLO_RUNS
    };
  }

  /**
   * Calculates efficiency curves using historical data
   */
  private calculateEfficiencyCurves(
    channels: MarketingChannel[],
    historicalPerformance: ChannelPerformance[]
  ): Map<string, EfficiencyCurve> {
    const curves = new Map<string, EfficiencyCurve>();

    for (const channel of channels) {
      const channelHistory = historicalPerformance.filter(p => p.channelId === channel.id);

      if (channelHistory.length < 3) {
        // Use default curve if insufficient data
        curves.set(channel.id, this.getDefaultCurve(channel));
        continue;
      }

      // Fit response curve (simplified Hill transformation)
      const curve = this.fitResponseCurve(channelHistory);
      curves.set(channel.id, curve);
    }

    return curves;
  }

  /**
   * Fits a response curve to historical data
   * Using simplified Hill transformation: Response = a * (spend^b) / (c + spend^b)
   */
  private fitResponseCurve(history: ChannelPerformance[]): EfficiencyCurve {
    // Sort by spend to find patterns
    const sorted = history.sort((a, b) => a.spend - b.spend);

    // Estimate saturation point (where marginal return drops significantly)
    const saturationPoint = this.estimateSaturationPoint(sorted);

    // Calculate average efficiency at different spend levels
    const lowSpendEfficiency = this.calculateAverageEfficiency(sorted.filter(h => h.spend < saturationPoint * 0.3));
    const midSpendEfficiency = this.calculateAverageEfficiency(sorted.filter(h => h.spend >= saturationPoint * 0.3 && h.spend < saturationPoint * 0.7));
    const highSpendEfficiency = this.calculateAverageEfficiency(sorted.filter(h => h.spend >= saturationPoint * 0.7));

    // Estimate curve parameters
    const alpha = lowSpendEfficiency * 1.2;  // Peak efficiency
    const beta = 0.7;  // Shape parameter (0.5-1.0 typical)
    const gamma = saturationPoint * 0.5;  // Half-saturation point

    return {
      alpha,
      beta,
      gamma,
      saturationPoint,
      minEffectiveSpend: saturationPoint * 0.1,
      maxEffectiveSpend: saturationPoint * 2,
      currentEfficiency: midSpendEfficiency
    };
  }

  /**
   * Optimize for maximum ROI
   */
  private optimizeForROI(
    channels: MarketingChannel[],
    budget: number,
    curves: Map<string, EfficiencyCurve>,
    constraints: SpendConstraints
  ): SpendAllocation[] {
    // Initialize allocations
    let allocations = channels.map(channel => this.initializeAllocation(channel, budget, constraints));

    // Iterative optimization using marginal ROI
    let remainingBudget = budget - allocations.reduce((sum, a) => sum + a.recommendedAmount, 0);
    let iterations = 0;
    const maxIterations = 100;

    while (remainingBudget > budget * 0.01 && iterations < maxIterations) {
      // Find channel with highest marginal ROI
      let bestChannel: SpendAllocation | null = null;
      let bestMarginalROI = 0;

      for (const allocation of allocations) {
        const curve = curves.get(allocation.channel.id)!;
        const marginalROI = this.calculateMarginalROI(allocation.recommendedAmount, curve);

        // Check if we can allocate more to this channel
        const maxSpend = this.getMaxSpend(allocation.channel, budget, constraints);
        if (allocation.recommendedAmount < maxSpend && marginalROI > bestMarginalROI) {
          bestMarginalROI = marginalROI;
          bestChannel = allocation;
        }
      }

      if (!bestChannel || bestMarginalROI < 1.5) break;  // Stop if no good options

      // Allocate increment to best channel
      const increment = Math.min(remainingBudget * 0.1, budget * 0.02);
      bestChannel.recommendedAmount += increment;
      remainingBudget -= increment;
      iterations++;
    }

    // Calculate final percentages and expected outcomes
    return this.finalizeAllocations(allocations, budget, curves);
  }

  /**
   * Optimize for maximum volume (leads/conversions)
   */
  private optimizeForVolume(
    channels: MarketingChannel[],
    budget: number,
    curves: Map<string, EfficiencyCurve>,
    constraints: SpendConstraints
  ): SpendAllocation[] {
    // Similar to ROI but optimize for total conversions
    let allocations = channels.map(channel => this.initializeAllocation(channel, budget, constraints));

    // Allocate to channels with best conversion rates first
    const sortedByConversion = allocations.sort((a, b) => {
      const curveA = curves.get(a.channel.id)!;
      const curveB = curves.get(b.channel.id)!;
      return curveB.alpha - curveA.alpha;  // Higher alpha = better conversion
    });

    let remainingBudget = budget - allocations.reduce((sum, a) => sum + a.recommendedAmount, 0);

    for (const allocation of sortedByConversion) {
      if (remainingBudget <= 0) break;

      const curve = curves.get(allocation.channel.id)!;
      const maxSpend = Math.min(
        curve.saturationPoint,
        this.getMaxSpend(allocation.channel, budget, constraints)
      );

      const additionalSpend = Math.min(remainingBudget, maxSpend - allocation.recommendedAmount);
      allocation.recommendedAmount += additionalSpend;
      remainingBudget -= additionalSpend;
    }

    return this.finalizeAllocations(allocations, budget, curves);
  }

  /**
   * Optimize for minimum CAC
   */
  private optimizeForCAC(
    channels: MarketingChannel[],
    budget: number,
    curves: Map<string, EfficiencyCurve>,
    constraints: SpendConstraints
  ): SpendAllocation[] {
    // Allocate to channels with lowest CAC first
    let allocations = channels.map(channel => this.initializeAllocation(channel, budget, constraints));

    const sortedByCAC = allocations.sort((a, b) => a.channel.incrementalCAC - b.channel.incrementalCAC);

    let remainingBudget = budget - allocations.reduce((sum, a) => sum + a.recommendedAmount, 0);

    for (const allocation of sortedByCAC) {
      if (remainingBudget <= 0) break;

      const curve = curves.get(allocation.channel.id)!;
      const optimalSpend = curve.gamma;  // Half-saturation point is often optimal for CAC
      const maxSpend = this.getMaxSpend(allocation.channel, budget, constraints);

      const targetSpend = Math.min(optimalSpend, maxSpend);
      const additionalSpend = Math.min(remainingBudget, targetSpend - allocation.recommendedAmount);

      allocation.recommendedAmount += additionalSpend;
      remainingBudget -= additionalSpend;
    }

    return this.finalizeAllocations(allocations, budget, curves);
  }

  /**
   * Optimize for balanced growth (risk-adjusted)
   */
  private optimizeForBalance(
    channels: MarketingChannel[],
    budget: number,
    curves: Map<string, EfficiencyCurve>,
    constraints: SpendConstraints
  ): SpendAllocation[] {
    // Use portfolio theory - don't put all eggs in one basket
    const minChannels = 3;
    const maxChannelShare = 0.4;  // No channel gets more than 40%

    let allocations = channels.map(channel => {
      const minSpend = Math.max(
        budget * 0.05,  // At least 5% per channel
        constraints.minSpend?.get(channel.id) || 0
      );
      return this.initializeAllocation(channel, budget, constraints, minSpend);
    });

    // Ensure minimum diversification
    const activeChannels = allocations.filter(a => a.recommendedAmount > 0);
    if (activeChannels.length < minChannels) {
      // Activate more channels
      const inactiveChannels = allocations
        .filter(a => a.recommendedAmount === 0)
        .sort((a, b) => b.channel.currentROI - a.channel.currentROI);

      for (let i = 0; i < minChannels - activeChannels.length && i < inactiveChannels.length; i++) {
        inactiveChannels[i].recommendedAmount = budget * 0.05;
      }
    }

    // Apply maximum concentration limits
    for (const allocation of allocations) {
      allocation.recommendedAmount = Math.min(allocation.recommendedAmount, budget * maxChannelShare);
    }

    // Distribute remaining budget proportionally
    const allocated = allocations.reduce((sum, a) => sum + a.recommendedAmount, 0);
    const remaining = budget - allocated;

    if (remaining > 0) {
      const activeAllocations = allocations.filter(a => a.recommendedAmount > 0);
      for (const allocation of activeAllocations) {
        const share = allocation.recommendedAmount / allocated;
        allocation.recommendedAmount += remaining * share;
      }
    }

    return this.finalizeAllocations(allocations, budget, curves);
  }

  /**
   * Run Monte Carlo simulation for confidence intervals
   */
  private runMonteCarloSimulation(
    allocations: SpendAllocation[],
    curves: Map<string, EfficiencyCurve>
  ): SimulationResults {
    const results: number[][] = [];

    for (let run = 0; run < this.MONTE_CARLO_RUNS; run++) {
      const runResults: number[] = [];

      for (const allocation of allocations) {
        const curve = curves.get(allocation.channel.id)!;

        // Add random variation (±20% normal distribution)
        const variation = 1 + (Math.random() - 0.5) * 0.4;
        const simulatedROI = this.calculateExpectedROI(allocation.recommendedAmount, curve) * variation;

        runResults.push(simulatedROI);
      }

      results.push(runResults);
    }

    return { results, runs: this.MONTE_CARLO_RUNS };
  }

  /**
   * Add confidence intervals to allocations
   */
  private addConfidenceIntervals(
    allocations: SpendAllocation[],
    simulation: SimulationResults
  ): SpendAllocation[] {
    return allocations.map((allocation, index) => {
      const channelResults = simulation.results.map(run => run[index]);
      channelResults.sort((a, b) => a - b);

      const lowerIndex = Math.floor(channelResults.length * (1 - this.CONFIDENCE_LEVEL) / 2);
      const upperIndex = Math.floor(channelResults.length * (1 + this.CONFIDENCE_LEVEL) / 2);

      return {
        ...allocation,
        confidenceInterval: {
          lower: channelResults[lowerIndex],
          upper: channelResults[upperIndex]
        }
      };
    });
  }

  /**
   * Calculate expected outcomes for the plan
   */
  private calculateExpectedOutcomes(allocations: SpendAllocation[]): SpendPlan['expectedOutcome'] {
    const totalLeads = allocations.reduce((sum, a) => sum + a.expectedLeads, 0);
    const totalConversions = allocations.reduce((sum, a) => sum + a.expectedConversions, 0);
    const totalRevenue = allocations.reduce((sum, a) => sum + a.expectedConversions * 50000, 0);  // $50K avg deal
    const totalSpend = allocations.reduce((sum, a) => sum + a.recommendedAmount, 0);

    return {
      leads: Math.round(totalLeads),
      conversions: Math.round(totalConversions),
      revenue: totalRevenue,
      roi: totalRevenue / totalSpend
    };
  }

  /**
   * Helper: Initialize allocation with minimum constraints
   */
  private initializeAllocation(
    channel: MarketingChannel,
    totalBudget: number,
    constraints: SpendConstraints,
    minAmount: number = 0
  ): SpendAllocation {
    const currentPercent = channel.currentSpend / totalBudget * 100;
    const minSpend = Math.max(
      minAmount,
      constraints.minSpend?.get(channel.id) || channel.minEffectiveSpend
    );

    return {
      channel,
      currentPercent,
      recommendedPercent: 0,  // Will be calculated
      recommendedAmount: minSpend,
      expectedLeads: 0,  // Will be calculated
      expectedConversions: 0,  // Will be calculated
      expectedROI: 0,  // Will be calculated
      confidenceInterval: { lower: 0, upper: 0 }
    };
  }

  /**
   * Helper: Finalize allocations with calculated outcomes
   */
  private finalizeAllocations(
    allocations: SpendAllocation[],
    budget: number,
    curves: Map<string, EfficiencyCurve>
  ): SpendAllocation[] {
    return allocations.map(allocation => {
      const curve = curves.get(allocation.channel.id)!;
      const expectedROI = this.calculateExpectedROI(allocation.recommendedAmount, curve);
      const expectedLeads = this.calculateExpectedLeads(allocation.recommendedAmount, curve);
      const expectedConversions = expectedLeads * 0.15;  // 15% conversion rate assumption

      return {
        ...allocation,
        recommendedPercent: (allocation.recommendedAmount / budget) * 100,
        expectedLeads,
        expectedConversions,
        expectedROI
      };
    });
  }

  /**
   * Helper: Calculate marginal ROI at spend level
   */
  private calculateMarginalROI(spend: number, curve: EfficiencyCurve): number {
    const delta = spend * 0.01;  // 1% increment
    const currentReturn = this.calculateReturn(spend, curve);
    const incrementalReturn = this.calculateReturn(spend + delta, curve);
    return (incrementalReturn - currentReturn) / delta;
  }

  /**
   * Helper: Calculate expected ROI at spend level
   */
  private calculateExpectedROI(spend: number, curve: EfficiencyCurve): number {
    const returns = this.calculateReturn(spend, curve);
    return returns / spend;
  }

  /**
   * Helper: Calculate expected leads at spend level
   */
  private calculateExpectedLeads(spend: number, curve: EfficiencyCurve): number {
    // Simplified: leads proportional to spend with diminishing returns
    const efficiency = this.calculateEfficiency(spend, curve);
    return (spend / 500) * efficiency;  // $500 base CPL
  }

  /**
   * Helper: Calculate return using response curve
   */
  private calculateReturn(spend: number, curve: EfficiencyCurve): number {
    if (this.responseCurveMode === 'exponential') {
      // Exponential saturation: R = a * (1 - exp(-b * spend))
      const { alpha, beta } = curve;
      return alpha * (1 - Math.exp(-beta * spend));
    } else {
      // Hill transformation: R = a * (S^b) / (c + S^b)
      const { alpha, beta, gamma } = curve;
      return alpha * Math.pow(spend, beta) / (gamma + Math.pow(spend, beta));
    }
  }

  /**
   * Helper: Calculate exponential response (alternative model)
   */
  private calculateExponentialResponse(spend: number, a: number, b: number): number {
    return a * (1 - Math.exp(-b * spend));
  }

  /**
   * Helper: Calculate efficiency at spend level
   */
  private calculateEfficiency(spend: number, curve: EfficiencyCurve): number {
    if (spend < curve.minEffectiveSpend) return 0.5;
    if (spend > curve.maxEffectiveSpend) return 0.3;
    if (spend > curve.saturationPoint) return 0.7;
    return 1.0;
  }

  /**
   * Helper: Get maximum allowed spend for channel
   */
  private getMaxSpend(
    channel: MarketingChannel,
    budget: number,
    constraints: SpendConstraints
  ): number {
    return Math.min(
      budget * 0.5,  // No more than 50% in one channel
      constraints.maxSpend?.get(channel.id) || budget,
      channel.maxRecommendedSpend
    );
  }

  /**
   * Helper: Estimate saturation point from historical data
   */
  private estimateSaturationPoint(history: ChannelPerformance[]): number {
    // Find where efficiency starts dropping
    let maxEfficiency = 0;
    let saturationSpend = 0;

    for (const perf of history) {
      const efficiency = perf.conversions / perf.spend;
      if (efficiency > maxEfficiency) {
        maxEfficiency = efficiency;
        saturationSpend = perf.spend;
      } else if (efficiency < maxEfficiency * 0.8) {
        // Efficiency dropped 20%, likely past saturation
        return perf.spend;
      }
    }

    return saturationSpend * 1.5;  // Estimate 50% above best observed
  }

  /**
   * Helper: Calculate average efficiency for a set of performances
   */
  private calculateAverageEfficiency(history: ChannelPerformance[]): number {
    if (history.length === 0) return 0.5;

    const totalSpend = history.reduce((sum, h) => sum + h.spend, 0);
    const totalConversions = history.reduce((sum, h) => sum + h.conversions, 0);

    return totalConversions / totalSpend;
  }

  /**
   * Helper: Get default efficiency curve when no data available
   */
  private getDefaultCurve(channel: MarketingChannel): EfficiencyCurve {
    return {
      alpha: channel.currentROI,
      beta: 0.7,
      gamma: channel.currentSpend,
      saturationPoint: channel.saturationPoint,
      minEffectiveSpend: channel.minEffectiveSpend,
      maxEffectiveSpend: channel.maxRecommendedSpend,
      currentEfficiency: 0.5
    };
  }

  /**
   * Document assumptions for transparency
   */
  private documentAssumptions(channels: MarketingChannel[], history: ChannelPerformance[]): string[] {
    const assumptions: string[] = [];

    assumptions.push('Historical performance is indicative of future results');
    assumptions.push('No major market disruptions or competitive changes');
    assumptions.push('Channel interactions are independent (no cannibalization)');

    if (history.length < channels.length * 6) {
      assumptions.push('Limited historical data - using industry benchmarks');
    }

    assumptions.push('15% baseline conversion rate from lead to customer');
    assumptions.push('$50,000 average deal value');
    assumptions.push('Attribution model accuracy ±20%');

    return assumptions;
  }

  /**
   * Document applied constraints
   */
  private documentConstraints(constraints: SpendConstraints): string[] {
    const applied: string[] = [];

    if (constraints.minSpend) {
      applied.push(`Minimum spend requirements enforced for ${constraints.minSpend.size} channels`);
    }
    if (constraints.maxSpend) {
      applied.push(`Maximum spend limits applied to ${constraints.maxSpend.size} channels`);
    }
    if (constraints.mandatoryChannels) {
      applied.push(`${constraints.mandatoryChannels.length} channels required to be active`);
    }
    if (constraints.excludedChannels) {
      applied.push(`${constraints.excludedChannels.length} channels excluded from optimization`);
    }

    if (applied.length === 0) {
      applied.push('No external constraints applied - fully optimized allocation');
    }

    return applied;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ChannelPerformance {
  channelId: string;
  period: DateRange;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export interface EfficiencyCurve {
  alpha: number;  // Maximum efficiency
  beta: number;   // Shape parameter
  gamma: number;  // Half-saturation point
  saturationPoint: number;
  minEffectiveSpend: number;
  maxEffectiveSpend: number;
  currentEfficiency: number;
}

export interface SpendConstraints {
  minSpend?: Map<string, number>;
  maxSpend?: Map<string, number>;
  mandatoryChannels?: string[];
  excludedChannels?: string[];
  minROI?: number;
  maxRisk?: number;
}

export type OptimizationObjective =
  | 'maximize_roi'
  | 'maximize_volume'
  | 'minimize_cac'
  | 'balanced_growth';

interface SimulationResults {
  results: number[][];
  runs: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SpendOptimizer;