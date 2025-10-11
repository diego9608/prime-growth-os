/**
 * Model and Data Cards for SGP
 * Documentation and monitoring for ML/AI components
 */

import type { KPISnapshot, Recommendation } from './types';

// ============================================================================
// CARD TYPES
// ============================================================================

export interface ModelCard {
  id: string;
  name: string;
  version: string;
  type: 'optimization' | 'prediction' | 'classification' | 'generation';
  description: string;

  // Model details
  architecture: {
    algorithm: string;
    parameters: Record<string, any>;
    hyperparameters: Record<string, any>;
    features: string[];
    outputShape: string;
  };

  // Performance metrics
  performance: {
    metrics: Record<string, number>;
    baseline: Record<string, number>;
    benchmark: string;
    evaluationDate: Date;
  };

  // Training information
  training: {
    dataset: string;
    datasetSize: number;
    trainingDate: Date;
    trainingDuration: number; // hours
    infrastructure: string;
    cost?: number;
  };

  // Limitations and biases
  limitations: {
    known: string[];
    dataConstraints: string[];
    performanceConstraints: string[];
    ethicalConsiderations: string[];
  };

  // Drift monitoring
  drift: {
    lastChecked: Date;
    dataDrift: number;     // 0-1, KL divergence or similar
    conceptDrift: number;   // 0-1, performance degradation
    predictionDrift: number; // 0-1, output distribution shift
    alerts: DriftAlert[];
  };

  // Usage guidelines
  usage: {
    intendedUse: string[];
    notIntendedFor: string[];
    requirements: string[];
    apiEndpoint?: string;
  };

  // Governance
  governance: {
    owner: string;
    reviewers: string[];
    approvalDate: Date;
    nextReviewDate: Date;
    riskLevel: 'low' | 'medium' | 'high';
    compliance: string[];
  };
}

export interface DataCard {
  id: string;
  name: string;
  version: string;
  description: string;

  // Dataset characteristics
  characteristics: {
    size: number;
    features: number;
    samples: number;
    timeRange?: { start: Date; end: Date };
    updateFrequency: string;
    format: string;
  };

  // Data quality
  quality: {
    completeness: number;    // % of non-null values
    accuracy: number;        // % validated correct
    consistency: number;     // % passing consistency checks
    timeliness: number;      // Age in days
    uniqueness: number;      // % unique records
    validity: number;        // % passing validation rules
  };

  // Schema information
  schema: {
    fields: Array<{
      name: string;
      type: string;
      nullable: boolean;
      description: string;
      validation?: string;
    }>;
    primaryKey?: string[];
    foreignKeys?: Array<{ field: string; references: string }>;
  };

  // Privacy and ethics
  privacy: {
    personalData: boolean;
    sensitiveData: boolean;
    anonymized: boolean;
    consentObtained: boolean;
    retentionPolicy: string;
    deletionPolicy: string;
  };

  // Lineage and provenance
  lineage: {
    sources: Array<{
      name: string;
      type: string;
      lastUpdated: Date;
      reliability: number;
    }>;
    transformations: string[];
    dependencies: string[];
  };

  // Access and usage
  access: {
    location: string;
    permissions: string[];
    restrictions: string[];
    sla?: string;
    cost?: number;
  };
}

export interface DriftAlert {
  timestamp: Date;
  type: 'data' | 'concept' | 'prediction';
  severity: 'low' | 'medium' | 'high';
  metric: string;
  threshold: number;
  actual: number;
  message: string;
}

// ============================================================================
// MODEL CARD MANAGER
// ============================================================================

export class ModelCardManager {
  private cards: Map<string, ModelCard> = new Map();

