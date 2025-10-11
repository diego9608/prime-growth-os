/**
 * Experiment Framework
 * Scientific method for testing recommendations
 */

import type {
  ExperimentDesign,
  ExperimentResult,
  Recommendation,
  KPIDefinition,
  ImpactEstimate
} from './types';

import { getAuditLogger } from './audit';

// ============================================================================
// EXPERIMENT TYPES
// ============================================================================

export interface ExperimentConfig {
  id: string;
  recommendationId: string;
  hypothesis: string;

  // Metrics
  primaryMetric: KPIDefinition;
  secondaryMetrics?: KPIDefinition[];
  guardrailMetrics?: KPIDefinition[];  // Metrics that shouldn't degrade

  // Design
  controlGroup: string;
  treatmentGroup: string;
  sampleSize: number;
  minSampleSize: number;
  duration: number;  // days
  minDuration: number;  // days

  // Success criteria
  minimumDetectableEffect: number;  // % change needed
  confidenceLevel: number;  // 0.95 = 95%
  statisticalPower: number;  // 0.8 = 80%

  // Implementation
  rolloutStrategy: 'immediate' | 'phased' | 'ring';
  rolloutPhases?: Array<{
    percentage: number;
    startDay: number;
    criteria: string;
  }>;

  // Status
  status: 'designed' | 'running' | 'paused' | 'completed' | 'abandoned';
  startDate?: Date;
  endDate?: Date;
  pausedReason?: string;

  // Results
  result?: ExperimentResult;
  learnings?: string[];
}

export interface SampleSizeCalculation {
  required: number;
  formula: string;
  assumptions: string[];
  powerAnalysis: {
    alpha: number;  // Type I error rate
    beta: number;   // Type II error rate
    effectSize: number;
    variance: number;
  };
}

export interface ExperimentProgress {
  experiment: ExperimentConfig;
  currentSampleSize: number;
  sampleSizeProgress: number;  // % of required
  currentDuration: number;  // days
  durationProgress: number;  // % of planned

  // Interim results (if peeking allowed)
  interimMetrics?: {
    control: number;
    treatment: number;
    lift: number;
    pValue?: number;
    significant?: boolean;
  };

  // Health checks
  dataQuality: {
    missingData: number;  // %
    outliers: number;  // count
    imbalance: number;  // ratio diff from 50/50
  };

  estimatedCompletion: Date;
  canConcludeEarly: boolean;
  earlyStopReason?: 'success' | 'futility' | 'harm';
}

// ============================================================================
// EXPERIMENT MANAGER
// ============================================================================

export class ExperimentManager {
  private experiments: Map<string, ExperimentConfig> = new Map();
  private readonly auditLogger = getAuditLogger();

  /**
   * Create experiment from recommendation
   */
  createExperiment(
    recommendation: Recommendation,
    userId: string,
    userName: string
  ): ExperimentConfig {
    // Validate recommendation has testable design
    if (!recommendation.testable || !recommendation.testDesign) {
      throw new Error('Recommendation is not testable or lacks experiment design');
    }

    const design = recommendation.testDesign;

    const experiment: ExperimentConfig = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recommendationId: recommendation.id,
      hypothesis: design.hypothesis,

      // Metrics
      primaryMetric: design.metric,

      // Design
      controlGroup: design.controlGroup,
      treatmentGroup: design.treatmentGroup,
      sampleSize: design.sampleSize,
      minSampleSize: Math.floor(design.sampleSize * 0.7),  // 70% minimum
      duration: design.duration,
      minDuration: Math.floor(design.duration * 0.5),  // 50% minimum

      // Success criteria
      minimumDetectableEffect: design.targetDelta,
      confidenceLevel: design.confidenceLevel,
      statisticalPower: design.statisticalPower,

      // Implementation
      rolloutStrategy: 'phased',
      rolloutPhases: [
        { percentage: 10, startDay: 0, criteria: 'No degradation in guardrails' },
        { percentage: 30, startDay: 3, criteria: 'Positive trend in primary metric' },
        { percentage: 100, startDay: 7, criteria: 'Statistical significance achieved' }
      ],

      // Status
      status: 'designed'
    };

    this.experiments.set(experiment.id, experiment);

    // Log creation
    this.auditLogger.logExperiment({
      userId,
      userName,
      action: 'experiment_start',
      experiment: design,
      recommendationId: recommendation.id
    });

