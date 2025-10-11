/**
 * Strategic Growth Predictor - Type Definitions
 * Core data contracts for intelligent business recommendations
 */

// ============================================================================
// FOUNDATION TYPES
// ============================================================================

export type TimeWindow = '24h' | '7d' | '30d' | '90d' | '365d';
export type Confidence = 'high' | 'medium' | 'low';
export type Impact = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'proposed' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'measured';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MetricDelta {
  baseline: number;
  target: number;
  delta: number;
  deltaPercent: number;
  unit: string;
}

// ============================================================================
// KPI SYSTEM
// ============================================================================

export type KPICategory =
  | 'acquisition'    // Lead generation, marketing
  | 'conversion'     // Sales process, win rates
  | 'delivery'       // Project execution, quality
  | 'financial'      // Revenue, margins, cash flow
  | 'operational';   // Efficiency, productivity

export interface KPIDefinition {
  key: string;
  name: string;
  category: KPICategory;
  unit: string;
  format: 'number' | 'percent' | 'currency' | 'days';
  direction: 'up' | 'down';  // up = higher is better
  criticalThreshold?: number;
  targetValue?: number;
  dataSource: string[];
}

export interface KPISnapshot {
  kpi: KPIDefinition;
  value: number;
  timestamp: Date;
  window: TimeWindow;
  trend: 'improving' | 'stable' | 'declining';
  trendMagnitude: number;  // % change vs previous period
  percentileRank?: number;  // 0-100, position vs historical
  sampleSize: number;
}

// ============================================================================
// EVIDENCE & INSIGHTS
// ============================================================================

export interface Evidence {
  id: string;
  type: 'metric' | 'pattern' | 'anomaly' | 'correlation' | 'benchmark';
  title: string;
  description: string;
  kpiSnapshots: KPISnapshot[];
  confidence: number;  // 0-1
  sources: DataSource[];
  detectedAt: Date;
  tags: string[];
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  category: 'opportunity' | 'risk' | 'bottleneck' | 'trend';
  evidence: Evidence[];
  impactEstimate: ImpactEstimate;
  confidence: Confidence;
  expiresAt?: Date;  // When this insight becomes stale
  relatedInsights?: string[];  // IDs of related insights
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export interface ImpactEstimate {
  revenue?: MetricDelta;
  margin?: MetricDelta;
  velocity?: MetricDelta;
  risk?: MetricDelta;
  customMetrics?: Record<string, MetricDelta>;
  timeToImpact: number;  // days
  sustainabilityMonths: number;  // How long impact lasts
}

export interface Action {
  id: string;
  label: string;
  description: string;
  type: 'immediate' | 'planned' | 'experimental';
  owner?: string;
  deadline?: Date;
  dependencies?: string[];  // Other action IDs
  automatable: boolean;
  estimatedEffort?: number;  // hours
  href?: string;  // Link to execute action
}

export interface RiskFactor {
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: Impact;
  mitigation?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  executiveSummary: string;  // 2-3 sentences
  rationale: string;  // Detailed explanation
  insight: Insight;

  // Impact & Confidence
  expectedImpact: ImpactEstimate;
  confidence: number;  // 0-1
  confidenceFactors: string[];  // What drives confidence up/down

  // Actions & Implementation
  actions: Action[];
  implementationPlan?: string;  // Markdown formatted plan
  successCriteria: string[];

  // Risk & Mitigation
  risks: RiskFactor[];
  assumptions: string[];

  // Tracking
  status: Status;
  priority: 1 | 2 | 3 | 4 | 5;  // 1 = highest
  createdAt: Date;
  updatedAt: Date;
  decidedAt?: Date;
  decidedBy?: string;
  completedAt?: Date;

