/**
 * Mexican Contract Risk Rules
 * Domain-specific risk assessment for Mexican business contracts
 */

import type { Recommendation, RiskFactor } from './types';

// ============================================================================
// CONTRACT TYPES
// ============================================================================

export interface ContractRisk {
  category: 'legal' | 'fiscal' | 'labor' | 'commercial' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  probability: number;  // 0-1
  impact: number;       // Financial impact estimate
  timeline: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  references?: string[]; // Legal references (NOM, LFT, etc.)
}

export interface ContractAnalysis {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  risks: ContractRisk[];
  recommendations: string[];
  requiredClauses: string[];
  redFlags: string[];
  compliance: {
    sat: boolean;      // Servicio de Administración Tributaria
    imss: boolean;     // Instituto Mexicano del Seguro Social
    nom: boolean;      // Normas Oficiales Mexicanas
    profeco: boolean;  // Procuraduría Federal del Consumidor
  };
}

// ============================================================================
// MEXICAN CONTRACT VALIDATOR
// ============================================================================

export class MexicanContractValidator {
  // Key Mexican regulations and requirements
  private readonly FISCAL_REQUIREMENTS = {
    cfdi: true,                    // Comprobante Fiscal Digital por Internet
    rfc_validation: true,           // Registro Federal de Contribuyentes
    tax_residence: true,
    withholding_rates: {
      iva: 0.16,                   // Impuesto al Valor Agregado
      isr_services: 0.10,          // Impuesto Sobre la Renta for services
      isr_professional: 0.10,      // Professional services
      isr_rental: 0.10             // Rental income
    }
  };

  private readonly LABOR_THRESHOLDS = {
    outsourcing_banned: true,      // Reformed in 2021
    ptu_mandatory: true,            // Participación de los Trabajadores en las Utilidades
    aguinaldo_days: 15,             // Minimum Christmas bonus days
    vacation_days_year1: 12,        // Increased in 2023
    prima_vacacional: 0.25,         // Vacation premium
    max_trial_period_days: 30,      // For most positions
    max_trial_period_management: 180 // For management positions
  };

  private readonly COMMERCIAL_RULES = {
    payment_terms_max_days: 30,     // PROFECO recommendation
    late_payment_interest: 0.09,    // Annual rate (9%)
    warranty_minimum_days: 60,      // For products
    service_warranty_days: 30,      // For services
    cancellation_notice_days: 30,   // Standard notice period
    force_majeure_includes_government: true
  };

