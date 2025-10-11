/**
 * Spanish Sentiment Analysis with Fallback
 * Non-LLM sentiment analysis for Spanish text with keyword-based approach
 * Falls back to LLM when confidence is low
 */

import type { Recommendation } from './types';

// ============================================================================
// SENTIMENT TYPES
// ============================================================================

export interface SentimentResult {
  score: number;          // -1 (negative) to 1 (positive)
  magnitude: number;      // 0 (neutral) to 1 (strong)
  confidence: number;     // 0 to 1
  method: 'keywords' | 'patterns' | 'llm';
  aspects?: {
    product: number;
    service: number;
    price: number;
    delivery: number;
  };
}

// ============================================================================
// SPANISH SENTIMENT ANALYZER
// ============================================================================

export class SpanishSentimentAnalyzer {
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  // Spanish sentiment dictionaries
  private readonly POSITIVE_WORDS = new Set([
    // Quality/Excellence
    'excelente', 'óptimo', 'superior', 'magnífico', 'extraordinario',
    'excepcional', 'sobresaliente', 'destacado', 'perfecto', 'ideal',

    // Satisfaction
    'satisfecho', 'contento', 'feliz', 'encantado', 'complacido',
    'agradecido', 'gratificante', 'placentero', 'gozoso', 'dichoso',

    // Business success
    'exitoso', 'rentable', 'productivo', 'eficiente', 'eficaz',
    'provechoso', 'beneficioso', 'lucrativo', 'fructífero', 'próspero',

    // Reliability
    'confiable', 'seguro', 'estable', 'sólido', 'firme',
    'consistente', 'duradero', 'permanente', 'fiable', 'garantizado',

    // Speed/Efficiency
    'rápido', 'ágil', 'veloz', 'inmediato', 'puntual',
    'expedito', 'pronto', 'ligero', 'diligente', 'dinámico',

    // Value
    'económico', 'barato', 'accesible', 'conveniente', 'ventajoso',
    'competitivo', 'razonable', 'justo', 'módico', 'asequible'
  ]);

  private readonly NEGATIVE_WORDS = new Set([
    // Problems/Issues
    'problema', 'error', 'falla', 'defecto', 'avería',
    'desperfecto', 'incidencia', 'inconveniente', 'complicación', 'dificultad',

    // Dissatisfaction
    'insatisfecho', 'molesto', 'disgustado', 'decepcionado', 'frustrado',
    'enojado', 'irritado', 'indignado', 'descontento', 'inconforme',

    // Poor quality
    'malo', 'pésimo', 'terrible', 'horrible', 'deficiente',
    'mediocre', 'inferior', 'inadecuado', 'inaceptable', 'deplorable',

    // Delays/Slowness
    'lento', 'tardío', 'demorado', 'retrasado', 'atrasado',
    'pausado', 'moroso', 'rezagado', 'diferido', 'postergado',

    // Expensive
    'caro', 'costoso', 'elevado', 'excesivo', 'exorbitante',
    'prohibitivo', 'oneroso', 'gravoso', 'desmesurado', 'abusivo',

    // Unreliability
    'inestable', 'inseguro', 'dudoso', 'cuestionable', 'inconsistente',
    'variable', 'impredecible', 'errático', 'volátil', 'frágil'
  ]);

  // Intensifiers (modify sentiment strength)
  private readonly INTENSIFIERS = new Map([
    ['muy', 1.5],
    ['mucho', 1.5],
    ['bastante', 1.3],
    ['extremadamente', 2.0],
    ['sumamente', 1.8],
    ['demasiado', 1.7],
    ['increíblemente', 1.9],
    ['absolutamente', 2.0],
    ['totalmente', 1.8],
    ['completamente', 1.8],
    ['algo', 0.7],
    ['poco', 0.5],
    ['ligeramente', 0.6],
    ['apenas', 0.4],
    ['casi', 0.8]
  ]);

  // Negation words (reverse sentiment)
  private readonly NEGATIONS = new Set([
    'no', 'nunca', 'jamás', 'ningún', 'ninguno', 'ninguna',
    'nada', 'tampoco', 'ni', 'sin'
  ]);