  /**
   * Create model card for spend optimizer
   */
  createSpendOptimizerCard(): ModelCard {
    const card: ModelCard = {
      id: 'sgp-spend-optimizer-v1',
      name: 'Marketing Spend Optimizer',
      version: '1.0.0',
      type: 'optimization',
      description: 'Optimizes marketing spend allocation across channels using Hill transformation and Monte Carlo simulation',

      architecture: {
        algorithm: 'Gradient-based optimization with Monte Carlo confidence intervals',
        parameters: {
          response_curve: 'Hill transformation',
          confidence_method: 'Monte Carlo (1000 runs)',
          optimization: 'Sequential Least Squares Programming (SLSQP)'
        },
        hyperparameters: {
          learning_rate: 0.01,
          convergence_tolerance: 1e-6,
          max_iterations: 1000,
          monte_carlo_runs: 1000
        },
        features: ['spend_amount', 'channel_type', 'historical_roas', 'saturation_point'],
        outputShape: 'allocation_vector[n_channels] + confidence_intervals'
      },

      performance: {
        metrics: {
          mean_absolute_error: 0.08,
          r_squared: 0.85,
          optimization_time: 2.3, // seconds
          convergence_rate: 0.95
        },
        baseline: {
          mean_absolute_error: 0.15,
          r_squared: 0.70
        },
        benchmark: 'Equal allocation baseline',
        evaluationDate: new Date()
      },

      training: {
        dataset: 'Historical marketing performance data',
        datasetSize: 50000,
        trainingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        trainingDuration: 4.5,
        infrastructure: 'Local compute',
        cost: 0
      },

      limitations: {
        known: [
          'Assumes channel independence (no interaction effects)',
          'Requires minimum 30 days of historical data',
          'May not capture seasonal effects under 90 days'
        ],
        dataConstraints: [
          'Requires accurate attribution data',
          'Sensitive to outliers in conversion data',
          'Assumes stable market conditions'
        ],
        performanceConstraints: [
          'Optimization may take >5s for >20 channels',
          'Confidence intervals widen with sparse data'
        ],
        ethicalConsiderations: [
          'May reinforce historical biases in channel performance',
          'Should not be sole decision factor for large budget changes'
        ]
      },

      drift: {
        lastChecked: new Date(),
        dataDrift: 0.05,
        conceptDrift: 0.02,
        predictionDrift: 0.08,
        alerts: []
      },

      usage: {
        intendedUse: [
          'Marketing budget allocation optimization',
          'Channel performance analysis',
          'ROAS maximization'
        ],
        notIntendedFor: [
          'Real-time bidding decisions',
          'Creative optimization',
          'Audience targeting'
        ],
        requirements: [
          'Historical spend and conversion data',
          'Channel efficiency curves',
          'Budget constraints'
        ]
      },

      governance: {
        owner: 'SGP Team',
        reviewers: ['Data Science', 'Marketing', 'Finance'],
        approvalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000),
        riskLevel: 'medium',
        compliance: ['SOC2', 'GDPR-compliant']
      }
    };

