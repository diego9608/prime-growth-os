// KPI Types
export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'green' | 'yellow' | 'red';
  trend: 'up' | 'down' | 'stable';
  description: string;
  tooltip?: string;
}

// Lead Management Types
export interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  projectType: 'residencial' | 'comercial' | 'institucional';
  budget: number;
  timeline: string;
  source: string;
  status: 'nuevo' | 'contactado' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido';
  createdAt: string;
  lastContact: string;
  slaHours: number;
  priority: 'alta' | 'media' | 'baja';
  notes: string;
}

// CPQ Types
export interface CPQTier {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
  deliveryTime: number;
  revisions: number;
  teamSize: number;
}

export interface CPQQuote {
  id: string;
  leadId: string;
  tier: string;
  customizations: string[];
  totalPrice: number;
  createdAt: string;
  status: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  validUntil: string;
}

// Stage Gate Types
export interface StageGatePhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  deliverables: string[];
  approvalRequired: boolean;
  status: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: 'residencial' | 'comercial' | 'institucional';
  budget: number;
  startDate: string;
  endDate: string;
  status: 'planificacion' | 'diseno' | 'construccion' | 'entrega' | 'completado';
  phases: StageGatePhase[];
  manager: string;
  team: string[];
  progress: number;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  otifScore: number; // On Time In Full score
  qualityRating: number;
  costRating: number;
  responseTime: number;
  certifications: string[];
  status: 'activo' | 'inactivo' | 'en_evaluacion';
  lastDelivery: string;
  totalOrders: number;
  averageOrderValue: number;
}

// Finance Types
export interface FinanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
  category: 'revenue' | 'margin' | 'cash_flow' | 'efficiency';
}

export interface CashFlowItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  projectId?: string;
}

// Case Study Types
export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  projectType: 'residencial' | 'comercial' | 'institucional';
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  images: string[];
  duration: number;
  budget: number;
  teamSize: number;
  technologies: string[];
  awards: string[];
  publishedAt: string;
  featured: boolean;
}

// Optimization Types
export interface OptimizationInput {
  channels: string[];
  budgets: number[];
  targets: {
    leads: number;
    conversion: number;
    cost_per_lead: number;
  };
  constraints: {
    min_budget_per_channel: number;
    max_budget_per_channel: number;
  };
}

export interface OptimizationResult {
  channel: string;
  recommended_budget: number;
  expected_leads: number;
  expected_cost_per_lead: number;
  efficiency_score: number;
  confidence: number;
}

// Dashboard Types
export interface DashboardData {
  kpis: KPI[];
  leads: Lead[];
  projects: Project[];
  vendors: Vendor[];
  finance: FinanceMetric[];
  cases: CaseStudy[];
}