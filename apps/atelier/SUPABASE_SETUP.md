# Supabase Setup for Atelier

This guide explains how to configure Supabase authentication for the Atelier app, both locally and on Netlify.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Your Supabase project URL and API keys

## Local Development Setup

### 1. Copy Environment Template

```bash
cd apps/atelier
cp .env.template .env.local
```

### 2. Configure Supabase Variables

Open `.env.local` and fill in your Supabase credentials:

```bash
# Enable authentication
NEXT_PUBLIC_FEATURE_AUTH=on

# Supabase credentials (get these from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these values:**
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy:
  - **Project URL** → NEXT_PUBLIC_SUPABASE_URL
  - **anon public** key → NEXT_PUBLIC_SUPABASE_ANON_KEY
  - **service_role** key → SUPABASE_SERVICE_ROLE_KEY (keep this secret!)

### 3. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000/auth/sign-in - you should see the login page without errors.

## Netlify Deployment Setup

### 1. Configure Environment Variables

Go to your Netlify site dashboard:
1. Navigate to **Site configuration → Environment variables**
2. Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| NEXT_PUBLIC_FEATURE_AUTH | on | Enables auth UI |
| NEXT_PUBLIC_SUPABASE_URL | https://your-project.supabase.co | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | your-anon-key | Safe for browser |
| SUPABASE_SERVICE_ROLE_KEY | your-service-role-key | SECRET - mark as sensitive |

### 2. Deploy

After adding environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy → Clear cache and deploy**
3. Wait for the build to complete

### 3. Verify

Visit your deployed site - /auth/sign-in should load without errors.

## Troubleshooting

### Build Error: "Module not found @/lib/supabase/client"

**Fix:** Ensure apps/atelier/tsconfig.json has correct paths configuration.

### Runtime Error: "Missing Supabase environment variables"

**Fix:** Verify all NEXT_PUBLIC_SUPABASE_* variables are set in Netlify and redeploy.

## Security Notes

⚠️ **IMPORTANT:**
1. Never commit .env.local files to git
2. SUPABASE_SERVICE_ROLE_KEY must be kept secret
3. Use Row Level Security (RLS) policies in Supabase

