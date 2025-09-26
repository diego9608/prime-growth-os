# Prime Growth OS

Sistema operativo de crecimiento para empresas ambiciosas. Monorepo con sitio público y pitch privado.

## Estructura del Proyecto

```
prime-growth-os/
├── apps/
│   ├── web/          # Sitio público (static export)
│   └── cuarzo/       # Pitch privado para Cuarzo (SSR)
├── packages/
│   ├── ui/           # Componentes UI compartidos
│   ├── analytics/    # Provider de GA4
│   ├── content/      # Contenido y copys
│   └── pitchkit/     # Herramientas para pitches
```

## Configuración Local

### Prerequisitos
- Node.js 18.17.0 o superior
- npm 9.x o superior

### Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev:web      # Sitio web en http://localhost:3000
npm run dev:cuarzo   # Pitch en http://localhost:3001

# Build para producción
npm run build:web    # Build del sitio público
npm run build:cuarzo # Build del pitch
```

## Variables de Entorno

Crear archivo `.env.local` en cada app:

```env
# apps/web/.env.local y apps/cuarzo/.env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_LINK=https://wa.me/5215512345678
NEXT_PUBLIC_BOOKING_URL=https://calendly.com/prime-growth
```

## Despliegue en Netlify

### Sitio Web (apps/web)
1. Crear nuevo sitio en Netlify
2. Configuración:
   - Base directory: `apps/web`
   - Build command: `npm ci && npm run build`
   - Publish directory: `apps/web/out`
3. Agregar variables de entorno

### Pitch Cuarzo (apps/cuarzo)
1. Crear nuevo sitio en Netlify
2. Configuración:
   - Base directory: `apps/cuarzo`
   - Build command: `npm ci && npm run build`
   - Publish directory: `apps/cuarzo/.next`
3. Instalar plugin: `@netlify/plugin-nextjs`
4. Activar "Password protection" en Site settings
5. Agregar variables de entorno

## Características

### Sitio Web
- Landing page con hero y CTAs
- Página de ofertas (IGNITION, PRIME, PRIME+, ATLAS)
- Casos de éxito y testimonios
- Playbooks por industria
- Tracking con GA4
- Export estático optimizado

### Pitch Cuarzo
- Presentación personalizada para arquitectura
- Modo TV (pantalla completa)
- Exportación a PDF
- Métricas y proyecciones
- Modelos de inversión
- Controles de presentación

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui
- Google Analytics 4
- Netlify

## Scripts Útiles

```bash
# Limpiar proyecto
npm run clean

# Formatear código
npm run format

# Lint
npm run lint
```

## Soporte
Para soporte y consultas: hola@primegrowth.os