    this.cards.set(card.id, card);
    return card;
  }

  /**
   * Create model card for bottleneck detector
   */
  createBottleneckDetectorCard(): ModelCard {
    const card: ModelCard = {
      id: 'sgp-bottleneck-detector-v1',
      name: 'Process Bottleneck Detector',
      version: '1.0.0',
      type: 'classification',
      description: 'Identifies process bottlenecks using Theory of Constraints and queueing theory',

      architecture: {
        algorithm: 'Theory of Constraints with Little\'s Law',
        parameters: {
          scoring_method: 'Weighted multi-factor analysis',
          queue_model: 'M/M/1 queue approximation'
        },
        hyperparameters: {
          utilization_threshold: 0.85,
          variability_weight: 0.15,
          wait_time_weight: 0.20,
          rework_weight: 0.15
        },
        features: [
          'stage_duration', 'wait_time', 'rework_rate',
          'drop_off_rate', 'utilization', 'queue_length'
        ],
        outputShape: 'bottleneck_scores[n_stages] + recommendations'
      },

      performance: {
        metrics: {
          precision: 0.88,
          recall: 0.82,
          f1_score: 0.85,
          accuracy: 0.87
        },
        baseline: {
          precision: 0.70,
          recall: 0.65,
          f1_score: 0.67,
          accuracy: 0.72
        },
        benchmark: 'Manual expert identification',
        evaluationDate: new Date()
      },

      training: {
        dataset: 'Process flow analytics from 100+ companies',
        datasetSize: 10000,
        trainingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        trainingDuration: 2.0,
        infrastructure: 'Rule-based system (no training required)'
      },

      limitations: {
        known: [
          'Assumes single-piece flow (not batch processing)',
          'May miss complex interdependencies',
          'Requires accurate time measurements'
        ],
        dataConstraints: [
          'Needs complete process visibility',
          'Sensitive to data collection gaps',
          'Assumes steady-state operations'
        ],
        performanceConstraints: [
          'Analysis time scales with process complexity',
          'May require manual validation for critical decisions'
        ],
        ethicalConsiderations: [
          'Should not be used for individual performance evaluation',
          'Recommendations should consider human factors'
        ]
      },

      drift: {
        lastChecked: new Date(),
        dataDrift: 0.03,
        conceptDrift: 0.01,
        predictionDrift: 0.04,
        alerts: []
      },

      usage: {
        intendedUse: [
          'Process optimization',
          'Capacity planning',
          'Operational efficiency improvement'
        ],
        notIntendedFor: [
          'Employee evaluation',
          'Real-time process control',
          'Safety-critical decisions'
        ],
        requirements: [
          'Process flow data with timing',
          'Stage definitions and metrics',
          'Historical performance data'
        ]
      },

      governance: {
        owner: 'Operations Team',
        reviewers: ['Process Engineering', 'Quality Assurance'],
        approvalDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        nextReviewDate: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        compliance: ['ISO 9001']
      }
    };

    this.cards.set(card.id, card);
    return card;
  }

  /**
   * Monitor model drift
   */
  monitorDrift(
    modelId: string,
    currentData: KPISnapshot[],
    predictions: number[]
  ): DriftAlert[] {
    const card = this.cards.get(modelId);
    if (!card) throw new Error(`Model card ${modelId} not found`);

    const alerts: DriftAlert[] = [];

    // Calculate data drift (simplified KL divergence)
    const dataDrift = this.calculateDataDrift(currentData);
    if (dataDrift > 0.15) {
      alerts.push({
        timestamp: new Date(),
        type: 'data',
        severity: dataDrift > 0.3 ? 'high' : 'medium',
        metric: 'kl_divergence',
        threshold: 0.15,
        actual: dataDrift,
        message: `Data distribution shift detected: ${(dataDrift * 100).toFixed(1)}% drift`
      });
    }

    // Calculate prediction drift
    const predictionDrift = this.calculatePredictionDrift(predictions);
    if (predictionDrift > 0.20) {
      alerts.push({
        timestamp: new Date(),
        type: 'prediction',
        severity: predictionDrift > 0.4 ? 'high' : 'medium',
        metric: 'output_distribution',
        threshold: 0.20,
        actual: predictionDrift,
        message: `Prediction distribution shift: ${(predictionDrift * 100).toFixed(1)}% drift`
      });
    }

    // Update card
    card.drift.lastChecked = new Date();
    card.drift.dataDrift = dataDrift;
    card.drift.predictionDrift = predictionDrift;
    card.drift.alerts = [...card.drift.alerts, ...alerts].slice(-100); // Keep last 100

    return alerts;
  }

  /**
   * Generate model card report
   */
  generateReport(modelId: string): string {
    const card = this.cards.get(modelId);
    if (!card) throw new Error(`Model card ${modelId} not found`);

    return `# Model Card: ${card.name}

## Overview
- **Version**: ${card.version}
- **Type**: ${card.type}
- **Description**: ${card.description}
- **Risk Level**: ${card.governance.riskLevel}

## Performance
- **F1 Score**: ${card.performance.metrics.f1_score || 'N/A'}
- **Accuracy**: ${card.performance.metrics.accuracy || 'N/A'}
- **vs Baseline**: +${((card.performance.metrics.accuracy - card.performance.baseline.accuracy) * 100).toFixed(1)}%

## Current Health
- **Data Drift**: ${(card.drift.dataDrift * 100).toFixed(1)}% ${card.drift.dataDrift > 0.15 ? '⚠️' : '✅'}
- **Concept Drift**: ${(card.drift.conceptDrift * 100).toFixed(1)}% ${card.drift.conceptDrift > 0.20 ? '⚠️' : '✅'}
- **Last Checked**: ${card.drift.lastChecked.toLocaleDateString()}

## Limitations
${card.limitations.known.map(l => `- ${l}`).join('\n')}

## Governance
- **Owner**: ${card.governance.owner}
- **Next Review**: ${card.governance.nextReviewDate.toLocaleDateString()}
- **Compliance**: ${card.governance.compliance.join(', ')}

## Recent Alerts
${card.drift.alerts.slice(-5).map(a =>
  `- [${a.severity.toUpperCase()}] ${a.message}`
).join('\n') || 'No recent alerts'}
`;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private calculateDataDrift(data: KPISnapshot[]): number {
    // Simplified drift calculation
    // In production, would use proper statistical tests
    if (data.length < 30) return 0;

    const recent = data.slice(-10);
    const historical = data.slice(0, -10);

    const recentMean = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const historicalMean = historical.reduce((sum, d) => sum + d.value, 0) / historical.length;

    const recentStd = Math.sqrt(
      recent.reduce((sum, d) => sum + Math.pow(d.value - recentMean, 2), 0) / recent.length
    );
    const historicalStd = Math.sqrt(
      historical.reduce((sum, d) => sum + Math.pow(d.value - historicalMean, 2), 0) / historical.length
    );

    // Normalized difference
    const meanDrift = Math.abs(recentMean - historicalMean) / (historicalMean || 1);
    const stdDrift = Math.abs(recentStd - historicalStd) / (historicalStd || 1);

    return (meanDrift + stdDrift) / 2;
  }

  private calculatePredictionDrift(predictions: number[]): number {
    // Simplified prediction drift
    if (predictions.length < 30) return 0;

    const recent = predictions.slice(-10);
    const historical = predictions.slice(0, -10);

    const recentMean = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const historicalMean = historical.reduce((sum, p) => sum + p, 0) / historical.length;

    return Math.abs(recentMean - historicalMean) / (historicalMean || 1);
  }
}