  // Business context patterns
  private readonly BUSINESS_PATTERNS = [
    { pattern: /cumpl(e|ió) con (las )?expectativas/i, sentiment: 0.6, confidence: 0.8 },
    { pattern: /superó (las )?expectativas/i, sentiment: 0.9, confidence: 0.9 },
    { pattern: /no cumpl(e|ió) con/i, sentiment: -0.7, confidence: 0.8 },
    { pattern: /entrega a tiempo/i, sentiment: 0.7, confidence: 0.8 },
    { pattern: /retraso en (la )?entrega/i, sentiment: -0.6, confidence: 0.8 },
    { pattern: /buena relación calidad-precio/i, sentiment: 0.8, confidence: 0.9 },
    { pattern: /mala relación calidad-precio/i, sentiment: -0.8, confidence: 0.9 },
    { pattern: /recomendaría/i, sentiment: 0.9, confidence: 0.9 },
    { pattern: /no recomendaría/i, sentiment: -0.9, confidence: 0.9 },
    { pattern: /volver(é|ía) a comprar/i, sentiment: 0.85, confidence: 0.9 },
    { pattern: /no volver(é|ía)/i, sentiment: -0.85, confidence: 0.9 }
  ];

  /**
   * Analyze sentiment of Spanish text
   */
  analyzeSentiment(text: string, requireHighConfidence: boolean = false): SentimentResult {
    // Clean and normalize text
    const normalized = this.normalizeText(text);
    const words = this.tokenize(normalized);

    // Try keyword-based analysis first
    const keywordResult = this.analyzeWithKeywords(words, text);

    // Check if we need higher confidence
    if (keywordResult.confidence >= this.CONFIDENCE_THRESHOLD || !requireHighConfidence) {
      return keywordResult;
    }

    // Try pattern-based analysis
    const patternResult = this.analyzeWithPatterns(text);
    if (patternResult.confidence >= this.CONFIDENCE_THRESHOLD) {
      return patternResult;
    }

    // Fallback to LLM if available and required
    if (requireHighConfidence) {
      return this.analyzeWithLLM(text);
    }

    // Return best available result
    return keywordResult.confidence > patternResult.confidence ? keywordResult : patternResult;
  }

  /**
   * Analyze multiple texts and aggregate sentiment
   */
  analyzeMultiple(texts: string[]): {
    overall: SentimentResult;
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    confidence: number;
  } {
    const results = texts.map(text => this.analyzeSentiment(text));

    // Calculate overall sentiment
    const totalScore = results.reduce((sum, r) => sum + r.score * r.magnitude, 0);
    const totalMagnitude = results.reduce((sum, r) => sum + r.magnitude, 0);
    const avgScore = totalMagnitude > 0 ? totalScore / totalMagnitude : 0;
    const avgMagnitude = results.reduce((sum, r) => sum + r.magnitude, 0) / results.length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    // Calculate distribution
    const distribution = {
      positive: results.filter(r => r.score > 0.2).length / results.length,
      neutral: results.filter(r => r.score >= -0.2 && r.score <= 0.2).length / results.length,
      negative: results.filter(r => r.score < -0.2).length / results.length
    };

    return {
      overall: {
        score: avgScore,
        magnitude: avgMagnitude,
        confidence: avgConfidence,
        method: 'keywords'
      },
      distribution,
      confidence: avgConfidence
    };
  }

