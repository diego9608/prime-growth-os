import { OptimizationInput, OptimizationResult } from '@prime-growth-os/types';

/**
 * Algoritmo de optimización de gasto en canales de marketing
 * Utiliza un enfoque basado en eficiencia histórica y restricciones presupuestarias
 */
export function optimizeSpend(input: OptimizationInput): OptimizationResult[] {
  const { channels, budgets, targets, constraints } = input;

  // Datos históricos de eficiencia por canal (simulados)
  const channelEfficiency: Record<string, { cpl: number; conversion: number; quality: number }> = {
    'Google Ads': { cpl: 45, conversion: 0.12, quality: 0.85 },
    'Facebook Ads': { cpl: 35, conversion: 0.08, quality: 0.75 },
    'LinkedIn Ads': { cpl: 85, conversion: 0.18, quality: 0.95 },
    'Instagram Ads': { cpl: 40, conversion: 0.06, quality: 0.70 },
    'SEO Orgánico': { cpl: 25, conversion: 0.15, quality: 0.90 },
    'Email Marketing': { cpl: 15, conversion: 0.20, quality: 0.88 },
    'Referidos': { cpl: 20, conversion: 0.25, quality: 0.95 },
    'Eventos': { cpl: 120, conversion: 0.30, quality: 0.98 }
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget, 0);
  const results: OptimizationResult[] = [];

  // Calcular score de eficiencia para cada canal
  const channelScores = channels.map(channel => {
    const efficiency = channelEfficiency[channel] || { cpl: 100, conversion: 0.05, quality: 0.5 };
    const costEfficiency = 1 / efficiency.cpl; // Menor costo = mayor eficiencia
    const conversionScore = efficiency.conversion;
    const qualityScore = efficiency.quality;

    // Score combinado con pesos: 40% costo, 35% conversión, 25% calidad
    const totalScore = (costEfficiency * 0.4) + (conversionScore * 0.35) + (qualityScore * 0.25);

    return { channel, score: totalScore, ...efficiency };
  });

  // Ordenar por score de eficiencia
  channelScores.sort((a, b) => b.score - a.score);

  // Asignar presupuesto basado en eficiencia y restricciones
  let remainingBudget = totalBudget;
  const minBudgetPerChannel = constraints.min_budget_per_channel;
  const maxBudgetPerChannel = constraints.max_budget_per_channel;

  for (const channelData of channelScores) {
    const { channel, score, cpl, conversion, quality } = channelData;

    // Calcular presupuesto recomendado basado en score relativo
    const totalScore = channelScores.reduce((sum, c) => sum + c.score, 0);
    const proportionalBudget = (score / totalScore) * totalBudget;

    // Aplicar restricciones
    let recommendedBudget = Math.max(minBudgetPerChannel, Math.min(maxBudgetPerChannel, proportionalBudget));
    recommendedBudget = Math.min(recommendedBudget, remainingBudget);

    const expectedLeads = Math.round(recommendedBudget / cpl);
    const confidence = Math.min(0.95, 0.6 + (quality * 0.35)); // Confianza basada en calidad histórica

    results.push({
      channel,
      recommended_budget: Math.round(recommendedBudget),
      expected_leads: expectedLeads,
      expected_cost_per_lead: cpl,
      efficiency_score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100
    });

    remainingBudget -= recommendedBudget;

    if (remainingBudget <= 0) break;
  }

  return results;
}

/**
 * Calcula métricas de rendimiento para un canal específico
 */
export function calculateChannelROI(
  investment: number,
  leads: number,
  conversions: number,
  avgProjectValue: number
): {
  roi: number;
  costPerLead: number;
  costPerAcquisition: number;
  conversionRate: number;
} {
  const revenue = conversions * avgProjectValue;
  const roi = ((revenue - investment) / investment) * 100;
  const costPerLead = leads > 0 ? investment / leads : 0;
  const costPerAcquisition = conversions > 0 ? investment / conversions : 0;
  const conversionRate = leads > 0 ? (conversions / leads) * 100 : 0;

  return {
    roi: Math.round(roi * 100) / 100,
    costPerLead: Math.round(costPerLead * 100) / 100,
    costPerAcquisition: Math.round(costPerAcquisition * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100
  };
}

/**
 * Genera recomendaciones de optimización basadas en performance actual
 */
export function generateOptimizationRecommendations(
  currentPerformance: Record<string, any>
): string[] {
  const recommendations: string[] = [];

  // Analizar CPL (Cost Per Lead)
  if (currentPerformance.costPerLead > 60) {
    recommendations.push('Considerar optimizar targeting para reducir costo por lead');
    recommendations.push('Revisar copy y creativos para mejorar CTR');
  }

  // Analizar tasa de conversión
  if (currentPerformance.conversionRate < 10) {
    recommendations.push('Mejorar proceso de calificación de leads');
    recommendations.push('Optimizar landing pages para mayor conversión');
  }

  // Analizar ROI
  if (currentPerformance.roi < 200) {
    recommendations.push('Reevaluar canales de menor rendimiento');
    recommendations.push('Incrementar presupuesto en canales de alto ROI');
  }

  // Recomendaciones generales
  recommendations.push('Implementar tracking avanzado para mejor atribución');
  recommendations.push('Realizar pruebas A/B en creativos y mensajes');

  return recommendations;
}