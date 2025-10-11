/**
 * Business Guardrails Engine
 * Ensures recommendations respect real-world constraints
 */

import type {
  BusinessConstraints,
  GuardrailViolation,
  SpendPlan,
  MarketingChannel,
  SpendAllocation,
  Recommendation,
  Bottleneck
} from './types';

// ============================================================================
// GUARDRAILS VALIDATOR
// ============================================================================

export class GuardrailsValidator {
  private constraints: BusinessConstraints;

  constructor(constraints: BusinessConstraints) {
    this.constraints = constraints;
  }

  /**
   * Validates a spend plan against all business constraints
   */
  validateSpendPlan(
    plan: SpendPlan,
    currentSpend: Map<string, number>,
    dayOfMonth: number = 1
  ): {
    valid: boolean;
    violations: GuardrailViolation[];
    adjustedPlan?: SpendPlan;
  } {
    const violations: GuardrailViolation[] = [];

    // Check capacity constraints
    violations.push(...this.checkCapacityConstraints(plan));

    // Check ramp rate constraints
    violations.push(...this.checkRampRateConstraints(plan, currentSpend));

    // Check pacing constraints
    violations.push(...this.checkPacingConstraints(plan, dayOfMonth));

    // Check platform constraints
    violations.push(...this.checkPlatformConstraints(plan));

    // Check diversity constraints
    violations.push(...this.checkDiversityConstraints(plan));

    // Separate errors from warnings
    const errors = violations.filter(v => v.severity === 'error');
    const valid = errors.length === 0;

    // If invalid, attempt to create adjusted plan
    let adjustedPlan: SpendPlan | undefined;
    if (!valid) {
      adjustedPlan = this.createAdjustedPlan(plan, violations);
    }

    return { valid, violations, adjustedPlan };
  }

  /**
   * Validates recommendations against capacity
   */
  validateRecommendations(
    recommendations: Recommendation[],
    currentLoad: {
      proposals: number;
      meetings: number;
      implementations: number;
    }
  ): {
    feasible: Recommendation[];
    infeasible: Array<{
      recommendation: Recommendation;
      reason: string;
      alternatives: string[];
    }>;
  } {
    const feasible: Recommendation[] = [];
    const infeasible: Array<{
      recommendation: Recommendation;
      reason: string;
      alternatives: string[];
    }> = [];

    for (const rec of recommendations) {
      const capacityNeeded = this.estimateCapacityNeeded(rec);

      if (this.hasCapacity(capacityNeeded, currentLoad)) {
        feasible.push(rec);
      } else {
        infeasible.push({
          recommendation: rec,
          reason: this.explainCapacityConstraint(capacityNeeded, currentLoad),
          alternatives: this.suggestAlternatives(rec, currentLoad)
        });
      }
    }

    return { feasible, infeasible };
  }

  /**
   * Check capacity constraints
   */
  private checkCapacityConstraints(plan: SpendPlan): GuardrailViolation[] {
    const violations: GuardrailViolation[] = [];
    const { maxDailyCapacity } = this.constraints;

    // Estimate daily load from spend plan
    const estimatedProposals = plan.expected.leads * 0.5;  // 50% lead to proposal
    const dailyProposals = estimatedProposals / 30;  // Monthly to daily

    if (dailyProposals > maxDailyCapacity.cpqProposals) {
      violations.push({
        type: 'capacity',
        constraint: 'CPQ proposals per day',
        current: dailyProposals,
        limit: maxDailyCapacity.cpqProposals,
        severity: 'error',
        suggestion: `Reduce lead generation by ${Math.round((1 - maxDailyCapacity.cpqProposals/dailyProposals) * 100)}% or increase CPQ team capacity`
      });
    }

    // Check meeting capacity
    const estimatedMeetings = plan.expected.leads * 0.3;  // 30% lead to meeting
    const dailyMeetings = estimatedMeetings / 30;

    if (dailyMeetings > maxDailyCapacity.meetings) {
      violations.push({
        type: 'capacity',
        constraint: 'Meetings per day',
        current: dailyMeetings,
        limit: maxDailyCapacity.meetings,
        severity: 'warning',
        suggestion: `Consider qualifying leads more strictly or batching meetings`
      });
    }

    return violations;
  }

  /**
   * Check ramp rate constraints
   */
  private checkRampRateConstraints(
    plan: SpendPlan,
    currentSpend: Map<string, number>
  ): GuardrailViolation[] {
    const violations: GuardrailViolation[] = [];
    const { maxChannelChangeRate } = this.constraints;

    for (const [channel, newSpend] of Object.entries(plan.allocation)) {
      const current = currentSpend.get(channel) || 0;
      if (current === 0) continue;  // Skip new channels

      const changeRate = Math.abs((newSpend - current) / current);

      if (changeRate > maxChannelChangeRate) {
        violations.push({
          type: 'ramp_rate',
          constraint: `${channel} daily change rate`,
          current: changeRate,
          limit: maxChannelChangeRate,
          severity: 'warning',
          suggestion: `Phase the ${channel} change over ${Math.ceil(changeRate / maxChannelChangeRate)} days`
        });
      }
    }

    return violations;
  }

