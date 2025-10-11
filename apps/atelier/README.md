# Atelier - Dashboard para Estudios de Arquitectura

Sistema integral de gestión para estudios de arquitectura con capacidades de IA.

## 🚀 Características Principales

### Módulos Implementados
- **Dashboard**: Vista general de métricas y KPIs
- **Strategy (SGP)**: Strategic Growth Predictor con optimización de presupuesto
- **Leads**: Gestión de prospectos y oportunidades
- **CPQ**: Configure, Price, Quote para cotizaciones
- **Stage Gate**: Control de etapas de proyectos
- **Proveedores**: Gestión de proveedores
- **Finanzas**: Control financiero
- **Casos de Estudio**: Portfolio de proyectos

### Características de IA (SGP)
- Detección de cuellos de botella con análisis Pareto
- Optimización de presupuesto con guardrails
- Generación de executive briefs (BLUF + SCQA)
- Tracking de experimentos con batting average
- Router inteligente de LLM (Opus para >$100K, Sonnet para eficiencia)

### Sistema de Autenticación
- Multi-tenant con organizaciones aisladas
- RBAC con 4 roles: Owner, Admin, Editor, Viewer
- Row Level Security (RLS) en Supabase
- Invitación por email con tokens seguros

## 📋 Instalación Local

### 1. Clonar y preparar
```bash
git clone [repository]
cd prime-growth-os/apps/atelier
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.template .env.local
# Editar .env.local con tus valores
```

### 3. Configurar Supabase
1. Crear proyecto en supabase.com
2. Ejecutar SQL de `SUPABASE_SETUP.md`
3. Agregar credenciales a `.env.local`

### 4. Ejecutar localmente
```bash
npm run dev
# Abrir http://localhost:3000
```

## 🚢 Deployment en Netlify

### Configuración Rápida
1. **Importar proyecto** en Netlify desde GitHub
2. **Variables de entorno**: Site Settings → Environment Variables → Import .env file
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Deploy**

### Verificación Post-Deploy
- [ ] Feature flags activos (`NEXT_PUBLIC_FEATURE_*=on`)
- [ ] Auth funciona (sign in/up)
- [ ] Emails se envían
- [ ] SGP responde

Ver `DEPLOYMENT_CHECKLIST.md` para lista completa.

## 🔧 Configuración de Features

### Feature Flags
```env
NEXT_PUBLIC_FEATURE_SGP=on      # Strategic Growth Predictor
NEXT_PUBLIC_FEATURE_AUTH=on     # Authentication system
```

### Proveedores de Email
Soporta Postmark, Resend, y SendGrid:
```env
EMAIL_PROVIDER=postmark
EMAIL_API_KEY=your-api-key
EMAIL_FROM=no-reply@yourdomain.com
```

### LLM Configuration
```env
LLM_ROUTER_MODE=auto            # auto | force_llm | force_rules
ANTHROPIC_API_KEY=sk-ant-xxx    # Para features de IA
```

## 📁 Estructura del Proyecto

```
apps/atelier/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── predictor/       # SGP endpoints
│   │   └── email/           # Email endpoints
│   ├── auth/                # Auth pages
│   ├── strategy/            # SGP UI
│   └── settings/            # Settings & members
├── lib/                     # Utilities
│   ├── supabase/           # Supabase clients
│   ├── email/              # Email provider & templates
│   └── env-validator.ts    # Env validation
├── .env.template           # Template de variables
└── DEPLOYMENT_CHECKLIST.md # Checklist de deploy
```

## 🔐 Seguridad

- Variables de entorno para todos los secrets
- RLS habilitado en todas las tablas
- RBAC para control de acceso
- Tokens seguros para invitaciones
- Validación de env en build time

## 🐛 Troubleshooting

### Build falla
```bash
# Verificar env vars
npm run build

# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

### Auth no funciona
- Verificar `NEXT_PUBLIC_SUPABASE_*` keys
- Revisar RLS policies en Supabase
- Check redirect URLs incluyen tu dominio

### SGP no visible
- Verificar `NEXT_PUBLIC_FEATURE_SGP=on`
- Check `ANTHROPIC_API_KEY` está configurado
- Hard refresh (Ctrl+Shift+R)

## 📚 Documentación Adicional

- `ENV_SETUP.md` - Guía completa de variables de entorno
- `SUPABASE_SETUP.md` - Schema y configuración de base de datos
- `DEPLOYMENT_CHECKLIST.md` - Lista de verificación para producción

## 🤝 Soporte

Para issues o preguntas:
1. Revisar documentación en `/docs`
2. Buscar en issues existentes
3. Crear nuevo issue con detalles

## 📄 Licencia

Propietario - Cuarzo Architecture Studio