  /**
   * Analyze contract for Mexican regulatory risks
   */
  analyzeContract(contractData: {
    type: 'service' | 'supply' | 'employment' | 'rental' | 'partnership';
    value: number;  // In MXN
    duration: number;  // In months
    parties: {
      provider: { rfc: string; type: 'individual' | 'company' };
      client: { rfc: string; type: 'individual' | 'company' };
    };
    terms: {
      payment_days?: number;
      penalties?: boolean;
      confidentiality?: boolean;
      ip_ownership?: string;
      jurisdiction?: string;
      arbitration?: boolean;
    };
    hasEmployees?: boolean;
    crossBorder?: boolean;
  }): ContractAnalysis {
    const risks: ContractRisk[] = [];

    // Check fiscal risks
    risks.push(...this.checkFiscalRisks(contractData));

    // Check labor risks (if applicable)
    if (contractData.hasEmployees || contractData.type === 'employment') {
      risks.push(...this.checkLaborRisks(contractData));
    }

    // Check commercial risks
    risks.push(...this.checkCommercialRisks(contractData));

    // Check regulatory compliance
    risks.push(...this.checkRegulatoryRisks(contractData));

    // Check cross-border specific risks
    if (contractData.crossBorder) {
      risks.push(...this.checkCrossBorderRisks(contractData));
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(risks, contractData);

    // Identify required clauses
    const requiredClauses = this.getRequiredClauses(contractData);

    // Identify red flags
    const redFlags = this.identifyRedFlags(contractData, risks);

    // Check compliance
    const compliance = this.checkCompliance(contractData);

    // Calculate overall risk
    const overallRisk = this.calculateOverallRisk(risks);

    return {
      overallRisk,
      risks,
      recommendations,
      requiredClauses,
      redFlags,
      compliance
    };
  }

  /**
   * Check fiscal/tax risks
   */
  private checkFiscalRisks(contractData: any): ContractRisk[] {
    const risks: ContractRisk[] = [];

    // RFC validation risk
    if (!this.validateRFC(contractData.parties.provider.rfc) ||
        !this.validateRFC(contractData.parties.client.rfc)) {
      risks.push({
        category: 'fiscal',
        severity: 'high',
        description: 'Invalid RFC detected - may cause CFDI rejection and tax issues',
        mitigation: 'Verify RFC with SAT\'s validation service before signing',
        probability: 1.0,
        impact: contractData.value * 0.35, // Potential fines up to 35%
        timeline: 'immediate',
        references: ['CFF Art. 29-A']
      });
    }

    // Withholding obligations
    if (contractData.parties.client.type === 'company' &&
        contractData.parties.provider.type === 'individual') {
      const withholdingRate = contractData.type === 'service' ? 0.10 : 0.10;
      risks.push({
        category: 'fiscal',
        severity: 'medium',
        description: `Client must withhold ${withholdingRate * 100}% ISR for individual provider`,
        mitigation: 'Include withholding clause and ensure proper tax receipts',
        probability: 1.0,
        impact: contractData.value * withholdingRate,
        timeline: 'immediate',
        references: ['LISR Art. 106']
      });
    }

    // High-value transaction reporting
    if (contractData.value > 2000000) { // 2 million MXN
      risks.push({
        category: 'fiscal',
        severity: 'medium',
        description: 'Transaction exceeds reporting threshold for SAT',
        mitigation: 'Ensure proper documentation for anti-money laundering compliance',
        probability: 1.0,
        impact: 50000, // Potential fine
        timeline: 'short_term',
        references: ['LFPIORPI Art. 17']
      });
    }

    return risks;
  }

  /**
   * Check labor law risks
   */
  private checkLaborRisks(contractData: any): ContractRisk[] {
    const risks: ContractRisk[] = [];

    // Outsourcing prohibition
    if (contractData.type === 'service' && contractData.hasEmployees) {
      risks.push({
        category: 'labor',
        severity: 'critical',
        description: 'Potential illegal outsourcing under 2021 reform',
        mitigation: 'Ensure service is specialized and provider is registered with STPS',
        probability: 0.7,
        impact: contractData.value * 1.5, // Severe penalties
        timeline: 'immediate',
        references: ['LFT Art. 12-15']
      });
    }

    // PTU obligations
    if (contractData.type === 'employment' && contractData.duration > 2) {
      risks.push({
        category: 'labor',
        severity: 'high',
        description: 'PTU (profit sharing) obligations not specified',
        mitigation: 'Include PTU calculation and payment terms',
        probability: 1.0,
        impact: contractData.value * 0.10, // 10% of profits
        timeline: 'medium_term',
        references: ['LFT Art. 117-131']
      });
    }

    // Vacation reform 2023
    risks.push({
      category: 'labor',
      severity: 'medium',
      description: 'New vacation law requires 12 days minimum from year 1',
      mitigation: 'Update vacation clause to comply with 2023 reform',
      probability: 1.0,
      impact: contractData.value * 0.02,
      timeline: 'immediate',
      references: ['LFT Art. 76 (Reformed 2023)']
    });

    return risks;
  }

  /**
   * Check commercial/business risks
   */
  private checkCommercialRisks(contractData: any): ContractRisk[] {
    const risks: ContractRisk[] = [];

    // Payment terms
    if (contractData.terms.payment_days && contractData.terms.payment_days > 30) {
      risks.push({
        category: 'commercial',
        severity: 'medium',
        description: `Payment terms (${contractData.terms.payment_days} days) exceed PROFECO recommendations`,
        mitigation: 'Negotiate shorter payment terms or include interest clause',
        probability: 0.5,
        impact: contractData.value * 0.02 * (contractData.terms.payment_days / 30),
        timeline: 'short_term',
        references: ['PROFECO Guidelines']
      });
    }

    // Jurisdiction issues
    if (contractData.terms.jurisdiction &&
        !contractData.terms.jurisdiction.includes('México')) {
      risks.push({
        category: 'legal',
        severity: 'high',
        description: 'Foreign jurisdiction may complicate dispute resolution',
        mitigation: 'Include Mexican jurisdiction or arbitration clause with CAM',
        probability: 0.3,
        impact: contractData.value * 0.20, // Legal costs
        timeline: 'long_term',
        references: ['CCom Art. 1090-1122']
      });
    }

    // IP ownership for service contracts
    if (contractData.type === 'service' && !contractData.terms.ip_ownership) {
      risks.push({
        category: 'commercial',
        severity: 'medium',
        description: 'Intellectual property ownership not specified',
        mitigation: 'Add explicit IP assignment or licensing clause',
        probability: 0.4,
        impact: contractData.value * 0.30,
        timeline: 'medium_term',
        references: ['LFDA Art. 83-86']
      });
    }

    return risks;
  }

  /**
   * Check regulatory compliance risks
   */
  private checkRegulatoryRisks(contractData: any): ContractRisk[] {
    const risks: ContractRisk[] = [];

    // Anti-corruption compliance
    if (contractData.value > 500000) {
      risks.push({
        category: 'regulatory',
        severity: 'medium',
        description: 'Contract value triggers enhanced anti-corruption requirements',
        mitigation: 'Include anti-corruption clause and integrity declaration',
        probability: 0.2,
        impact: contractData.value * 0.50,
        timeline: 'medium_term',
        references: ['LGRA Art. 7']
      });
    }

    // Data protection (if services involve data)
    if (contractData.type === 'service') {
      risks.push({
        category: 'regulatory',
        severity: 'medium',
        description: 'Missing data protection clauses required by LFPDPPP',
        mitigation: 'Add privacy notice and data processing agreement',
        probability: 0.6,
        impact: 250000, // INAI fines
        timeline: 'short_term',
        references: ['LFPDPPP Art. 36-37']
      });
    }

    // Consumer protection (B2C contracts)
    if (contractData.parties.client.type === 'individual') {
      risks.push({
        category: 'regulatory',
        severity: 'medium',
        description: 'Consumer protection requirements may apply',
        mitigation: 'Ensure compliance with PROFECO regulations and include warranty',
        probability: 0.5,
        impact: 100000,
        timeline: 'immediate',
        references: ['LFPC Art. 73-92']
      });
    }

    return risks;
  }

  /**
   * Check cross-border specific risks
   */
  private checkCrossBorderRisks(contractData: any): ContractRisk[] {
    const risks: ContractRisk[] = [];

    // Transfer pricing
    risks.push({
      category: 'fiscal',
      severity: 'high',
      description: 'Cross-border transaction requires transfer pricing documentation',
      mitigation: 'Prepare transfer pricing study and master file',
      probability: 0.8,
      impact: contractData.value * 0.40,
      timeline: 'short_term',
      references: ['LISR Art. 76-A, 179-180']
    });

    // Permanent establishment risk
    if (contractData.duration > 6) {
      risks.push({
        category: 'fiscal',
        severity: 'high',
        description: 'Duration may create permanent establishment in Mexico',
        mitigation: 'Structure to avoid PE or register with SAT',
        probability: 0.6,
        impact: contractData.value * 0.30,
        timeline: 'medium_term',
        references: ['Tax Treaty Art. 5']
      });
    }

    // Currency risk
    risks.push({
      category: 'commercial',
      severity: 'medium',
      description: 'Exchange rate fluctuation risk for MXN/USD',
      mitigation: 'Include currency adjustment clause or hedge',
      probability: 0.7,
      impact: contractData.value * 0.15,
      timeline: 'medium_term',
      references: ['CCom Art. 389']
    });

    return risks;
  }

  /**
   * Generate recommendations based on risks
   */
  private generateRecommendations(risks: ContractRisk[], contractData: any): string[] {
    const recommendations: string[] = [];

    // Critical risks first
    const criticalRisks = risks.filter(r => r.severity === 'critical');
    if (criticalRisks.length > 0) {
      recommendations.push('⚠️ CRITICAL: Address outsourcing compliance before signing');
    }

    // Fiscal recommendations
    if (risks.some(r => r.category === 'fiscal')) {
      recommendations.push('Engage tax advisor to review withholding obligations');
      recommendations.push('Verify all parties\' tax compliance status with SAT');
    }

    // Labor recommendations
    if (risks.some(r => r.category === 'labor')) {
      recommendations.push('Review with labor attorney to ensure LFT compliance');
      recommendations.push('Register specialized services with REPSE if applicable');
    }

    // Contract structure
    recommendations.push('Include inflation adjustment clause (UDI-based)');
    recommendations.push('Add force majeure clause covering government actions');
    recommendations.push('Specify governing law as Mexican federal law');

    // Dispute resolution
    if (contractData.value > 1000000) {
      recommendations.push('Consider CAM (Centro de Arbitraje de México) arbitration clause');
    }

    return recommendations;
  }

  /**
   * Get required clauses for contract type
   */
  private getRequiredClauses(contractData: any): string[] {
    const clauses: string[] = [
      'Objeto del contrato (Purpose)',
      'Vigencia y terminación (Term and termination)',
      'Contraprestación y forma de pago (Consideration and payment)',
      'Obligaciones de las partes (Obligations)',
      'Confidencialidad (Confidentiality)',
      'Caso fortuito y fuerza mayor (Force majeure)',
      'Jurisdicción y competencia (Jurisdiction)'
    ];

    // Type-specific clauses
    if (contractData.type === 'service') {
      clauses.push(
        'Propiedad intelectual (IP ownership)',
        'Entregables y aceptación (Deliverables)',
        'Garantía de servicio (Service warranty)'
      );
    }

    if (contractData.type === 'employment') {
      clauses.push(
        'Salario y prestaciones (Salary and benefits)',
        'Jornada laboral (Working hours)',
        'Vacaciones y prima vacacional (Vacation)',
        'Aguinaldo (Christmas bonus)',
        'PTU (Profit sharing)',
        'Causales de rescisión (Termination causes)'
      );
    }

    if (contractData.crossBorder) {
      clauses.push(
        'Moneda y tipo de cambio (Currency)',
        'Impuestos y retenciones (Taxes)',
        'Cumplimiento regulatorio (Regulatory compliance)'
      );
    }

    return clauses;
  }

  /**
   * Identify red flags in contract
   */
  private identifyRedFlags(contractData: any, risks: ContractRisk[]): string[] {
    const redFlags: string[] = [];

    if (risks.filter(r => r.severity === 'critical').length > 0) {
      redFlags.push('🚩 Critical compliance issues detected');
    }

    if (!contractData.terms.penalties) {
      redFlags.push('🚩 No penalty clauses for non-compliance');
    }

    if (contractData.terms.payment_days > 60) {
      redFlags.push('🚩 Excessive payment terms (>60 days)');
    }

    if (!contractData.terms.confidentiality) {
      redFlags.push('🚩 Missing confidentiality protection');
    }

    if (contractData.value > 1000000 && !contractData.terms.arbitration) {
      redFlags.push('🚩 High-value contract without arbitration clause');
    }

    if (contractData.hasEmployees && contractData.type === 'service') {
      redFlags.push('🚩 Potential illegal outsourcing structure');
    }

    return redFlags;
  }

  /**
   * Check regulatory compliance
   */
  private checkCompliance(contractData: any): ContractAnalysis['compliance'] {
    return {
      sat: this.validateRFC(contractData.parties.provider.rfc) &&
           this.validateRFC(contractData.parties.client.rfc),
      imss: contractData.type !== 'employment' || contractData.duration < 1,
      nom: true, // Assumed unless specific industry
      profeco: contractData.parties.client.type === 'company' ||
               contractData.terms.payment_days <= 30
    };
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(risks: ContractRisk[]): ContractAnalysis['overallRisk'] {
    if (risks.some(r => r.severity === 'critical')) return 'critical';
    if (risks.filter(r => r.severity === 'high').length > 2) return 'high';
    if (risks.filter(r => r.severity === 'medium').length > 3) return 'medium';
    return 'low';
  }

  /**
   * Validate Mexican RFC format
   */
  private validateRFC(rfc: string): boolean {
    // Simplified RFC validation
    const rfcPattern = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
  }

  /**
   * Convert risks to recommendation format
   */
  convertToRecommendations(analysis: ContractAnalysis): Recommendation[] {
    return analysis.risks
      .filter(risk => risk.severity === 'high' || risk.severity === 'critical')
      .map(risk => ({
        id: `contract-risk-${Date.now()}-${Math.random()}`,
        title: `Contract Risk: ${risk.description}`,
        description: risk.mitigation,
        priority: risk.severity === 'critical' ? 'critical' : 'high',
        confidence: risk.probability,
        expectedImpact: {
          revenue: {
            baseline: 0,
            target: -risk.impact,
            delta: -risk.impact,
            deltaPercent: 0,
            unit: 'MXN'
          },
          timeToImpact: this.timelineTodays(risk.timeline),
          sustainabilityMonths: 12
        },
        actions: [
          {
            id: `action-${Date.now()}`,
            label: risk.mitigation,
            type: risk.timeline === 'immediate' ? 'immediate' : 'process',
            effort: risk.severity === 'critical' ? 'high' : 'medium',
            owner: 'Legal',
            deadline: this.getDeadline(risk.timeline),
            dependencies: [],
            automatable: false,
            status: 'pending'
          }
        ],
        status: 'pending',
        reasoning: `Legal requirement: ${risk.references?.join(', ') || 'Best practice'}`,
        testable: false
      }));
  }

  /**
   * Helper: Convert timeline to days
   */
  private timelineTodays(timeline: ContractRisk['timeline']): number {
    switch (timeline) {
      case 'immediate': return 1;
      case 'short_term': return 30;
      case 'medium_term': return 90;
      case 'long_term': return 180;
    }
  }

  /**
   * Helper: Get deadline from timeline
   */
  private getDeadline(timeline: ContractRisk['timeline']): Date {
    const date = new Date();
    date.setDate(date.getDate() + this.timelineTodays(timeline));
    return date;
  }
}

// ============================================================================
// CONTRACT TEMPLATE GENERATOR
// ============================================================================

export class MexicanContractTemplates {
  /**
   * Generate contract template with Mexican legal requirements
   */
  generateTemplate(type: 'service' | 'employment' | 'supply'): string {
    const templates = {
      service: this.getServiceTemplate(),
      employment: this.getEmploymentTemplate(),
      supply: this.getSupplyTemplate()
    };

    return templates[type];
  }

  private getServiceTemplate(): string {
    return `CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES

Entre [CLIENTE], con RFC [RFC_CLIENTE] (el "Cliente") y
[PRESTADOR], con RFC [RFC_PRESTADOR] (el "Prestador")

DECLARACIONES
I. Declara el Cliente...
II. Declara el Prestador...

CLÁUSULAS

PRIMERA. OBJETO
El Prestador se obliga a prestar servicios profesionales de [DESCRIPCIÓN]

SEGUNDA. CONTRAPRESTACIÓN
$[MONTO] MXN más IVA, pagaderos [FORMA_PAGO]

TERCERA. PLAZO
[DURACIÓN] meses a partir de [FECHA_INICIO]

CUARTA. OBLIGACIONES FISCALES
- CFDI por cada pago
- Retención ISR: [10% personas físicas si aplica]
- El Prestador declara estar al corriente con SAT

QUINTA. PROPIEDAD INTELECTUAL
Los derechos de PI generados serán propiedad de [DEFINIR]

SEXTA. CONFIDENCIALIDAD
[Cláusula NDA estándar]

SÉPTIMA. NO RELACIÓN LABORAL
Las partes reconocen que no existe relación laboral

OCTAVA. PENAS CONVENCIONALES
[DEFINIR PENALIZACIONES]

NOVENA. JURISDICCIÓN
Tribunales de [CIUDAD], México, renunciando a cualquier otro fuero

Firmado en [CIUDAD] a [FECHA]

_________________        _________________
CLIENTE                  PRESTADOR`;
  }

  private getEmploymentTemplate(): string {
    return `CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO [DETERMINADO/INDETERMINADO]

Conforme a la Ley Federal del Trabajo

EMPLEADOR: [EMPRESA] RFC: [RFC]
TRABAJADOR: [NOMBRE] RFC: [RFC] CURP: [CURP]

CLÁUSULAS:

1. PUESTO: [DESCRIPCIÓN]
2. SALARIO: $[MONTO] [PERIODO]
3. JORNADA: [HORAS] horas, de [HORARIO]
4. LUGAR DE TRABAJO: [DIRECCIÓN]

PRESTACIONES DE LEY:
- Vacaciones: 12 días (año 1), prima 25%
- Aguinaldo: 15 días mínimo
- IMSS: Inscripción obligatoria
- PTU: Conforme a ley
- INFONAVIT: Aportaciones patronales

OBLIGACIONES ESPECIALES:
[DEFINIR]

CAUSALES DE RESCISIÓN:
Conforme al Artículo 47 de la LFT

Firmado por triplicado en [CIUDAD] a [FECHA]`;
  }

  private getSupplyTemplate(): string {
    return `CONTRATO DE SUMINISTRO

PROVEEDOR: [EMPRESA] RFC: [RFC]
COMPRADOR: [EMPRESA] RFC: [RFC]

1. PRODUCTOS: [DESCRIPCIÓN Y ESPECIFICACIONES]
2. PRECIO UNITARIO: $[MONTO] MXN más IVA
3. VOLUMEN: [CANTIDAD] [UNIDAD]
4. ENTREGA: [INCOTERM] en [LUGAR]
5. PLAZO DE ENTREGA: [DÍAS] días
6. FORMA DE PAGO: [CONDICIONES]
7. GARANTÍA: [PERIODO] por defectos

PENALIZACIONES:
- Retraso: 0.5% por día hasta 10%
- Incumplimiento: 20% del valor

CASO FORTUITO:
Incluye actos de gobierno, pandemias

JURISDICCIÓN: México, D.F.`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MexicanContractValidator;