/**
 * LLM Router for Cost Optimization
 * Routes tasks between Sonnet (fast/cheap) and Opus (deep/expensive)
 */

import type { Recommendation, BusinessScenario } from './types';

// ============================================================================
// ROUTER TYPES
// ============================================================================

export interface LLMTask {
  id: string;
  type: 'analysis' | 'generation' | 'extraction' | 'classification' | 'reasoning';
  complexity: 'simple' | 'moderate' | 'complex';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  requirements: {
    accuracy?: number;      // Required accuracy (0-1)
    creativity?: number;    // Required creativity (0-1)
    reasoning?: number;     // Required reasoning depth (0-1)
    speed?: 'fast' | 'normal' | 'thorough';
    maxTokens?: number;
    temperature?: number;
  };
  estimatedTokens?: number;
  businessValue?: number;   // Dollar value of correct decision
}

export interface LLMResponse {
  taskId: string;
  model: 'sonnet' | 'opus' | 'haiku';
  result: any;
  confidence: number;
  tokensUsed: number;
  cost: number;
  latency: number;         // milliseconds
  reasoning?: string;       // Why this model was chosen
}

export interface RoutingDecision {
  task: LLMTask;
  selectedModel: 'sonnet' | 'opus' | 'haiku';
  reasoning: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
  fallbackModel?: 'sonnet' | 'opus';
}

export interface CostOptimizationReport {
  period: { start: Date; end: Date };
  totalTasks: number;
  modelDistribution: {
    haiku: { count: number; cost: number };
    sonnet: { count: number; cost: number };
    opus: { count: number; cost: number };
  };
  totalCost: number;
  costSavings: number;      // vs all-Opus baseline
  avgAccuracy: number;
  avgLatency: number;
  recommendations: string[];
}

// ============================================================================
// LLM ROUTER
// ============================================================================

export class LLMRouter {
  // Model capabilities and costs (per 1K tokens)
  private readonly MODEL_PROFILES = {
    haiku: {
      cost: { input: 0.0008, output: 0.0024 },  // $0.80/$2.40 per 1M
      latency: 500,     // ms baseline
      capabilities: {
        accuracy: 0.85,
        creativity: 0.70,
        reasoning: 0.75,
        speed: 'fast',
        maxContext: 200000
      },
      bestFor: ['extraction', 'classification', 'simple analysis']
    },
    sonnet: {
      cost: { input: 0.003, output: 0.015 },    // $3/$15 per 1M
      latency: 1000,    // ms baseline
      capabilities: {
        accuracy: 0.92,
        creativity: 0.85,
        reasoning: 0.88,
        speed: 'normal',
        maxContext: 200000
      },
      bestFor: ['generation', 'moderate analysis', 'multi-step reasoning']
    },
    opus: {
      cost: { input: 0.015, output: 0.075 },    // $15/$75 per 1M
      latency: 2000,    // ms baseline
      capabilities: {
        accuracy: 0.98,
        creativity: 0.95,
        reasoning: 0.98,
        speed: 'thorough',
        maxContext: 200000
      },
      bestFor: ['complex reasoning', 'critical decisions', 'deep analysis']
    }
  };

  // Task routing rules
  private readonly ROUTING_RULES = [
    // Critical business decisions always use Opus
    {
      condition: (task: LLMTask) => task.urgency === 'critical' && task.businessValue > 100000,
      model: 'opus' as const,
      reason: 'Critical business decision with high value at stake'
    },

    // Simple extraction/classification uses Haiku
    {
      condition: (task: LLMTask) =>
        ['extraction', 'classification'].includes(task.type) &&
        task.complexity === 'simple',
      model: 'haiku' as const,
      reason: 'Simple task suitable for efficient model'
    },

    // High accuracy requirements use Opus
    {
      condition: (task: LLMTask) => task.requirements.accuracy >= 0.95,
      model: 'opus' as const,
      reason: 'High accuracy requirement needs most capable model'
    },

    // Deep reasoning uses Opus
    {
      condition: (task: LLMTask) => task.requirements.reasoning >= 0.90,
      model: 'opus' as const,
      reason: 'Deep reasoning requirement needs advanced model'
    },

    // Fast response uses Haiku or Sonnet
    {
      condition: (task: LLMTask) => task.requirements.speed === 'fast' && task.complexity !== 'complex',
      model: 'haiku' as const,
      reason: 'Speed priority with manageable complexity'
    },

    // Creative generation uses Sonnet
    {
      condition: (task: LLMTask) =>
        task.type === 'generation' &&
        task.requirements.creativity >= 0.80,
      model: 'sonnet' as const,
      reason: 'Creative generation balanced with cost'
    },

    // Default: complexity-based routing
    {
      condition: (task: LLMTask) => task.complexity === 'simple',
      model: 'haiku' as const,
      reason: 'Simple complexity suitable for efficient model'
    },
    {
      condition: (task: LLMTask) => task.complexity === 'moderate',
      model: 'sonnet' as const,
      reason: 'Moderate complexity needs balanced model'
    },
    {
      condition: (task: LLMTask) => task.complexity === 'complex',
      model: 'opus' as const,
      reason: 'Complex task requires most capable model'
    }
  ];

  private taskHistory: LLMResponse[] = [];

  /**
   * Route a task to the optimal LLM
   */
  route(task: LLMTask): RoutingDecision {
    // Apply routing rules in order
    for (const rule of this.ROUTING_RULES) {
      if (rule.condition(task)) {
        return this.createRoutingDecision(task, rule.model, rule.reason);
      }
    }

    // Fallback to Sonnet if no rules match
    return this.createRoutingDecision(
      task,
      'sonnet',
      'Default routing to balanced model'
    );
  }

  /**
   * Route with automatic fallback on quality issues
   */
  routeWithFallback(task: LLMTask): RoutingDecision {
    const primary = this.route(task);

    // Determine fallback model
    let fallbackModel: 'sonnet' | 'opus' | undefined;
    if (primary.selectedModel === 'haiku') {
      fallbackModel = task.complexity === 'complex' ? 'opus' : 'sonnet';
    } else if (primary.selectedModel === 'sonnet' && task.urgency === 'high') {
      fallbackModel = 'opus';
    }

    return {
      ...primary,
      fallbackModel
    };
  }

  /**
   * Batch route multiple tasks for efficiency
   */
  batchRoute(tasks: LLMTask[]): Map<string, RoutingDecision[]> {
    const routing = new Map<string, RoutingDecision[]>();
    routing.set('haiku', []);
    routing.set('sonnet', []);
    routing.set('opus', []);

    for (const task of tasks) {
      const decision = this.route(task);
      routing.get(decision.selectedModel)!.push(decision);
    }

    // Optimize batching
    this.optimizeBatching(routing);

    return routing;
  }

  /**
   * Analyze task and recommend optimal approach
   */
  analyzeTask(
    description: string,
    context: BusinessScenario
  ): LLMTask {
    // Analyze complexity
    const complexity = this.estimateComplexity(description, context);

    // Determine urgency
    const urgency = this.estimateUrgency(context);

    // Estimate requirements
    const requirements = this.estimateRequirements(description, complexity);

    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.classifyTaskType(description),
      complexity,
      urgency,
      context: description,
      requirements,
      estimatedTokens: this.estimateTokens(description),
      businessValue: this.estimateBusinessValue(context)
    };
  }

  /**
   * Generate cost optimization report
   */
  generateCostReport(
    startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: Date = new Date()
  ): CostOptimizationReport {
    const periodTasks = this.taskHistory.filter(
      t => {
        const taskDate = new Date(parseInt(t.taskId.split('-')[1]));
        return taskDate >= startDate && taskDate <= endDate;
      }
    );

    const modelDistribution = {
      haiku: { count: 0, cost: 0 },
      sonnet: { count: 0, cost: 0 },
      opus: { count: 0, cost: 0 }
    };

    let totalAccuracy = 0;
    let totalLatency = 0;

    for (const task of periodTasks) {
      modelDistribution[task.model].count++;
      modelDistribution[task.model].cost += task.cost;
      totalAccuracy += task.confidence;
      totalLatency += task.latency;
    }

    // Calculate what it would cost with all-Opus
    const opusBaseline = periodTasks.reduce((sum, task) => {
      const opusCost = this.calculateCost('opus', task.tokensUsed);
      return sum + opusCost;
    }, 0);

    const totalCost = modelDistribution.haiku.cost +
                     modelDistribution.sonnet.cost +
                     modelDistribution.opus.cost;

    const recommendations = this.generateOptimizationRecommendations(modelDistribution);

    return {
      period: { start: startDate, end: endDate },
      totalTasks: periodTasks.length,
      modelDistribution,
      totalCost,
      costSavings: opusBaseline - totalCost,
      avgAccuracy: periodTasks.length > 0 ? totalAccuracy / periodTasks.length : 0,
      avgLatency: periodTasks.length > 0 ? totalLatency / periodTasks.length : 0,
      recommendations
    };
  }

  /**
   * Simulate task execution (for demo/testing)
   */
  simulateExecution(task: LLMTask, model: 'haiku' | 'sonnet' | 'opus'): LLMResponse {
    const profile = this.MODEL_PROFILES[model];
    const tokens = task.estimatedTokens || 1000;

    const response: LLMResponse = {
      taskId: task.id,
      model,
      result: `Simulated ${model} response for ${task.type} task`,
      confidence: profile.capabilities.accuracy + (Math.random() * 0.1 - 0.05),
      tokensUsed: tokens,
      cost: this.calculateCost(model, tokens),
      latency: profile.latency * (0.8 + Math.random() * 0.4),
      reasoning: `Used ${model} for ${task.type} with ${task.complexity} complexity`
    };

    this.taskHistory.push(response);
    return response;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private createRoutingDecision(
    task: LLMTask,
    model: 'haiku' | 'sonnet' | 'opus',
    reasoning: string
  ): RoutingDecision {
    const tokens = task.estimatedTokens || 1000;
    const profile = this.MODEL_PROFILES[model];

    return {
      task,
      selectedModel: model,
      reasoning,
      estimatedCost: this.calculateCost(model, tokens),
      estimatedLatency: profile.latency,
      confidence: this.estimateConfidence(task, model)
    };
  }

  private calculateCost(model: 'haiku' | 'sonnet' | 'opus', tokens: number): number {
    const profile = this.MODEL_PROFILES[model];
    // Assume 70% input, 30% output for typical task
    const inputTokens = tokens * 0.7;
    const outputTokens = tokens * 0.3;

    return (inputTokens * profile.cost.input / 1000) +
           (outputTokens * profile.cost.output / 1000);
  }

  private estimateConfidence(task: LLMTask, model: 'haiku' | 'sonnet' | 'opus'): number {
    const profile = this.MODEL_PROFILES[model];
    let confidence = profile.capabilities.accuracy;

    // Adjust based on task-model fit
    if (task.complexity === 'complex' && model === 'haiku') {
      confidence *= 0.7;
    } else if (task.complexity === 'simple' && model === 'opus') {
      confidence *= 1.02; // Slight boost for overqualified model
    }

    // Adjust for specific requirements
    if (task.requirements.accuracy && task.requirements.accuracy > profile.capabilities.accuracy) {
      confidence *= 0.9;
    }

    return Math.min(1, confidence);
  }

  private estimateComplexity(
    description: string,
    context: BusinessScenario
  ): 'simple' | 'moderate' | 'complex' {
    // Simple heuristics for complexity estimation
    const factors = {
      length: description.length > 1000 ? 1 : 0,
      multiStep: description.includes('then') || description.includes('after') ? 1 : 0,
      analysis: description.includes('analyze') || description.includes('compare') ? 1 : 0,
      reasoning: description.includes('why') || description.includes('explain') ? 1 : 0,
      dataPoints: context.channels?.length > 5 ? 1 : 0
    };

    const score = Object.values(factors).reduce((sum, v) => sum + v, 0);

    if (score >= 3) return 'complex';
    if (score >= 1) return 'moderate';
    return 'simple';
  }

  private estimateUrgency(context: BusinessScenario): 'low' | 'medium' | 'high' | 'critical' {
    if (context.companyContext?.includes('urgent') ||
        context.companyContext?.includes('critical')) {
      return 'critical';
    }
    if (context.monthlyBudget > 1000000) return 'high';
    if (context.monthlyBudget > 100000) return 'medium';
    return 'low';
  }

  private estimateRequirements(
    description: string,
    complexity: 'simple' | 'moderate' | 'complex'
  ): LLMTask['requirements'] {
    return {
      accuracy: complexity === 'complex' ? 0.95 : complexity === 'moderate' ? 0.90 : 0.85,
      creativity: description.includes('generate') || description.includes('create') ? 0.80 : 0.50,
      reasoning: complexity === 'complex' ? 0.90 : 0.70,
      speed: complexity === 'simple' ? 'fast' : 'normal',
      maxTokens: complexity === 'complex' ? 4000 : 2000,
      temperature: description.includes('creative') ? 0.8 : 0.3
    };
  }

  private classifyTaskType(
    description: string
  ): 'analysis' | 'generation' | 'extraction' | 'classification' | 'reasoning' {
    const lower = description.toLowerCase();

    if (lower.includes('extract') || lower.includes('find')) return 'extraction';
    if (lower.includes('classify') || lower.includes('categorize')) return 'classification';
    if (lower.includes('generate') || lower.includes('create')) return 'generation';
    if (lower.includes('why') || lower.includes('explain')) return 'reasoning';
    return 'analysis';
  }

  private estimateTokens(description: string): number {
    // Rough estimate: 1 token per 4 characters
    return Math.ceil(description.length / 4) * 2; // x2 for response
  }

  private estimateBusinessValue(context: BusinessScenario): number {
    // Estimate based on budget and metrics
    const monthlyValue = context.monthlyBudget * 0.1; // Assume 10% impact
    return monthlyValue * 12; // Annual value
  }

  private optimizeBatching(routing: Map<string, RoutingDecision[]>): void {
    // Optimize batch sizes for each model
    const OPTIMAL_BATCH_SIZES = {
      haiku: 10,
      sonnet: 5,
      opus: 3
    };

    for (const [model, decisions] of routing.entries()) {
      const optimalSize = OPTIMAL_BATCH_SIZES[model as keyof typeof OPTIMAL_BATCH_SIZES];

      // Group into optimal batch sizes
      if (decisions.length > optimalSize * 2) {
        // Would implement actual batching logic here
        console.log(`Batching ${decisions.length} ${model} tasks into groups of ${optimalSize}`);
      }
    }
  }

  private generateOptimizationRecommendations(
    distribution: CostOptimizationReport['modelDistribution']
  ): string[] {
    const recommendations: string[] = [];
    const total = distribution.haiku.count + distribution.sonnet.count + distribution.opus.count;

    if (total === 0) return ['No tasks in period'];

    const opusRatio = distribution.opus.count / total;
    const haikuRatio = distribution.haiku.count / total;

    if (opusRatio > 0.3) {
      recommendations.push('High Opus usage (>30%). Review if all tasks truly need maximum capability.');
    }

    if (haikuRatio < 0.4) {
      recommendations.push('Low Haiku usage (<40%). Consider routing more simple tasks to save costs.');
    }

    if (distribution.sonnet.count / total > 0.5) {
      recommendations.push('Sonnet handling majority of tasks. Good balance of cost and capability.');
    }

    const avgCostPerTask = (distribution.haiku.cost + distribution.sonnet.cost + distribution.opus.cost) / total;
    if (avgCostPerTask > 0.05) {
      recommendations.push(`High average cost per task ($${avgCostPerTask.toFixed(3)}). Review task batching opportunities.`);
    }

    recommendations.push('Consider implementing caching for repeated similar queries.');

    return recommendations;
  }
}

// ============================================================================
// TASK TEMPLATES
// ============================================================================

export class TaskTemplates {
  /**
   * Common SGP task templates with pre-configured routing
   */
  static readonly TEMPLATES = {
    // Simple extraction (Haiku)
    extractMetrics: (): LLMTask => ({
      id: `extract-${Date.now()}`,
      type: 'extraction',
      complexity: 'simple',
      urgency: 'low',
      context: 'Extract KPI values from structured data',
      requirements: {
        accuracy: 0.85,
        speed: 'fast',
        maxTokens: 1000
      },
      estimatedTokens: 500
    }),

    // Moderate analysis (Sonnet)
    analyzeChannel: (): LLMTask => ({
      id: `analyze-${Date.now()}`,
      type: 'analysis',
      complexity: 'moderate',
      urgency: 'medium',
      context: 'Analyze marketing channel performance and identify trends',
      requirements: {
        accuracy: 0.90,
        reasoning: 0.80,
        speed: 'normal',
        maxTokens: 2000
      },
      estimatedTokens: 1500
    }),

    // Complex reasoning (Opus)
    strategicRecommendation: (): LLMTask => ({
      id: `strategy-${Date.now()}`,
      type: 'reasoning',
      complexity: 'complex',
      urgency: 'high',
      context: 'Generate strategic growth recommendations with deep market analysis',
      requirements: {
        accuracy: 0.95,
        creativity: 0.85,
        reasoning: 0.95,
        speed: 'thorough',
        maxTokens: 4000
      },
      estimatedTokens: 3000,
      businessValue: 500000
    }),

    // Generation (Sonnet)
    generateNarrative: (): LLMTask => ({
      id: `narrative-${Date.now()}`,
      type: 'generation',
      complexity: 'moderate',
      urgency: 'medium',
      context: 'Generate executive narrative from business metrics',
      requirements: {
        accuracy: 0.88,
        creativity: 0.90,
        speed: 'normal',
        maxTokens: 2500,
        temperature: 0.7
      },
      estimatedTokens: 2000
    })
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LLMRouter;