  /**
   * Extract sentiment-relevant features for recommendations
   */
  extractSentimentFeatures(text: string): {
    urgency: number;        // 0-1, how urgent is the issue
    frustration: number;    // 0-1, level of frustration
    satisfaction: number;   // 0-1, level of satisfaction
    clarity: number;        // 0-1, how clear is the feedback
  } {
    const normalized = this.normalizeText(text);

    // Urgency indicators
    const urgencyWords = ['urgente', 'inmediato', 'crítico', 'ahora', 'ya', 'pronto'];
    const urgency = this.calculatePresence(normalized, urgencyWords);

    // Frustration indicators
    const frustrationWords = ['frustrante', 'molesto', 'irritante', 'harto', 'cansado', 'agotador'];
    const frustration = this.calculatePresence(normalized, frustrationWords);

    // Satisfaction indicators
    const satisfactionWords = ['satisfecho', 'contento', 'feliz', 'agradecido', 'complacido'];
    const satisfaction = this.calculatePresence(normalized, satisfactionWords);

    // Clarity (inverse of ambiguity)
    const ambiguityWords = ['quizás', 'tal vez', 'posiblemente', 'creo que', 'me parece'];
    const clarity = 1 - this.calculatePresence(normalized, ambiguityWords);

    return { urgency, frustration, satisfaction, clarity };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Keyword-based sentiment analysis
   */
  private analyzeWithKeywords(words: string[], originalText: string): SentimentResult {
    let positiveScore = 0;
    let negativeScore = 0;
    let wordCount = 0;
    let negation = false;
    let intensifier = 1.0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check for negation
      if (this.NEGATIONS.has(word)) {
        negation = true;
        continue;
      }

      // Check for intensifiers
      if (this.INTENSIFIERS.has(word)) {
        intensifier = this.INTENSIFIERS.get(word)!;
        continue;
      }

      // Check sentiment words
      let sentimentValue = 0;
      if (this.POSITIVE_WORDS.has(word)) {
        sentimentValue = 1 * intensifier;
        if (negation) sentimentValue *= -1;
        wordCount++;
      } else if (this.NEGATIVE_WORDS.has(word)) {
        sentimentValue = -1 * intensifier;
        if (negation) sentimentValue *= -1;
        wordCount++;
      }

      if (sentimentValue > 0) {
        positiveScore += sentimentValue;
      } else if (sentimentValue < 0) {
        negativeScore += Math.abs(sentimentValue);
      }

      // Reset modifiers after use
      if (sentimentValue !== 0) {
        negation = false;
        intensifier = 1.0;
      }
    }

    // Calculate final scores
    const totalScore = positiveScore - negativeScore;
    const magnitude = (positiveScore + negativeScore) / Math.max(words.length, 1);
    const normalizedScore = Math.max(-1, Math.min(1, totalScore / Math.max(wordCount, 1)));

    // Calculate confidence based on word coverage
    const confidence = Math.min(1, wordCount / Math.max(words.length * 0.1, 1));

    // Extract aspects if business context
    const aspects = this.extractAspects(originalText);

    return {
      score: normalizedScore,
      magnitude: Math.min(1, magnitude),
      confidence,
      method: 'keywords',
      aspects
    };
  }

  /**
   * Pattern-based sentiment analysis
   */
  private analyzeWithPatterns(text: string): SentimentResult {
    let totalScore = 0;
    let totalConfidence = 0;
    let matchCount = 0;

    for (const pattern of this.BUSINESS_PATTERNS) {
      if (pattern.pattern.test(text)) {
        totalScore += pattern.sentiment;
        totalConfidence += pattern.confidence;
        matchCount++;
      }
    }

    if (matchCount === 0) {
      return {
        score: 0,
        magnitude: 0,
        confidence: 0,
        method: 'patterns'
      };
    }

    return {
      score: totalScore / matchCount,
      magnitude: Math.abs(totalScore / matchCount),
      confidence: totalConfidence / matchCount,
      method: 'patterns'
    };
  }

  /**
   * LLM-based sentiment analysis (fallback)
   */
  private analyzeWithLLM(text: string): SentimentResult {
    // This would call an LLM API in production
    // For now, return a placeholder that indicates LLM should be used
    console.log('Falling back to LLM for sentiment analysis');

    return {
      score: 0,
      magnitude: 0,
      confidence: 0,
      method: 'llm'
    };
  }

  /**
   * Extract business aspects from text
   */
  private extractAspects(text: string): SentimentResult['aspects'] {
    const normalized = this.normalizeText(text);

    // Aspect keywords
    const aspects = {
      product: this.scoreAspect(normalized, [
        'producto', 'calidad', 'material', 'diseño', 'funcionalidad',
        'características', 'especificaciones', 'durabilidad'
      ]),
      service: this.scoreAspect(normalized, [
        'servicio', 'atención', 'soporte', 'ayuda', 'asistencia',
        'respuesta', 'comunicación', 'trato', 'personal'
      ]),
      price: this.scoreAspect(normalized, [
        'precio', 'costo', 'tarifa', 'valor', 'económico',
        'caro', 'barato', 'inversión', 'presupuesto'
      ]),
      delivery: this.scoreAspect(normalized, [
        'entrega', 'envío', 'tiempo', 'plazo', 'rapidez',
        'demora', 'retraso', 'puntual', 'logística'
      ])
    };

    return aspects;
  }