  // Validation
  testable: boolean;
  testDesign?: ExperimentDesign;
  actualImpact?: ImpactEstimate;  // Measured after implementation
  learnings?: string;
}

// ============================================================================
// BOTTLENECK DETECTION
// ============================================================================

export interface ProcessFlow {
  id: string;
  name: string;
  stages: ProcessStage[];
  avgCycleTime: number;  // Total time in days
  volumePerMonth: number;
}

export interface ProcessStage {
  id: string;
  name: string;
  avgDuration: number;  // days
  maxDuration: number;
  minDuration: number;
  bottleneckScore: number;  // 0-100
  waitTime: number;  // Time waiting for next stage
  reworkRate: number;  // % that need rework
  dropOffRate: number;  // % that exit process here
}

export interface Bottleneck {
  id: string;
  process: ProcessFlow;
  stage: ProcessStage;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impactedVolume: number;  // # of items affected per month
  costOfDelay: number;  // $ per day
  rootCauses: string[];
  recommendedFixes: Recommendation[];
}

// ============================================================================
// SPEND OPTIMIZATION (MMM)
// ============================================================================

export interface MarketingChannel {
  id: string;
  name: string;
  type: 'paid' | 'owned' | 'earned';
  currentSpend: number;
  currentROI: number;
  saturationPoint: number;  // Spend level where ROI drops
  minEffectiveSpend: number;
  maxRecommendedSpend: number;
  incrementalCAC: number;  // Cost to acquire next customer
  attributionModel: 'last_touch' | 'first_touch' | 'linear' | 'decay' | 'data_driven';
}

export interface SpendAllocation {
  channel: MarketingChannel;
  currentPercent: number;
  recommendedPercent: number;
  recommendedAmount: number;
  expectedLeads: number;
  expectedConversions: number;
  expectedROI: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface SpendPlan {
  id: string;
  name: string;
  totalBudget: number;
  period: DateRange;
  allocations: SpendAllocation[];
  expectedOutcome: {
    leads: number;
    conversions: number;
    revenue: number;
    roi: number;
  };
  constraints: string[];  // Business rules applied
  assumptions: string[];
  simulationRuns?: number;  // If Monte Carlo was used
}

// ============================================================================
// PRICING OPTIMIZATION
// ============================================================================

export interface PricingSegment {
  id: string;
  name: string;
  characteristics: Record<string, any>;
  size: number;  // # of customers
  avgDealSize: number;
  priceElasticity: number;  // % demand change per % price change
  willingnessToPay: {
    p10: number;  // 10th percentile
    p50: number;  // Median
    p90: number;  // 90th percentile
  };
}

export interface PricingStrategy {
  id: string;
  segment: PricingSegment;
  basePrice: number;
  recommendedPrice: number;
  pricingModel: 'fixed' | 'value_based' | 'cost_plus' | 'competitive' | 'dynamic';
  bundleComponents?: string[];
  discountStructure?: {
    volume: Record<number, number>;  // units -> discount %
    commitment: Record<number, number>;  // months -> discount %
  };
  expectedImpact: {
    volumeChange: number;  // %
    revenueChange: number;  // %
    marginChange: number;  // percentage points
  };
}

// ============================================================================
// CONTRACT RISK
// ============================================================================

export interface ContractRisk {
  id: string;
  clause: string;
  riskType: 'financial' | 'operational' | 'legal' | 'reputational';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  potentialImpact: number;  // $ at risk
  probability: number;  // 0-1
  mitigation: string;
  requiresLegalReview: boolean;
  precedentCases?: string[];  // Similar cases for reference
}

export interface ContractAnalysis {
  id: string;
  contractId: string;
  contractValue: number;
  analyzedAt: Date;
  risks: ContractRisk[];
  aggregateRiskScore: number;  // 0-100
  recommendation: 'accept' | 'negotiate' | 'reject';
  negotiationPoints?: string[];
  alternativeClauses?: Record<string, string>;  // Original -> Suggested
}

// ============================================================================
// EXPERIMENTATION
// ============================================================================

export interface ExperimentDesign {
  hypothesis: string;
  metric: KPIDefinition;
  targetDelta: number;
  sampleSize: number;
  duration: number;  // days
  controlGroup: string;
  treatmentGroup: string;
  successThreshold: number;
  statisticalPower: number;
  confidenceLevel: number;
}

export interface ExperimentResult {
  design: ExperimentDesign;
  startDate: Date;
  endDate: Date;
  controlMetric: number;
  treatmentMetric: number;
  lift: number;  // %
  pValue: number;
  significant: boolean;
  decision: 'roll_out' | 'iterate' | 'abandon';
  learnings: string[];
}

// ============================================================================
// EXECUTIVE REPORTING
// ============================================================================

export interface ExecutiveNarrative {
  id: string;
  period: DateRange;
  generatedAt: Date;

