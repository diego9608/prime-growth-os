# Supabase Auth Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project (free tier is fine)
3. Save your credentials:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships table (users belong to organizations)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- Audit logs table (with org isolation)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  entity_title TEXT,
  reasoning TEXT,
  expected_impact JSONB,
  actual_impact JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiments table (with org isolation)
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('designed', 'running', 'completed', 'abandoned')),
  hypothesis TEXT,
  metric TEXT,
  baseline NUMERIC,
  target NUMERIC,
  current_value NUMERIC,
  sample_size INTEGER,
  current_sample INTEGER,
  confidence NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  result TEXT,
  decision TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
```

## 3. Row Level Security (RLS) Policies

```sql
-- Organizations: users can only see orgs they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

-- Memberships: users can see members of their org
CREATE POLICY "Users can view org members" ON memberships
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

-- Memberships: only owners/admins can manage members
CREATE POLICY "Owners can manage members" ON memberships
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Audit logs: users can only see their org's logs
CREATE POLICY "Users can view org audit logs" ON audit_logs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

-- Audit logs: anyone in org can create logs
CREATE POLICY "Users can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

-- Experiments: org isolation
CREATE POLICY "Users can view org experiments" ON experiments
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage experiments" ON experiments
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );
```

## 4. Seed Data

```sql
-- Create Cuarzo organization
INSERT INTO organizations (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cuarzo Architecture');

-- After Andrés signs up, make him owner:
-- INSERT INTO memberships (user_id, org_id, role) VALUES
--   ('[ANDRES_USER_ID]', '11111111-1111-1111-1111-111111111111', 'owner');
```

## 5. Email Templates (Supabase Dashboard)

Go to **Authentication** → **Email Templates** and customize:

### Invite User
```html
<h2>You've been invited to Alear OS</h2>
<p>{{ .SiteURL }}/auth/accept-invite?token={{ .Token }}</p>
```

### Reset Password
```html
<h2>Reset your password</h2>
<p>{{ .SiteURL }}/auth/reset-password?token={{ .Token }}</p>
```

## 6. Auth Settings

In Supabase Dashboard → **Authentication** → **Settings**:
- Enable Email auth
- Disable Email confirmations (for faster testing)
- Add your domain to **Redirect URLs**: `https://your-domain.netlify.app/**`

## 7. Next Steps

1. Install Supabase client: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
2. Add credentials to `.env.local`
3. Test connection with sample code
4. Implement auth pages