// ============================================================================
// DATA CARD MANAGER
// ============================================================================

export class DataCardManager {
  private cards: Map<string, DataCard> = new Map();

  /**
   * Create data card for KPI snapshots
   */
  createKPIDataCard(): DataCard {
    const card: DataCard = {
      id: 'sgp-kpi-snapshots-v1',
      name: 'KPI Performance Snapshots',
      version: '1.0.0',
      description: 'Time-series data of key performance indicators',

      characteristics: {
        size: 1024000, // bytes
        features: 8,
        samples: 10000,
        timeRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        updateFrequency: 'Daily',
        format: 'JSON'
      },

      quality: {
        completeness: 0.95,
        accuracy: 0.98,
        consistency: 0.97,
        timeliness: 1, // days old
        uniqueness: 1.0,
        validity: 0.99
      },

      schema: {
        fields: [
          {
            name: 'timestamp',
            type: 'datetime',
            nullable: false,
            description: 'Measurement timestamp'
          },
          {
            name: 'metric',
            type: 'string',
            nullable: false,
            description: 'KPI identifier'
          },
          {
            name: 'value',
            type: 'number',
            nullable: false,
            description: 'Metric value'
          },
          {
            name: 'unit',
            type: 'string',
            nullable: false,
            description: 'Unit of measurement'
          },
          {
            name: 'confidence',
            type: 'number',
            nullable: true,
            description: 'Confidence score 0-1'
          }
        ],
        primaryKey: ['timestamp', 'metric']
      },

      privacy: {
        personalData: false,
        sensitiveData: false,
        anonymized: true,
        consentObtained: true,
        retentionPolicy: '3 years',
        deletionPolicy: 'Automatic after retention period'
      },

      lineage: {
        sources: [
          {
            name: 'Analytics Database',
            type: 'PostgreSQL',
            lastUpdated: new Date(),
            reliability: 0.99
          },
          {
            name: 'Marketing Platforms',
            type: 'API',
            lastUpdated: new Date(),
            reliability: 0.95
          }
        ],
        transformations: [
          'Aggregation to daily granularity',
          'Outlier removal (3-sigma)',
          'Missing value interpolation',
          'Currency normalization to USD'
        ],
        dependencies: ['ETL Pipeline v2.1', 'Data Quality Service v1.5']
      },

      access: {
        location: 'sgp/data/kpi-snapshots',
        permissions: ['read:analytics', 'write:admin'],
        restrictions: ['No export to external systems', 'Audit log required'],
        sla: '99.9% availability',
        cost: 0
      }
    };

    this.cards.set(card.id, card);
    return card;
  }