    return experiment;
  }

  /**
   * Start an experiment
   */
  startExperiment(experimentId: string): ExperimentConfig {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    if (experiment.status !== 'designed') {
      throw new Error(`Cannot start experiment in status ${experiment.status}`);
    }

    experiment.status = 'running';
    experiment.startDate = new Date();

    this.experiments.set(experimentId, experiment);
    return experiment;
  }

  /**
   * Get experiment progress and health
   */
  getProgress(experimentId: string): ExperimentProgress {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    if (experiment.status !== 'running') {
      throw new Error('Experiment is not running');
    }

    const daysSinceStart = experiment.startDate
      ? (Date.now() - experiment.startDate.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    // Simulate progress (in production, would query actual data)
    const currentSampleSize = Math.min(
      experiment.sampleSize,
      Math.floor(daysSinceStart * experiment.sampleSize / experiment.duration)
    );

    const progress: ExperimentProgress = {
      experiment,
      currentSampleSize,
      sampleSizeProgress: (currentSampleSize / experiment.sampleSize) * 100,
      currentDuration: daysSinceStart,
      durationProgress: (daysSinceStart / experiment.duration) * 100,

      // Simulate interim metrics
      interimMetrics: currentSampleSize > 100 ? {
        control: 100,
        treatment: 115,
        lift: 15,
        pValue: 0.03,
        significant: currentSampleSize > experiment.minSampleSize
      } : undefined,

      // Data quality checks
      dataQuality: {
        missingData: Math.random() * 5,  // 0-5% missing
        outliers: Math.floor(Math.random() * 10),
        imbalance: 0.48 + Math.random() * 0.04  // 48-52% split
      },

      estimatedCompletion: new Date(
        experiment.startDate!.getTime() + experiment.duration * 24 * 60 * 60 * 1000
      ),

      canConcludeEarly: this.checkEarlyStop(experiment, currentSampleSize, daysSinceStart)
    };

    // Check for early stop conditions
    if (progress.interimMetrics) {
      if (progress.interimMetrics.pValue < 0.001 && currentSampleSize > experiment.minSampleSize) {
        progress.earlyStopReason = 'success';
      } else if (progress.interimMetrics.lift < 1 && daysSinceStart > experiment.minDuration) {
        progress.earlyStopReason = 'futility';
      }
    }

    return progress;
  }

  /**
   * Complete an experiment with results
   */
  completeExperiment(
    experimentId: string,
    results: {
      controlMetric: number;
      treatmentMetric: number;
      pValue: number;
      decision: 'roll_out' | 'iterate' | 'abandon';
      learnings: string[];
    },
    userId: string,
    userName: string
  ): ExperimentResult {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    if (experiment.status !== 'running') {
      throw new Error(`Cannot complete experiment in status ${experiment.status}`);
    }

    const lift = ((results.treatmentMetric - results.controlMetric) / results.controlMetric) * 100;
    const significant = results.pValue < (1 - experiment.confidenceLevel);

    const result: ExperimentResult = {
      design: {
        hypothesis: experiment.hypothesis,
        metric: experiment.primaryMetric,
        targetDelta: experiment.minimumDetectableEffect,
        sampleSize: experiment.sampleSize,
        duration: experiment.duration,
        controlGroup: experiment.controlGroup,
        treatmentGroup: experiment.treatmentGroup,
        successThreshold: experiment.minimumDetectableEffect,
        statisticalPower: experiment.statisticalPower,
        confidenceLevel: experiment.confidenceLevel
      },
      startDate: experiment.startDate!,
      endDate: new Date(),
      controlMetric: results.controlMetric,
      treatmentMetric: results.treatmentMetric,
      lift,
      pValue: results.pValue,
      significant,
      decision: results.decision,
      learnings: results.learnings
    };

    experiment.status = 'completed';
    experiment.endDate = result.endDate;
    experiment.result = result;
    experiment.learnings = results.learnings;

    this.experiments.set(experimentId, experiment);

    // Log completion
    this.auditLogger.logExperiment({
      userId,
      userName,
      action: 'experiment_complete',
      experiment: result,
      recommendationId: experiment.recommendationId
    });

    // Update batting average
    this.updateBattingAverage(experiment, result);

    return result;
  }

  /**
   * Calculate required sample size
   */
  calculateSampleSize(
    baselineConversion: number,
    minimumDetectableEffect: number,
    confidenceLevel: number = 0.95,
    statisticalPower: number = 0.8
  ): SampleSizeCalculation {
    // Using standard formula for two-proportion z-test
    const alpha = 1 - confidenceLevel;
    const beta = 1 - statisticalPower;

    // Z-scores
    const zAlpha = this.getZScore(alpha / 2);  // Two-tailed
    const zBeta = this.getZScore(beta);

    // Proportions
    const p1 = baselineConversion;
    const p2 = baselineConversion * (1 + minimumDetectableEffect);
    const pBar = (p1 + p2) / 2;

    // Sample size formula
    const numerator = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) +
                               zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p2 - p1, 2);

    const n = Math.ceil(numerator / denominator);

    return {
      required: n * 2,  // For both control and treatment
      formula: 'Two-proportion z-test',
      assumptions: [
        `Baseline conversion: ${(p1 * 100).toFixed(1)}%`,
        `Target conversion: ${(p2 * 100).toFixed(1)}%`,
        `Type I error (α): ${(alpha * 100).toFixed(1)}%`,
        `Type II error (β): ${(beta * 100).toFixed(1)}%`,
        'Equal allocation (50/50 split)',
        'Independent observations'
      ],
      powerAnalysis: {
        alpha,
        beta,
        effectSize: minimumDetectableEffect,
        variance: pBar * (1 - pBar)
      }
    };
  }

  /**
   * Get all experiments by status
   */
  getExperimentsByStatus(status?: ExperimentConfig['status']): ExperimentConfig[] {
    const experiments = Array.from(this.experiments.values());

    if (status) {
      return experiments.filter(e => e.status === status);
    }

    return experiments;
  }

  /**
   * Get experiments for a recommendation
   */
  getExperimentsForRecommendation(recommendationId: string): ExperimentConfig[] {
    return Array.from(this.experiments.values())
      .filter(e => e.recommendationId === recommendationId);
  }

  /**
   * Calculate time to value across experiments
   */
  calculateTimeToValue(): {
    average: number;  // days
    median: number;
    byDecision: Map<string, number>;
  } {
    const completed = Array.from(this.experiments.values())
      .filter(e => e.status === 'completed' && e.startDate && e.endDate);

    if (completed.length === 0) {
      return { average: 0, median: 0, byDecision: new Map() };
    }

    const durations = completed.map(e =>
      (e.endDate!.getTime() - e.startDate!.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate average
    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Calculate median
    durations.sort((a, b) => a - b);
    const median = durations.length % 2 === 0
      ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
      : durations[Math.floor(durations.length / 2)];

    // By decision type
    const byDecision = new Map<string, number>();
    for (const exp of completed) {
      if (exp.result) {
        const decision = exp.result.decision;
        const duration = (exp.endDate!.getTime() - exp.startDate!.getTime()) / (1000 * 60 * 60 * 24);

        const current = byDecision.get(decision) || [];
        byDecision.set(decision, [...current as any, duration].reduce((a: number, b: number) => a + b, 0) / ([...current as any, duration].length));
      }
    }

    return { average, median, byDecision };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Check if experiment can be stopped early
   */
  private checkEarlyStop(
    experiment: ExperimentConfig,
    currentSampleSize: number,
    daysSinceStart: number
  ): boolean {
    // Can stop if:
    // 1. Reached minimum sample size AND minimum duration
    // 2. OR reached full sample size
    // 3. OR reached full duration

    const hasMinSample = currentSampleSize >= experiment.minSampleSize;
    const hasMinDuration = daysSinceStart >= experiment.minDuration;
    const hasFullSample = currentSampleSize >= experiment.sampleSize;
    const hasFullDuration = daysSinceStart >= experiment.duration;

    return (hasMinSample && hasMinDuration) || hasFullSample || hasFullDuration;
  }

  /**
   * Update batting average based on experiment results
   */
  private updateBattingAverage(
    experiment: ExperimentConfig,
    result: ExperimentResult
  ): void {
    // Success = significant positive lift and rolled out
    const success = result.significant &&
                   result.lift > 0 &&
                   result.decision === 'roll_out';

    // This would update a persistent store in production
    console.log(`Experiment ${experiment.id}: ${success ? 'SUCCESS' : 'FAILURE'}`);
  }

  /**
   * Get z-score for given probability
   */
  private getZScore(p: number): number {
    // Approximation using inverse error function
    // For common values:
    if (Math.abs(p - 0.025) < 0.001) return 1.96;  // 95% confidence
    if (Math.abs(p - 0.05) < 0.001) return 1.645;   // 90% confidence
    if (Math.abs(p - 0.10) < 0.001) return 1.282;   // 80% confidence
    if (Math.abs(p - 0.20) < 0.001) return 0.842;   // 80% power

    // General approximation
    return Math.sqrt(2) * this.inverseErf(1 - 2 * p);
  }

  /**
   * Inverse error function approximation
   */
  private inverseErf(x: number): number {
    const a = 0.147;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const b = 2 / (Math.PI * a) + Math.log(1 - x * x) / 2;
    const c = Math.log(1 - x * x) / a;

    return sign * Math.sqrt(Math.sqrt(b * b - c) - b);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let experimentManager: ExperimentManager | null = null;

export function getExperimentManager(): ExperimentManager {
  if (!experimentManager) {
    experimentManager = new ExperimentManager();
  }
  return experimentManager;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ExperimentManager;