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

### Banner: "Autenticación no disponible"

**Cause:** Auth feature is enabled but Supabase credentials are not configured.

**Fix:**
1. Verify `NEXT_PUBLIC_FEATURE_AUTH=on` in your environment
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. For Netlify: Clear cache and redeploy after adding variables
4. For local: Restart your dev server after updating `.env.local`

### Build Error: "Module not found @/lib/supabase/client"

**Fix:** Ensure apps/atelier/tsconfig.json has correct paths configuration:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

### Warning Icon in Navigation

**Cause:** `NEXT_PUBLIC_FEATURE_AUTH=on` but credentials are missing.

**Fix:** Add Supabase environment variables as described above. The warning will disappear once credentials are properly configured.

### Invite Email Not Sending

**Cause:** Missing `SUPABASE_SERVICE_ROLE_KEY` or email service not configured.

**Fix:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (must be secret/sensitive in Netlify)
2. Configure email service (`EMAIL_PROVIDER` and `EMAIL_API_KEY`)
3. Check `/api/members/invite` endpoint logs for specific errors

## Security Notes

⚠️ **IMPORTANT:**

### Environment Variables
1. **Never commit** `.env.local` or `.env` files to git
2. `SUPABASE_SERVICE_ROLE_KEY` must be kept **secret** - only use server-side
3. Mark `SUPABASE_SERVICE_ROLE_KEY` as "Sensitive" in Netlify
4. All `NEXT_PUBLIC_*` variables are exposed to the browser - never put secrets there

### Row Level Security (RLS)
Atelier implements multi-tenant architecture with organization isolation:

1. **Enable RLS** on all tables in Supabase
2. Required policies for `memberships` table:
   ```sql
   -- Users can only see memberships in their organization
   CREATE POLICY "Users see own org memberships"
   ON memberships FOR SELECT
   USING (org_id IN (
     SELECT org_id FROM memberships WHERE user_id = auth.uid()
   ));

   -- Only owners/admins can invite members
   CREATE POLICY "Owners and admins can insert memberships"
   ON memberships FOR INSERT
   WITH CHECK (
     EXISTS (
       SELECT 1 FROM memberships
       WHERE user_id = auth.uid()
       AND org_id = memberships.org_id
       AND role IN ('owner', 'admin')
     )
   );
   ```

3. Required policies for `audit_logs` table:
   ```sql
   -- Users can only see audit logs for their organization
   CREATE POLICY "Users see own org audit logs"
   ON audit_logs FOR SELECT
   USING (org_id IN (
     SELECT org_id FROM memberships WHERE user_id = auth.uid()
   ));
   ```

### API Security
- `/api/members/invite` validates user permissions before sending invites
- Only `owner` and `admin` roles can invite new members
- Invitation tokens expire after 7 days
- Audit logs track all member invitations (who invited whom, when)

## Feature Flag Behavior

### When `NEXT_PUBLIC_FEATURE_AUTH=off`:
- Auth UI hidden from navigation
- Auth routes show "Feature disabled" message
- App continues to work for non-auth features
- No Supabase connection attempted

### When `NEXT_PUBLIC_FEATURE_AUTH=on` but credentials missing:
- Auth pages show clear error banner with setup instructions
- Navigation shows warning icon for admins
- Link to configuration guide provided
- Non-auth features continue to work

### When fully configured:
- Full authentication functionality enabled
- User sign-up, sign-in, password reset working
- Member invitation system active
- Session persistence across page loads

