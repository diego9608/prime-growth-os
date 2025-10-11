# Deployment Checklist for Atelier

## Pre-Deployment Steps

### 1. Environment Variables Setup

#### Netlify Configuration
1. Go to **Site Settings** → **Environment Variables**
2. Click **"Add a variable"** → **"Import from a .env file"**
3. Upload your `.env.production` file (based on `.env.production.sample`)
4. Ensure all required variables are set:
   - [ ] `NEXT_PUBLIC_APP_URL` - Set to your production URL
   - [ ] `NEXT_PUBLIC_FEATURE_SGP` - Set to `on` to enable SGP
   - [ ] `NEXT_PUBLIC_FEATURE_AUTH` - Set to `on` to enable auth
   - [ ] `ANTHROPIC_API_KEY` - Your Claude API key (if using SGP)
   - [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
   - [ ] `EMAIL_PROVIDER` - Choose: `postmark`, `resend`, or `sendgrid`
   - [ ] `EMAIL_API_KEY` - Your email service API key
   - [ ] `EMAIL_FROM` - Verified sender email

### 2. Supabase Setup

Run these SQL commands in Supabase SQL Editor:

1. [ ] Create database schema (see `SUPABASE_SETUP.md`)
2. [ ] Enable Row Level Security policies
3. [ ] Create Cuarzo organization seed data
4. [ ] Configure email templates in Supabase Dashboard
5. [ ] Add your domain to redirect URLs

### 3. Email Provider Setup

#### DNS Records Configuration
Add these DNS records to your domain:

1. [ ] **SPF Record**:
   ```
   TXT: v=spf1 include:[provider_spf] ~all
   ```

2. [ ] **DKIM Record**:
   ```
   TXT: [Provided by your email service]
   ```

3. [ ] **DMARC Record**:
   ```
   TXT: v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com
   ```

4. [ ] Verify domain in your email provider dashboard
5. [ ] Send test email to verify configuration

### 4. Feature Testing

Before deployment, test locally with production-like settings:

1. [ ] Set `.env.local` with production values
2. [ ] Test authentication flow:
   - [ ] Sign up
   - [ ] Sign in
   - [ ] Password reset
   - [ ] Member invitation
3. [ ] Test SGP features:
   - [ ] Bottleneck detection
   - [ ] Spend optimization
   - [ ] Executive briefs
   - [ ] Experiment tracking
4. [ ] Test email sending:
   - [ ] Invitation emails
   - [ ] Password reset emails

## Deployment Steps

### 1. Initial Deployment

1. [ ] Push code to GitHub/GitLab
2. [ ] Connect repository to Netlify
3. [ ] Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. [ ] Deploy site

### 2. Post-Deployment Verification

1. [ ] Check build logs for any errors
2. [ ] Verify environment variables are loaded
3. [ ] Test production URL loads correctly
4. [ ] Check browser console for errors

### 3. First User Setup

1. [ ] Sign up as the first user (Andrés)
2. [ ] Manually add owner role in Supabase:
   ```sql
   INSERT INTO memberships (user_id, org_id, role) VALUES
     ('[ANDRES_USER_ID]', '11111111-1111-1111-1111-111111111111', 'owner');
   ```
3. [ ] Test member invitation flow
4. [ ] Invite team members

## Monitoring & Maintenance

### Daily Checks
- [ ] Monitor Supabase dashboard for auth issues
- [ ] Check email provider dashboard for bounces
- [ ] Review error logs in Netlify

### Weekly Tasks
- [ ] Review audit logs
- [ ] Check API usage (Anthropic, Supabase)
- [ ] Monitor performance metrics

### Monthly Tasks
- [ ] Rotate API keys if needed
- [ ] Review and update RLS policies
- [ ] Archive old audit logs

## Troubleshooting

### Common Issues

#### Build Fails
- Check environment variables are set
- Run `npm run build` locally to reproduce
- Clear cache and redeploy

#### Auth Not Working
- Verify Supabase keys are correct
- Check RLS policies are enabled
- Ensure redirect URLs include your domain

#### Emails Not Sending
- Verify DNS records are configured
- Check email provider API key
- Ensure sender domain is verified

#### SGP Features Not Visible
- Check `NEXT_PUBLIC_FEATURE_SGP=on`
- Verify `ANTHROPIC_API_KEY` is set
- Hard refresh browser (Ctrl+Shift+R)

## Security Checklist

1. [ ] All API keys are in environment variables (not in code)
2. [ ] RLS policies are enabled on all Supabase tables
3. [ ] Email templates don't expose sensitive data
4. [ ] Audit logging is enabled (`ENABLE_GOVERNANCE=true`)
5. [ ] PII anonymization for exports (`ANONYMIZE_EXPORTS=true`)

## Support Contacts

- **Supabase Issues**: support@supabase.io
- **Netlify Issues**: Check status.netlify.com
- **Email Provider**:
  - Postmark: support@postmarkapp.com
  - Resend: support@resend.com
  - SendGrid: support@sendgrid.com

## Notes

- Keep this checklist updated with any deployment-specific changes
- Document any custom configurations or workarounds
- Save successful deployment settings for future reference