  /**
   * Check pacing constraints
   */
  private checkPacingConstraints(
    plan: SpendPlan,
    dayOfMonth: number
  ): GuardrailViolation[] {
    const violations: GuardrailViolation[] = [];
    const { monthlyPacing, weeklySpendTargets } = this.constraints;

    const totalBudget = Object.values(plan.allocation).reduce((sum, v) => sum + v, 0);
    const expectedSpend = this.calculateExpectedSpend(totalBudget, dayOfMonth, monthlyPacing);
    const actualSpend = this.calculateActualSpend(plan, dayOfMonth);

    const variance = Math.abs(actualSpend - expectedSpend) / expectedSpend;

    if (variance > 0.2) {  // 20% variance threshold
      violations.push({
        type: 'pacing',
        constraint: 'Monthly pacing',
        current: actualSpend,
        limit: expectedSpend,
        severity: 'warning',
        suggestion: actualSpend > expectedSpend
          ? 'Reduce daily spend to avoid early budget exhaustion'
          : 'Increase daily spend to meet monthly targets'
      });
    }

    return violations;
  }

  /**
   * Check platform minimum/maximum constraints
   */
  private checkPlatformConstraints(plan: SpendPlan): GuardrailViolation[] {
    const violations: GuardrailViolation[] = [];
    const { platformMinimums, platformMaximums } = this.constraints;

    for (const [channel, spend] of Object.entries(plan.allocation)) {
      const min = platformMinimums.get(channel);
      if (min && spend < min && spend > 0) {
        violations.push({
          type: 'platform',
          constraint: `${channel} minimum spend`,
          current: spend,
          limit: min,
          severity: 'error',
          suggestion: `Increase ${channel} to minimum ${min} or remove entirely`
        });
      }

      const max = platformMaximums?.get(channel);
      if (max && spend > max) {
        violations.push({
          type: 'platform',
          constraint: `${channel} maximum spend`,
          current: spend,
          limit: max,
          severity: 'error',
          suggestion: `Reduce ${channel} to maximum ${max} and reallocate excess`
        });
      }
    }

    return violations;
  }

  /**
   * Check diversification constraints
   */
  private checkDiversityConstraints(plan: SpendPlan): GuardrailViolation[] {
    const violations: GuardrailViolation[] = [];
    const { maxChannelConcentration, minActiveChannels, diversityRatio } = this.constraints;

    const totalBudget = Object.values(plan.allocation).reduce((sum, v) => sum + v, 0);
    const activeChannels = Object.values(plan.allocation).filter(v => v > 0).length;

    // Check minimum active channels
    if (activeChannels < minActiveChannels) {
      violations.push({
        type: 'diversity',
        constraint: 'Minimum active channels',
        current: activeChannels,
        limit: minActiveChannels,
        severity: 'warning',
        suggestion: `Activate ${minActiveChannels - activeChannels} more channels for risk diversification`
      });
    }

    // Check maximum concentration
    for (const [channel, spend] of Object.entries(plan.allocation)) {
      const concentration = spend / totalBudget;
      if (concentration > maxChannelConcentration) {
        violations.push({
          type: 'diversity',
          constraint: `${channel} concentration`,
          current: concentration,
          limit: maxChannelConcentration,
          severity: 'warning',
          suggestion: `Reduce ${channel} to ${(maxChannelConcentration * 100).toFixed(0)}% and diversify`
        });
      }
    }

    return violations;
  }

  /**
   * Creates an adjusted plan that respects constraints
   */
  private createAdjustedPlan(
    originalPlan: SpendPlan,
    violations: GuardrailViolation[]
  ): SpendPlan {
    const adjusted = { ...originalPlan };
    const allocation = { ...originalPlan.allocation };

    // Fix platform minimums first (highest priority)
    const platformViolations = violations.filter(v => v.type === 'platform' && v.constraint.includes('minimum'));
    for (const violation of platformViolations) {
      const channel = violation.constraint.split(' ')[0];
      allocation[channel] = violation.limit;
    }

    // Fix concentration issues
    const totalBudget = Object.values(allocation).reduce((sum, v) => sum + v, 0);
    const maxConcentration = this.constraints.maxChannelConcentration;

    for (const [channel, spend] of Object.entries(allocation)) {
      const maxAllowed = totalBudget * maxConcentration;
      if (spend > maxAllowed) {
        allocation[channel] = maxAllowed;
      }
    }

    // Recalculate expected outcomes
    adjusted.allocation = allocation;
    adjusted.expected = this.recalculateExpectedOutcomes(allocation);

    return adjusted;
  }