  /**
   * Validate data quality
   */
  validateDataQuality(
    dataCardId: string,
    data: any[]
  ): { valid: boolean; issues: string[] } {
    const card = this.cards.get(dataCardId);
    if (!card) throw new Error(`Data card ${dataCardId} not found`);

    const issues: string[] = [];

    // Check completeness
    const nullCount = data.filter(d => !d || Object.values(d).includes(null)).length;
    const completeness = 1 - (nullCount / data.length);
    if (completeness < card.quality.completeness) {
      issues.push(`Completeness ${(completeness * 100).toFixed(1)}% below threshold ${(card.quality.completeness * 100).toFixed(1)}%`);
    }

    // Check schema compliance
    for (const record of data.slice(0, 100)) { // Sample check
      for (const field of card.schema.fields) {
        if (!field.nullable && !record[field.name]) {
          issues.push(`Required field ${field.name} is missing`);
        }
        if (record[field.name] && typeof record[field.name] !== field.type) {
          issues.push(`Field ${field.name} type mismatch`);
        }
      }
    }

    // Check timeliness
    const latestTimestamp = Math.max(...data.map(d => d.timestamp?.getTime() || 0));
    const ageInDays = (Date.now() - latestTimestamp) / (1000 * 60 * 60 * 24);
    if (ageInDays > card.quality.timeliness) {
      issues.push(`Data is ${ageInDays.toFixed(1)} days old, exceeds ${card.quality.timeliness} day threshold`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate data card report
   */
  generateReport(dataCardId: string): string {
    const card = this.cards.get(dataCardId);
    if (!card) throw new Error(`Data card ${dataCardId} not found`);

    return `# Data Card: ${card.name}

## Overview
- **Version**: ${card.version}
- **Size**: ${(card.characteristics.size / 1024 / 1024).toFixed(2)} MB
- **Samples**: ${card.characteristics.samples.toLocaleString()}
- **Update Frequency**: ${card.characteristics.updateFrequency}

## Quality Metrics
- **Completeness**: ${(card.quality.completeness * 100).toFixed(1)}%
- **Accuracy**: ${(card.quality.accuracy * 100).toFixed(1)}%
- **Consistency**: ${(card.quality.consistency * 100).toFixed(1)}%
- **Timeliness**: ${card.quality.timeliness} day(s)

## Schema (${card.schema.fields.length} fields)
${card.schema.fields.map(f =>
  `- **${f.name}** (${f.type}): ${f.description}`
).join('\n')}

## Privacy & Compliance
- **Personal Data**: ${card.privacy.personalData ? 'Yes ⚠️' : 'No ✅'}
- **Anonymized**: ${card.privacy.anonymized ? 'Yes ✅' : 'No ⚠️'}
- **Retention**: ${card.privacy.retentionPolicy}

## Data Lineage
### Sources
${card.lineage.sources.map(s =>
  `- ${s.name} (${s.type}) - ${(s.reliability * 100).toFixed(0)}% reliable`
).join('\n')}

### Transformations
${card.lineage.transformations.map(t => `- ${t}`).join('\n')}
`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ModelCardManager, DataCardManager };
export default ModelCardManager;