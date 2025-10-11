/**
 * Environment Variable Validator
 * Validates required environment variables at build/runtime
 */

type EnvVar = {
  name: string
  required: boolean
  type?: 'string' | 'number' | 'boolean' | 'url'
  defaultValue?: string
  description?: string
}

const ENV_VARS: EnvVar[] = [
  // Feature Flags
  { name: 'NEXT_PUBLIC_FEATURE_SGP', required: false, type: 'string', defaultValue: 'off', description: 'Strategic Growth Predictor feature flag' },
  { name: 'NEXT_PUBLIC_FEATURE_AUTH', required: false, type: 'string', defaultValue: 'off', description: 'Authentication feature flag' },

  // SGP Configuration
  { name: 'RESPONSE_CURVE_MODE', required: false, type: 'string', defaultValue: 'exponential' },
  { name: 'LLM_ROUTER_MODE', required: false, type: 'string', defaultValue: 'auto' },
  { name: 'FORECAST_HORIZON_DAYS', required: false, type: 'number', defaultValue: '90' },

  // Governance
  { name: 'ENABLE_GOVERNANCE', required: false, type: 'boolean', defaultValue: 'true' },
  { name: 'AUDIT_RETENTION_DAYS', required: false, type: 'number', defaultValue: '365' },
  { name: 'ANONYMIZE_EXPORTS', required: false, type: 'boolean', defaultValue: 'true' },

  // Thresholds
  { name: 'CRITICAL_IMPACT_THRESHOLD_MX', required: false, type: 'number', defaultValue: '100000' },
  { name: 'LOW_CONFIDENCE', required: false, type: 'number', defaultValue: '0.5' },
  { name: 'MIN_SENT_CONF', required: false, type: 'number', defaultValue: '0.6' },
]

// Add conditional requirements
const CONDITIONAL_VARS: Array<{ condition: () => boolean; vars: EnvVar[] }> = [
  {
    condition: () => process.env.LLM_ROUTER_MODE === 'force_llm' || process.env.LLM_ROUTER_MODE === 'auto',
    vars: [
      { name: 'ANTHROPIC_API_KEY', required: true, type: 'string', description: 'Anthropic API key for LLM features' }
    ]
  },
  {
    condition: () => process.env.NEXT_PUBLIC_FEATURE_AUTH === 'on',
    vars: [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, type: 'url', description: 'Supabase project URL' },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, type: 'string', description: 'Supabase anon key' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, type: 'string', description: 'Supabase service role key' }
    ]
  },
  {
    condition: () => !!process.env.EMAIL_PROVIDER,
    vars: [
      { name: 'EMAIL_API_KEY', required: true, type: 'string', description: 'Email service API key' },
      { name: 'EMAIL_FROM', required: true, type: 'string', description: 'From email address' }
    ]
  }
]

export function validateEnv() {
  const errors: string[] = []
  const warnings: string[] = []

  // Check base environment variables
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]

    if (!value && envVar.required) {
      errors.push(`❌ Missing required env var: ${envVar.name}${envVar.description ? ` (${envVar.description})` : ''}`)
    } else if (!value && !envVar.required && envVar.defaultValue) {
      // Use default value
      process.env[envVar.name] = envVar.defaultValue
      if (process.env.NODE_ENV === 'development') {
        warnings.push(`⚠️ Using default for ${envVar.name}: ${envVar.defaultValue}`)
      }
    }

    // Type validation
    if (value && envVar.type) {
      if (envVar.type === 'number' && isNaN(Number(value))) {
        errors.push(`❌ ${envVar.name} must be a number, got: ${value}`)
      } else if (envVar.type === 'boolean' && !['true', 'false'].includes(value.toLowerCase())) {
        errors.push(`❌ ${envVar.name} must be true or false, got: ${value}`)
      } else if (envVar.type === 'url' && !value.startsWith('http')) {
        errors.push(`❌ ${envVar.name} must be a valid URL, got: ${value}`)
      }
    }
  }

  // Check conditional requirements
  for (const conditional of CONDITIONAL_VARS) {
    if (conditional.condition()) {
      for (const envVar of conditional.vars) {
        const value = process.env[envVar.name]
        if (!value && envVar.required) {
          errors.push(`❌ Missing required env var: ${envVar.name}${envVar.description ? ` (${envVar.description})` : ''}`)
        }
      }
    }
  }

  // Display results
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.log('\n📋 Environment Warnings:')
    warnings.forEach(w => console.log(w))
  }

  if (errors.length > 0) {
    console.error('\n🚨 Environment Validation Failed:')
    errors.forEach(e => console.error(e))
    console.error('\n💡 Tip: Copy .env.template to .env.local and fill in the required values')
    console.error('   Or import .env file in Netlify: Site Settings → Environment Variables → Import from .env file\n')

    if (process.env.NODE_ENV === 'production' || process.env.CI) {
      process.exit(1)
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('✅ Environment variables validated successfully')
  }
}

// Validate on import (build time)
if (typeof window === 'undefined') {
  validateEnv()
}

// Helper function to get typed env var
export function getEnvVar(name: string, defaultValue?: string): string {
  return process.env[name] || defaultValue || ''
}

export function getNumericEnvVar(name: string, defaultValue: number): number {
  const value = process.env[name]
  return value ? Number(value) : defaultValue
}

export function getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]
  return value ? value.toLowerCase() === 'true' : defaultValue
}