import { CPQTier } from '@prime-growth-os/types';

/**
 * Configuración de planes de pricing para arquitectura
 */
export const pricingTiers: CPQTier[] = [
  {
    id: 'core',
    name: 'Core',
    description: 'Diseño arquitectónico fundamental para proyectos residenciales básicos',
    basePrice: 85000,
    features: [
      'Planos arquitectónicos básicos',
      'Renders exteriores (2)',
      'Planos estructurales',
      'Especificaciones técnicas básicas',
      'Documentación para permisos',
      'Acompañamiento inicial'
    ],
    deliveryTime: 45, // días
    revisions: 2,
    teamSize: 2
  },
  {
    id: 'signature',
    name: 'Signature',
    description: 'Solución integral para proyectos comerciales y residenciales premium',
    basePrice: 185000,
    features: [
      'Planos arquitectónicos completos',
      'Renders exteriores e interiores (5)',
      'Planos estructurales y MEP',
      'Especificaciones técnicas detalladas',
      'Documentación completa para permisos',
      'Diseño de interiores básico',
      'Acompañamiento en construcción',
      'Modelado 3D/BIM',
      'Análisis de sostenibilidad'
    ],
    deliveryTime: 75, // días
    revisions: 4,
    teamSize: 4
  },
  {
    id: 'masterpiece',
    name: 'Masterpiece',
    description: 'Experiencia arquitectónica excepcional para proyectos únicos e institucionales',
    basePrice: 350000,
    features: [
      'Diseño arquitectónico completamente personalizado',
      'Renders fotorrealistas ilimitados',
      'Planos ejecutivos completos (ARQ, EST, MEP)',
      'Especificaciones técnicas premium',
      'Documentación completa y gestión de permisos',
      'Diseño de interiores completo',
      'Supervisión de obra dedicada',
      'Modelado BIM avanzado',
      'Certificaciones de sostenibilidad',
      'Consultoría en innovación',
      'Recorridos virtuales VR/AR',
      'Mobiliario y paisajismo personalizado'
    ],
    deliveryTime: 120, // días
    revisions: 8,
    teamSize: 8
  }
];

/**
 * Calcula el precio de una cotización basado en el tier y customizaciones
 */
export function calculateQuotePrice(
  tierId: string,
  customizations: string[] = [],
  projectSize: number = 1, // multiplicador por tamaño de proyecto
  urgency: 'normal' | 'expedito' | 'urgente' = 'normal'
): {
  basePrice: number;
  customizationCost: number;
  sizePremium: number;
  urgencyPremium: number;
  totalPrice: number;
  tier: CPQTier | null;
} {
  const tier = pricingTiers.find(t => t.id === tierId) || null;

  if (!tier) {
    return {
      basePrice: 0,
      customizationCost: 0,
      sizePremium: 0,
      urgencyPremium: 0,
      totalPrice: 0,
      tier: null
    };
  }

  const basePrice = tier.basePrice;

  // Costos de customizaciones
  const customizationPricing: Record<string, number> = {
    'renders_adicionales': 8500,
    'recorrido_virtual': 25000,
    'modelado_avanzado': 35000,
    'certificacion_leed': 45000,
    'diseño_paisajismo': 28000,
    'mobiliario_personalizado': 40000,
    'consultoria_feng_shui': 15000,
    'automatizacion_hogar': 55000,
    'sistema_seguridad': 32000,
    'paneles_solares': 18000
  };

  const customizationCost = customizations.reduce((total, custom) => {
    return total + (customizationPricing[custom] || 0);
  }, 0);

  // Premium por tamaño (para proyectos grandes)
  const sizePremium = projectSize > 1 ? basePrice * (projectSize - 1) * 0.7 : 0;

  // Premium por urgencia
  const urgencyMultipliers = {
    'normal': 0,
    'expedito': 0.25, // +25%
    'urgente': 0.5    // +50%
  };
  const urgencyPremium = basePrice * urgencyMultipliers[urgency];

  const totalPrice = basePrice + customizationCost + sizePremium + urgencyPremium;

  return {
    basePrice,
    customizationCost,
    sizePremium,
    urgencyPremium,
    totalPrice: Math.round(totalPrice),
    tier
  };
}

/**
 * Genera recomendaciones de tier basadas en el tipo de proyecto y presupuesto
 */