  /**
   * Score a specific aspect based on keyword presence
   */
  private scoreAspect(text: string, keywords: string[]): number {
    let score = 0;
    let mentions = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        mentions++;
        // Look for sentiment words near the keyword
        const nearbyText = this.extractNearbyText(text, keyword, 50);
        const words = this.tokenize(nearbyText);

        for (const word of words) {
          if (this.POSITIVE_WORDS.has(word)) score += 1;
          if (this.NEGATIVE_WORDS.has(word)) score -= 1;
        }
      }
    }

    return mentions > 0 ? score / mentions : 0;
  }

  /**
   * Extract text near a keyword
   */
  private extractNearbyText(text: string, keyword: string, radius: number): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';

    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + keyword.length + radius);

    return text.substring(start, end);
  }

  /**
   * Calculate presence of words in text
   */
  private calculatePresence(text: string, words: string[]): number {
    let count = 0;
    for (const word of words) {
      if (text.includes(word)) count++;
    }
    return Math.min(1, count / words.length);
  }

  /**
   * Normalize Spanish text
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[áà]/g, 'a')
      .replace(/[éè]/g, 'e')
      .replace(/[íì]/g, 'i')
      .replace(/[óò]/g, 'o')
      .replace(/[úù]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text.split(' ').filter(word => word.length > 2);
  }
}

// ============================================================================
// SENTIMENT-BASED RECOMMENDATION ENHANCER
// ============================================================================

export class SentimentRecommendationEnhancer {
  private analyzer = new SpanishSentimentAnalyzer();

  /**
   * Enhance recommendations based on sentiment analysis
   */
  enhanceRecommendation(
    recommendation: Recommendation,
    customerFeedback: string[]
  ): Recommendation {
    const sentimentAnalysis = this.analyzer.analyzeMultiple(customerFeedback);
    const enhanced = { ...recommendation };

    // Adjust priority based on sentiment
    if (sentimentAnalysis.overall.score < -0.5 && sentimentAnalysis.overall.magnitude > 0.7) {
      // Strong negative sentiment - increase priority
      enhanced.priority = 'critical';
      enhanced.reasoning = `${enhanced.reasoning} Customer sentiment analysis shows significant dissatisfaction (${(sentimentAnalysis.overall.score * 100).toFixed(0)}% negative).`;
    }

    // Add sentiment insights to evidence
    if (!enhanced.evidence) enhanced.evidence = [];
    enhanced.evidence.push({
      type: 'sentiment_analysis',
      data: sentimentAnalysis,
      insight: this.generateSentimentInsight(sentimentAnalysis)
    });

    // Adjust confidence based on sentiment clarity
    if (sentimentAnalysis.confidence < 0.6) {
      enhanced.confidence *= 0.9; // Reduce confidence if sentiment is unclear
    }

    return enhanced;
  }

  /**
   * Generate insight from sentiment analysis
   */
  private generateSentimentInsight(analysis: ReturnType<SpanishSentimentAnalyzer['analyzeMultiple']>): string {
    const sentiment = analysis.overall.score > 0.2 ? 'positive' :
                     analysis.overall.score < -0.2 ? 'negative' : 'neutral';

    const distribution = analysis.distribution;
    const dominant = Math.max(distribution.positive, distribution.neutral, distribution.negative);

    let insight = `Customer sentiment is ${sentiment} (${(analysis.overall.score * 100).toFixed(0)}%). `;

    if (distribution.negative > 0.4) {
      insight += `${(distribution.negative * 100).toFixed(0)}% of feedback is negative, indicating urgent attention needed. `;
    } else if (distribution.positive > 0.6) {
      insight += `${(distribution.positive * 100).toFixed(0)}% of feedback is positive, indicating strong satisfaction. `;
    }

    if (analysis.confidence < 0.7) {
      insight += 'Low confidence in analysis suggests need for deeper investigation.';
    }

    return insight;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SpanishSentimentAnalyzer;