  // Structured sections
  situation: string;  // What's happening (3 lines)
  complication: string;  // Risk or opportunity (2 lines)
  question: string;  // Key decision (1 line)
  answer: string;  // Recommendation with trade-offs (3 lines)

  // Supporting data
  keyMetrics: KPISnapshot[];
  topInsights: Insight[];
  prioritizedActions: Action[];

  // Next steps
  immediateActions: string[];  // This week
  plannedActions: string[];  // This month
  strategicConsiderations: string[];  // This quarter

  // Meta
  confidence: Confidence;
  reviewedBy?: string;
  approvedBy?: string;
}

// ============================================================================
// DATA SOURCES
// ============================================================================

export interface DataSource {
  id: string;
  name: string;
  type: 'crm' | 'erp' | 'marketing' | 'finance' | 'custom';
  connectionStatus: 'connected' | 'error' | 'disconnected';
  lastSync: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  dataQualityScore: number;  // 0-100
  coverage: string[];  // Which KPIs this source provides
}

// ============================================================================
// BUSINESS CONSTRAINTS & GUARDRAILS
// ============================================================================

export interface BusinessConstraints {
  // Capacity constraints
  maxDailyCapacity: {
    cpqProposals: number;  // Max proposals per day
    meetings: number;      // Max meetings per day
    implementations: number;  // Max concurrent projects
  };

  // Channel change constraints
  maxChannelChangeRate: number;  // Max % change per day (e.g., 0.3 = 30%)
  minChannelStability: number;   // Days before allowing major changes

  // Pacing constraints
  monthlyPacing: 'linear' | 'front_loaded' | 'back_loaded';
  weeklySpendTargets?: number[];  // Optional weekly targets

  // Platform constraints
  platformMinimums: Map<string, number>;  // Min spend per platform
  platformMaximums?: Map<string, number>; // Max spend per platform

  // Diversification constraints
  maxChannelConcentration: number;  // Max % in single channel (e.g., 0.5 = 50%)
  minActiveChannels: number;        // Minimum number of active channels
  diversityRatio: number;           // Min ratio per active channel
}

export interface GuardrailViolation {
  type: 'capacity' | 'ramp_rate' | 'pacing' | 'platform' | 'diversity';
  constraint: string;
  current: number;
  limit: number;
  severity: 'warning' | 'error';
  suggestion: string;
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export interface SGPConfig {
  // Thresholds
  minConfidenceToRecommend: number;
  minImpactToAlert: number;
  maxRecommendationsPerWeek: number;

  // Behavioral
  autoImplementThreshold: number;  // Confidence level for auto-execution
  requireApprovalAbove: number;  // $ value requiring human approval

  // Model settings
  defaultTimeWindow: TimeWindow;
  seasonalityAdjustment: boolean;
  outlierRemoval: boolean;

  // Business constraints
  businessConstraints?: BusinessConstraints;

  // Notification preferences
  alertChannels: ('email' | 'slack' | 'dashboard')[];
  executiveBriefingSchedule: 'daily' | 'weekly' | 'monthly';

  // A/B Testing defaults
  defaultTestDuration: number;  // days
  defaultConfidenceLevel: number;  // 0.95 = 95%
  minSampleSize: number;
}

// ============================================================================
// MAIN INTERFACE
// ============================================================================

export interface StrategicGrowthPredictor {
  // Configuration
  config: SGPConfig;

  // Data layer
  dataSources: DataSource[];
  kpis: KPIDefinition[];

  // Intelligence layer
  insights: Insight[];
  recommendations: Recommendation[];
  bottlenecks: Bottleneck[];

  // Planning layer
  spendPlans: SpendPlan[];
  pricingStrategies: PricingStrategy[];
  contractAnalyses: ContractAnalysis[];

  // Execution layer
  experiments: ExperimentDesign[];
  results: ExperimentResult[];

  // Reporting layer
  narratives: ExecutiveNarrative[];

  // Metadata
  lastUpdated: Date;
  version: string;
  healthScore: number;  // 0-100, system health
}