export function recommendTier(
  projectType: 'residencial' | 'comercial' | 'institucional',
  budget: number,
  timeline: number, // días disponibles
  requirements: string[] = []
): {
  recommendedTier: string;
  alternatives: string[];
  reasoning: string[];
} {
  const reasoning: string[] = [];
  let recommendedTier = 'core';
  const alternatives: string[] = [];

  // Análisis por tipo de proyecto
  if (projectType === 'institucional') {
    recommendedTier = 'masterpiece';
    reasoning.push('Proyectos institucionales requieren máxima calidad y personalización');
  } else if (projectType === 'comercial') {
    recommendedTier = budget > 200000 ? 'masterpiece' : 'signature';
    reasoning.push('Proyectos comerciales se benefician de diseño diferenciado');
  } else {
    // residencial
    if (budget > 300000) {
      recommendedTier = 'masterpiece';
      reasoning.push('Presupuesto permite experiencia premium completa');
    } else if (budget > 150000) {
      recommendedTier = 'signature';
      reasoning.push('Presupuesto adecuado para solución integral');
    } else {
      recommendedTier = 'core';
      reasoning.push('Solución optimizada para presupuesto disponible');
    }
  }

  // Análisis por timeline
  const selectedTier = pricingTiers.find(t => t.id === recommendedTier);
  if (selectedTier && timeline < selectedTier.deliveryTime) {
    reasoning.push(`Timeline requiere optimización: ${timeline} días vs ${selectedTier.deliveryTime} días estándar`);

    // Buscar tier más rápido
    const fasterTiers = pricingTiers.filter(t => t.deliveryTime <= timeline);
    if (fasterTiers.length > 0) {
      recommendedTier = fasterTiers[fasterTiers.length - 1].id; // El más completo que cumpla timeline
      reasoning.push(`Ajustado a tier ${recommendedTier} para cumplir timeline`);
    }
  }

  // Generar alternativas
  pricingTiers.forEach(tier => {
    if (tier.id !== recommendedTier) {
      if (tier.basePrice <= budget * 1.2) { // Dentro del 20% del presupuesto
        alternatives.push(tier.id);
      }
    }
  });

  return {
    recommendedTier,
    alternatives,
    reasoning
  };
}

/**
 * Calcula descuentos basados en volumen o condiciones especiales
 */
export function calculateDiscount(
  basePrice: number,
  conditions: {
    isReturnClient?: boolean;
    projectCount?: number;
    paymentTerms?: 'contado' | '30_dias' | '60_dias';
    seasonality?: 'alta' | 'media' | 'baja';
  }
): {
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  appliedDiscounts: string[];
} {
  let totalDiscount = 0;
  const appliedDiscounts: string[] = [];

  // Descuento por cliente recurrente
  if (conditions.isReturnClient) {
    totalDiscount += 0.05; // 5%
    appliedDiscounts.push('Cliente recurrente: 5%');
  }

  // Descuento por volumen
  if (conditions.projectCount && conditions.projectCount > 1) {
    const volumeDiscount = Math.min(0.15, conditions.projectCount * 0.03); // Máximo 15%
    totalDiscount += volumeDiscount;
    appliedDiscounts.push(`Volumen (${conditions.projectCount} proyectos): ${Math.round(volumeDiscount * 100)}%`);
  }

  // Descuento por pronto pago
  if (conditions.paymentTerms === 'contado') {
    totalDiscount += 0.08; // 8%
    appliedDiscounts.push('Pago de contado: 8%');
  }

  // Ajuste por temporada
  if (conditions.seasonality === 'baja') {
    totalDiscount += 0.10; // 10% en temporada baja
    appliedDiscounts.push('Temporada baja: 10%');
  } else if (conditions.seasonality === 'alta') {
    totalDiscount -= 0.05; // -5% en temporada alta (incremento)
    appliedDiscounts.push('Temporada alta: -5%');
  }

  // Limitar descuento máximo
  totalDiscount = Math.max(0, Math.min(0.25, totalDiscount)); // Entre 0% y 25%

  const discountAmount = basePrice * totalDiscount;
  const finalPrice = basePrice - discountAmount;

  return {
    discountPercentage: Math.round(totalDiscount * 100 * 100) / 100,
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice),
    appliedDiscounts
  };
}