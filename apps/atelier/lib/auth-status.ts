export type AuthStatus = {
  enabled: boolean
  featureFlag: boolean
  hasCredentials: boolean
  message?: string
}

export function getAuthStatus(): AuthStatus {
  const featureFlag = process.env.NEXT_PUBLIC_FEATURE_AUTH === 'on'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasCredentials = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co'
  )

  if (!featureFlag) {
    return {
      enabled: false,
      featureFlag: false,
      hasCredentials,
      message: 'Authentication is disabled via feature flag'
    }
  }

  if (!hasCredentials) {
    return {
      enabled: false,
      featureFlag: true,
      hasCredentials: false,
      message: 'Missing Supabase credentials. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    }
  }

  return {
    enabled: true,
    featureFlag: true,
    hasCredentials: true
  }
}

export function canUseAuth(): boolean {
  return getAuthStatus().enabled
}