  /**
   * Helper: Calculate expected spend based on pacing
   */
  private calculateExpectedSpend(
    totalBudget: number,
    dayOfMonth: number,
    pacing: 'linear' | 'front_loaded' | 'back_loaded'
  ): number {
    const progressRatio = dayOfMonth / 30;

    switch (pacing) {
      case 'linear':
        return totalBudget * progressRatio;
      case 'front_loaded':
        // 60% in first half, 40% in second half
        return progressRatio <= 0.5
          ? totalBudget * 0.6 * (progressRatio * 2)
          : totalBudget * 0.6 + totalBudget * 0.4 * ((progressRatio - 0.5) * 2);
      case 'back_loaded':
        // 40% in first half, 60% in second half
        return progressRatio <= 0.5
          ? totalBudget * 0.4 * (progressRatio * 2)
          : totalBudget * 0.4 + totalBudget * 0.6 * ((progressRatio - 0.5) * 2);
    }
  }

  /**
   * Helper: Calculate actual spend to date
   */
  private calculateActualSpend(plan: SpendPlan, dayOfMonth: number): number {
    const dailySpend = Object.values(plan.allocation).reduce((sum, v) => sum + v, 0) / 30;
    return dailySpend * dayOfMonth;
  }

  /**
   * Helper: Estimate capacity needed for recommendation
   */
  private estimateCapacityNeeded(rec: Recommendation): {
    proposals: number;
    meetings: number;
    implementations: number;
  } {
    // Estimate based on recommendation type and impact
    const baseLoad = {
      proposals: 0,
      meetings: 0,
      implementations: 0
    };

    // Add estimates based on recommendation actions
    for (const action of rec.actions) {
      if (action.label.toLowerCase().includes('proposal')) {
        baseLoad.proposals += 1;
      }
      if (action.label.toLowerCase().includes('meeting')) {
        baseLoad.meetings += 1;
      }
      if (action.type === 'immediate') {
        baseLoad.implementations += 0.5;
      }
    }

    return baseLoad;
  }

  /**
   * Helper: Check if capacity available
   */
  private hasCapacity(
    needed: { proposals: number; meetings: number; implementations: number },
    current: { proposals: number; meetings: number; implementations: number }
  ): boolean {
    const { maxDailyCapacity } = this.constraints;

    return (
      current.proposals + needed.proposals <= maxDailyCapacity.cpqProposals &&
      current.meetings + needed.meetings <= maxDailyCapacity.meetings &&
      current.implementations + needed.implementations <= maxDailyCapacity.implementations
    );
  }

  /**
   * Helper: Explain capacity constraint
   */
  private explainCapacityConstraint(
    needed: { proposals: number; meetings: number; implementations: number },
    current: { proposals: number; meetings: number; implementations: number }
  ): string {
    const { maxDailyCapacity } = this.constraints;
    const constraints: string[] = [];

    if (current.proposals + needed.proposals > maxDailyCapacity.cpqProposals) {
      constraints.push(`CPQ capacity (need ${needed.proposals}, have ${maxDailyCapacity.cpqProposals - current.proposals})`);
    }
    if (current.meetings + needed.meetings > maxDailyCapacity.meetings) {
      constraints.push(`Meeting capacity (need ${needed.meetings}, have ${maxDailyCapacity.meetings - current.meetings})`);
    }
    if (current.implementations + needed.implementations > maxDailyCapacity.implementations) {
      constraints.push(`Implementation capacity (need ${needed.implementations}, have ${maxDailyCapacity.implementations - current.implementations})`);
    }

    return `Insufficient capacity: ${constraints.join(', ')}`;
  }

  /**
   * Helper: Suggest alternatives for infeasible recommendation
   */
  private suggestAlternatives(
    rec: Recommendation,
    currentLoad: { proposals: number; meetings: number; implementations: number }
  ): string[] {
    const alternatives: string[] = [];

    // Defer to next week
    alternatives.push('Defer implementation to next week when capacity available');

    // Break into phases
    if (rec.actions.length > 2) {
      alternatives.push('Break into phases: implement highest-impact actions first');
    }

    // Delegate or outsource
    if (rec.expectedImpact.revenue && rec.expectedImpact.revenue.delta > 100000) {
      alternatives.push('Consider outsourcing or temporary resources for high-value opportunity');
    }

    // Automate
    const automatableActions = rec.actions.filter(a => a.automatable);
    if (automatableActions.length > 0) {
      alternatives.push(`Automate ${automatableActions.length} actions to reduce capacity needs`);
    }

    return alternatives.slice(0, 3);  // Return top 3 alternatives
  }

  /**
   * Helper: Recalculate expected outcomes after adjustment
   */
  private recalculateExpectedOutcomes(allocation: Record<string, number>): SpendPlan['expected'] {
    // Simplified recalculation - in production would use full model
    const totalSpend = Object.values(allocation).reduce((sum, v) => sum + v, 0);
    const avgConversionRate = 0.1;
    const avgDealValue = 50000;

    const leads = totalSpend / 500;  // $500 CPL estimate
    const wins = leads * avgConversionRate;
    const revenue = wins * avgDealValue;
    const margin = revenue * 0.25;

    return {
      leads: Math.round(leads),
      wins: Math.round(wins),
      revenueMx: revenue,
      marginMx: margin
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GuardrailsValidator;