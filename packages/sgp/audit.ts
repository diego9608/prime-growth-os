/**
 * Audit Log System
 * SOC2-grade tracking for governance and compliance
 */

import type {
  Recommendation,
  ImpactEstimate,
  ExperimentDesign,
  ExperimentResult
} from './types';

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditAction =
  | 'view'
  | 'accept'
  | 'reject'
  | 'modify'
  | 'defer'
  | 'experiment_start'
  | 'experiment_complete';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: 'recommendation' | 'experiment' | 'spend_plan' | 'contract';
  entityId: string;
  entityTitle: string;

  // Decision details
  reasoning?: string;
  modifications?: Record<string, any>;
  deferredUntil?: Date;
  assignedTo?: string;

  // Results tracking
  expectedImpact?: ImpactEstimate;
  actualImpact?: ImpactEstimate;
  variance?: number;  // % difference from expected

  // Metadata
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  tags?: string[];
}

export interface AuditSummary {
  totalDecisions: number;
  acceptanceRate: number;
  avgTimeToDecision: number;  // hours
  avgTimeToValue: number;     // days
  battingAverage: Map<string, number>;  // success rate by recommendation type
  topDecisionMakers: Array<{ userId: string; userName: string; decisions: number }>;
  impactRealized: {
    revenue: number;
    margin: number;
    velocity: number;
  };
}

// ============================================================================
// AUDIT LOGGER
// ============================================================================

export class AuditLogger {
  private entries: AuditEntry[] = [];
  private readonly retentionDays: number;
  private readonly autoExport: boolean;

  constructor(config?: {
    retentionDays?: number;
    autoExport?: boolean;
  }) {
    this.retentionDays = config?.retentionDays || Number(process.env.AUDIT_RETENTION_DAYS) || 365;
    this.autoExport = config?.autoExport || false;
  }

  /**
   * Log a decision or action
   */
  logDecision(params: {
    userId: string;
    userName: string;
    action: AuditAction;
    recommendation: Recommendation;
    reasoning?: string;
    modifications?: Record<string, any>;
    deferredUntil?: Date;
    assignedTo?: string;
  }): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: params.userId,
      userName: params.userName,
      action: params.action,
      entityType: 'recommendation',
      entityId: params.recommendation.id,
      entityTitle: params.recommendation.title,
      reasoning: params.reasoning,
      modifications: params.modifications,
      deferredUntil: params.deferredUntil,
      assignedTo: params.assignedTo,
      expectedImpact: params.recommendation.expectedImpact,
      sessionId: this.getSessionId(),
      tags: this.extractTags(params.recommendation)
    };

    this.entries.push(entry);
    this.cleanOldEntries();

    if (this.autoExport) {
      this.exportToStorage(entry);
    }

    return entry;
  }

  /**
   * Log experiment lifecycle events
   */
  logExperiment(params: {
    userId: string;
    userName: string;
    action: 'experiment_start' | 'experiment_complete';
    experiment: ExperimentDesign | ExperimentResult;
    recommendationId: string;
  }): AuditEntry {
    const isResult = 'decision' in params.experiment;

    const entry: AuditEntry = {
      id: `audit-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: params.userId,
      userName: params.userName,
      action: params.action,
      entityType: 'experiment',
      entityId: params.recommendationId,
      entityTitle: params.experiment.hypothesis,
      sessionId: this.getSessionId(),
      tags: ['experiment']
    };

    if (isResult && params.action === 'experiment_complete') {
      const result = params.experiment as ExperimentResult;
      entry.actualImpact = {
        revenue: { baseline: result.controlMetric, target: result.treatmentMetric, delta: result.lift, deltaPercent: result.lift, unit: 'metric' },
        timeToImpact: (result.endDate.getTime() - result.startDate.getTime()) / (1000 * 60 * 60 * 24),
        sustainabilityMonths: 12  // Default estimate
      };
    }

    this.entries.push(entry);
    return entry;
  }

  /**
   * Get audit history for an entity
   */
  getHistory(entityId: string): AuditEntry[] {
    return this.entries
      .filter(e => e.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get audit summary statistics
   */
  getSummary(startDate?: Date, endDate?: Date): AuditSummary {
    const filtered = this.filterByDateRange(startDate, endDate);

    // Calculate acceptance rate
    const decisions = filtered.filter(e => ['accept', 'reject', 'defer'].includes(e.action));
    const accepted = decisions.filter(e => e.action === 'accept');
    const acceptanceRate = decisions.length > 0 ? accepted.length / decisions.length : 0;

    // Calculate time to decision
    const timeToDecision = this.calculateAvgTimeToDecision(filtered);

    // Calculate time to value
    const timeToValue = this.calculateAvgTimeToValue(filtered);

    // Calculate batting average by type
    const battingAverage = this.calculateBattingAverage(filtered);

    // Get top decision makers
    const topDecisionMakers = this.getTopDecisionMakers(filtered);

    // Calculate realized impact
    const impactRealized = this.calculateRealizedImpact(filtered);

    return {
      totalDecisions: decisions.length,
      acceptanceRate,
      avgTimeToDecision: timeToDecision,
      avgTimeToValue: timeToValue,
      battingAverage,
      topDecisionMakers,
      impactRealized
    };
  }

  /**
   * Calculate batting average (success rate) by recommendation type
   */
  calculateBattingAverage(entries?: AuditEntry[]): Map<string, number> {
    const data = entries || this.entries;
    const byType = new Map<string, { total: number; successful: number }>();

    // Group by recommendation type (using tags)
    for (const entry of data) {
      if (entry.entityType !== 'recommendation' || !entry.tags) continue;

      const type = entry.tags[0] || 'other';  // First tag is usually the type

      if (!byType.has(type)) {
        byType.set(type, { total: 0, successful: 0 });
      }

      const stats = byType.get(type)!;

      if (entry.action === 'accept') {
        stats.total++;

        // Check if actual impact met expectations
        if (entry.actualImpact && entry.expectedImpact) {
          const success = this.isSuccessful(entry.expectedImpact, entry.actualImpact);
          if (success) stats.successful++;
        }
      }
    }

    // Calculate percentages
    const battingAverage = new Map<string, number>();
    for (const [type, stats] of byType) {
      if (stats.total > 0) {
        battingAverage.set(type, stats.successful / stats.total);
      }
    }

    return battingAverage;
  }

  /**
   * Export audit log to CSV
   */
  exportToCSV(startDate?: Date, endDate?: Date): string {
    const filtered = this.filterByDateRange(startDate, endDate);

    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Entity Type',
      'Entity',
      'Reasoning',
      'Expected Revenue Impact',
      'Expected Margin Impact',
      'Actual Revenue Impact',
      'Actual Margin Impact',
      'Assigned To',
      'Tags'
    ];

    const rows = filtered.map(entry => [
      entry.timestamp.toISOString(),
      entry.userName,
      entry.action,
      entry.entityType,
      entry.entityTitle,
      entry.reasoning || '',
      entry.expectedImpact?.revenue?.delta?.toString() || '',
      entry.expectedImpact?.margin?.delta?.toString() || '',
      entry.actualImpact?.revenue?.delta?.toString() || '',
      entry.actualImpact?.margin?.delta?.toString() || '',
      entry.assignedTo || '',
      entry.tags?.join(', ') || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  /**
   * Export audit log to PDF-ready format
   */
  exportToPDFData(startDate?: Date, endDate?: Date): {
    title: string;
    period: string;
    summary: AuditSummary;
    recentDecisions: Array<{
      date: string;
      user: string;
      decision: string;
      impact: string;
    }>;
  } {
    const filtered = this.filterByDateRange(startDate, endDate);
    const summary = this.getSummary(startDate, endDate);

    const recentDecisions = filtered
      .filter(e => ['accept', 'reject'].includes(e.action))
      .slice(0, 10)
      .map(entry => ({
        date: entry.timestamp.toLocaleDateString(),
        user: entry.userName,
        decision: `${entry.action === 'accept' ? 'Accepted' : 'Rejected'}: ${entry.entityTitle}`,
        impact: entry.expectedImpact?.revenue?.delta
          ? `$${(entry.expectedImpact.revenue.delta / 1000).toFixed(0)}K revenue`
          : 'N/A'
      }));

    return {
      title: 'Audit Log Report',
      period: `${startDate?.toLocaleDateString() || 'All time'} - ${endDate?.toLocaleDateString() || 'Present'}`,
      summary,
      recentDecisions
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Clean entries older than retention period
   */
  private cleanOldEntries(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    this.entries = this.entries.filter(e => e.timestamp > cutoffDate);
  }

  /**
   * Filter entries by date range
   */
  private filterByDateRange(startDate?: Date, endDate?: Date): AuditEntry[] {
    return this.entries.filter(e => {
      if (startDate && e.timestamp < startDate) return false;
      if (endDate && e.timestamp > endDate) return false;
      return true;
    });
  }

  /**
   * Calculate average time from view to decision
   */
  private calculateAvgTimeToDecision(entries: AuditEntry[]): number {
    const decisions = entries.filter(e => ['accept', 'reject'].includes(e.action));
    if (decisions.length === 0) return 0;

    let totalTime = 0;
    let count = 0;

    for (const decision of decisions) {
      // Find the corresponding view event
      const view = entries.find(e =>
        e.entityId === decision.entityId &&
        e.action === 'view' &&
        e.timestamp < decision.timestamp
      );

      if (view) {
        const hours = (decision.timestamp.getTime() - view.timestamp.getTime()) / (1000 * 60 * 60);
        totalTime += hours;
        count++;
      }
    }

    return count > 0 ? totalTime / count : 0;
  }

  /**
   * Calculate average time from acceptance to value realization
   */
  private calculateAvgTimeToValue(entries: AuditEntry[]): number {
    const completed = entries.filter(e =>
      e.action === 'experiment_complete' &&
      e.actualImpact
    );

    if (completed.length === 0) return 0;

    const totalDays = completed.reduce((sum, entry) => {
      return sum + (entry.actualImpact?.timeToImpact || 0);
    }, 0);

    return totalDays / completed.length;
  }

  /**
   * Get top decision makers by count
   */
  private getTopDecisionMakers(entries: AuditEntry[]): Array<{
    userId: string;
    userName: string;
    decisions: number;
  }> {
    const userCounts = new Map<string, { userName: string; count: number }>();

    for (const entry of entries) {
      if (!['accept', 'reject'].includes(entry.action)) continue;

      const current = userCounts.get(entry.userId) || { userName: entry.userName, count: 0 };
      current.count++;
      userCounts.set(entry.userId, current);
    }

    return Array.from(userCounts.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.userName,
        decisions: data.count
      }))
      .sort((a, b) => b.decisions - a.decisions)
      .slice(0, 5);
  }

  /**
   * Calculate total realized impact
   */
  private calculateRealizedImpact(entries: AuditEntry[]): {
    revenue: number;
    margin: number;
    velocity: number;
  } {
    let revenue = 0;
    let margin = 0;
    let velocity = 0;

    for (const entry of entries) {
      if (entry.actualImpact) {
        revenue += entry.actualImpact.revenue?.delta || 0;
        margin += entry.actualImpact.margin?.delta || 0;
        velocity += entry.actualImpact.velocity?.delta || 0;
      }
    }

    return { revenue, margin, velocity };
  }

  /**
   * Check if actual impact met expectations
   */
  private isSuccessful(expected: ImpactEstimate, actual: ImpactEstimate): boolean {
    const threshold = 0.7;  // 70% of expected is considered success

    if (expected.revenue && actual.revenue) {
      return actual.revenue.delta >= expected.revenue.delta * threshold;
    }

    if (expected.margin && actual.margin) {
      return actual.margin.delta >= expected.margin.delta * threshold;
    }

    return false;
  }

  /**
   * Extract tags from recommendation for categorization
   */
  private extractTags(recommendation: Recommendation): string[] {
    const tags: string[] = [];

    // Add priority as tag
    tags.push(`priority-${recommendation.priority}`);

    // Add status
    tags.push(recommendation.status);

    // Extract type from title (simple heuristic)
    if (recommendation.title.toLowerCase().includes('bottleneck')) {
      tags.push('bottleneck');
    } else if (recommendation.title.toLowerCase().includes('pricing')) {
      tags.push('pricing');
    } else if (recommendation.title.toLowerCase().includes('spend')) {
      tags.push('spend-optimization');
    } else if (recommendation.title.toLowerCase().includes('process')) {
      tags.push('process');
    }

    return tags;
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    // In a real implementation, this would be managed by the app
    return `session-${Date.now()}`;
  }

  /**
   * Export to external storage (stub for integration)
   */
  private exportToStorage(entry: AuditEntry): void {
    // In production, this would send to database or external audit service
    console.log('[Audit]', entry);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let auditLogger: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
  if (!auditLogger) {
    auditLogger = new AuditLogger();
  }
  return auditLogger;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AuditLogger;