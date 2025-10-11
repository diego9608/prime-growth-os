# Environment Variables Setup Guide

## Quick Start

1. **Local Development**
   ```bash
   # Copy template to local env file
   cp .env.template .env.local

   # Fill in your values in .env.local
   ```

2. **Production (Netlify)**
   - Go to **Site Settings** → **Environment Variables**
   - Click **"Add a variable"** → **"Import from a .env file"**
   - Upload your `.env` file or copy from `.env.production.sample`
   - Click **Save**

## Important: Deploy Contexts

For better control, use **"Different value for each deploy context"**:

1. In Netlify, when adding variables, select **"Different value for each deploy context"**
2. Set different values for:
   - **Production**: Full features enabled
   - **Deploy previews**: Test features, different API keys
   - **Branch deploys**: Development settings

Example:
```
Production:       NEXT_PUBLIC_FEATURE_SGP=on
Deploy Preview:   NEXT_PUBLIC_FEATURE_SGP=off
```

## Environment Variables Explained

### Feature Flags (Public)
Variables starting with `NEXT_PUBLIC_` are exposed to the browser:
- `NEXT_PUBLIC_FEATURE_SGP`: Enable Strategic Growth Predictor
- `NEXT_PUBLIC_FEATURE_AUTH`: Enable authentication system

### Server-Side Only (Secret)
Never add `NEXT_PUBLIC_` prefix to these:
- `ANTHROPIC_API_KEY`: Your Claude API key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin access to Supabase
- `EMAIL_API_KEY`: Email service credentials

### Configuration
- `RESPONSE_CURVE_MODE`: `exponential` or `hill` (marketing optimization)
- `LLM_ROUTER_MODE`: `auto`, `force_llm`, or `force_rules`
- `AUDIT_RETENTION_DAYS`: How long to keep audit logs
- `ANONYMIZE_EXPORTS`: Remove PII from CSV/PDF exports

## Validation

The app validates environment variables at:
- **Build time**: Missing required vars will fail the build with clear messages
- **Runtime**: Uses defaults for optional vars

If validation fails, you'll see:
```
🚨 Environment Validation Failed:
❌ Missing required env var: ANTHROPIC_API_KEY (Anthropic API key for LLM features)
💡 Tip: Copy .env.template to .env.local and fill in the required values
```

## Email Provider Setup

### DNS Configuration Required
After setting up your email provider, configure these DNS records:

1. **SPF Record**
   ```
   TXT: v=spf1 include:spf.messagingengine.com ~all
   ```

2. **DKIM Record**
   ```
   TXT: [Will be provided by your email service]
   ```

3. **DMARC Record**
   ```
   TXT: v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com
   ```

### Provider-Specific Setup

#### Postmark (Recommended)
1. Sign up at https://postmarkapp.com
2. Create a server → Get API token
3. Verify your domain
4. Set: `EMAIL_PROVIDER=postmark` and `EMAIL_API_KEY=your-token`

#### Resend
1. Sign up at https://resend.com
2. Add domain → Verify DNS
3. Get API key
4. Set: `EMAIL_PROVIDER=resend` and `EMAIL_API_KEY=your-key`

## Troubleshooting

### Build Fails on Netlify
- Check Build settings → Environment variables are set
- Use "Clear cache and deploy" after adding new variables
- Check build logs for specific missing variables

### Feature Not Working
- Verify `NEXT_PUBLIC_FEATURE_*` flags are set to `on`
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors

### Emails Not Sending
- Verify DNS records are configured
- Check email provider dashboard for bounce reports
- Ensure `EMAIL_FROM` uses verified domain

## Security Best Practices

1. **Never commit `.env.local` to git** (it's in .gitignore)
2. **Use different API keys** for production vs development
3. **Rotate keys regularly** (quarterly recommended)
4. **Monitor usage** in provider dashboards
5. **Set up alerts** for unusual activity

## Support

For environment-specific issues:
- Development: Check console for validation messages
- Production: Check Netlify build logs
- Email: Check provider dashboard (Postmark/Resend)