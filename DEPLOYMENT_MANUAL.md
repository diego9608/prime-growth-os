# Manual Impenetrable de Deployment para Monorepo Next.js en Netlify

## Lecciones Aprendidas del Proyecto Prime Growth OS

### 1. Problemas Comunes y Soluciones

#### ❌ **Problema #1: npm ci sin package-lock.json**
- **Error**: `npm ci can only install packages when your package-lock.json and package.json are in sync`
- **Solución**: Usar `npm install` en lugar de `npm ci`
- **Prevención**: Siempre commitear package-lock.json

#### ❌ **Problema #2: Módulos no encontrados en monorepo**
- **Error**: `Module not found: Can't resolve '@prime-growth-os/analytics'`
- **Solución**: Construir desde la raíz del monorepo
- **Comando correcto**: `cd ../.. && npm install && cd apps/[app] && npm run build`

#### ❌ **Problema #3: Tailwind CSS purgando todos los estilos**
- **Error**: Sitio sin estilos en producción
- **Causa**: Rutas incorrectas en content de tailwind.config.ts
- **Solución**: Usar rutas relativas desde la app:
```typescript
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  '../../packages/engine/**/*.{js,ts,jsx,tsx,mdx}',
  // NO usar: '../../packages/**/*' (incluye node_modules)
]
```

#### ❌ **Problema #4: Next.js plugin no encuentra node_modules**
- **Error**: `ENOENT: no such file or directory, scandir '/opt/build/repo/apps/[app]/node_modules'`
- **Causa**: En monorepos, node_modules puede estar solo en la raíz
- **Solución**: Forzar creación de node_modules local:
```toml
command = "cd ../.. && npm install && npm -w apps/[app] install && cd apps/[app] && mkdir -p node_modules && npm run build"
```

#### ❌ **Problema #5: useAnalytics error durante SSG**
- **Error**: `useAnalytics must be used within an AnalyticsProvider`
- **Solución**: Retornar no-ops en lugar de throw:
```typescript
export function useAnalytics(): Ctx {
  const ctx = useContext(AnalyticsContext)
  return ctx ?? noop  // No throw, solo no-ops
}
```

#### ❌ **Problema #6: Viewport metadata warning**
- **Warning**: `Unsupported metadata viewport is configured in metadata export`
- **Solución**: Exportar viewport por separado en Next.js 14+:
```typescript
export const metadata: Metadata = {
  title: 'Title',
  description: 'Description',
  // NO incluir viewport aquí
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
```

#### ❌ **Problema #7: ESLint versión deprecated/unsupported**
- **Warning**: `eslint@8.55.0: This version is no longer supported`
- **Error común**: Crear proyectos con versiones desactualizadas por defecto
- **Causa**: Next.js y create-next-app a veces instalan versiones viejas de ESLint
- **Solución**: Actualizar a versiones soportadas:
```json
{
  "devDependencies": {
    "eslint": "^8.57.0",  // NO usar 8.55.0 o anteriores
    "eslint-config-next": "14.2.18"  // Debe coincidir con versión de Next.js
  }
}
```
- **Prevención**: SIEMPRE verificar después de crear un proyecto:
```bash
npm ls eslint  # Verificar versión instalada
npm update eslint eslint-config-next  # Actualizar si es necesario
```

### 2. Configuración Correcta de netlify.toml

#### Para Apps con Static Export (marketing sites):
```toml
[build]
  base = "apps/web"
  command = "cd ../.. && npm install && cd apps/web && npm run build"
  publish = "out"  # Static export

[build.environment]
  NODE_VERSION = "18.17.0"

# NO incluir @netlify/plugin-nextjs para static sites
```

#### Para Apps con SSR (dashboards, apps dinámicas):
```toml
[build]
  base = "apps/atelier"
  command = "cd ../.. && npm install && npm -w apps/atelier install && cd apps/atelier && mkdir -p node_modules && npm run build"
  publish = ".next"  # SSR

[build.environment]
  NODE_VERSION = "18.17.0"

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Necesario para SSR
```

### 3. Configuración de next.config.mjs

#### Para Static Export:
```javascript
const nextConfig = {
  output: 'export',  // Crítico para static sites
  trailingSlash: false,
  images: {
    unoptimized: true,  // Necesario para static export
  },
}
```

#### Para SSR:
```javascript
const nextConfig = {
  // NO incluir output: 'export'
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}
```

### 4. Estructura de Monorepo

#### Package.json raíz:
```json
{
  "name": "monorepo-name",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:app1": "cd apps/app1 && npm run dev",
    "build:app1": "cd apps/app1 && npm run build"
  }
}
```

#### Package.json de app:
```json
{
  "name": "app-name",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "next": "14.2.18",  // Versión actualizada
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@netlify/plugin-nextjs": "^5.0.0",  // Solo si es SSR
    "eslint": "^8.57.0",  // CRÍTICO: NO usar 8.55.0 (deprecated)
    "eslint-config-next": "14.2.18"  // DEBE coincidir con Next.js
  }
}
```

⚠️ **ADVERTENCIA CRÍTICA sobre ESLint:**
- `create-next-app` frecuentemente instala ESLint 8.55.0 que está DEPRECATED
- Netlify mostrará warnings pero NO fallará el build
- SIEMPRE actualizar inmediatamente después de crear el proyecto

### 5. Configuración de Git y Formato de Commits

#### Configuración inicial de Git:
```bash
# Configurar usuario para commits (usar tu username de GitHub)
git config --global user.name "diego9608"
git config --global user.email "tu-email@ejemplo.com"

# Inicializar repositorio y conectar con GitHub
git init
git remote add origin https://github.com/diego9608/[nombre-repo].git
```

#### Formato de Commits (OBLIGATORIO):

**NUNCA usar:**
- ❌ Co-authored-by: Claude
- ❌ 🤖 Generated with Claude Code
- ❌ Referencias a AI o asistentes

**SIEMPRE usar este formato:**

Para features nuevas:
```bash
git commit -m "feat: implement responsive onboarding progress bar" -m "
- What: Created animated progress bar component with step indicators and percentage display
- Why: Users need visual feedback of their progress through the 3-step onboarding flow to reduce abandonment
- How: Used Framer Motion for smooth width animations, CSS gradients for visual appeal, and responsive design for mobile compatibility
"
```

Para fixes:
```bash
git commit -m "fix: resolve Tailwind CSS purging issue in production" -m "
- What: Fixed missing styles in production build due to incorrect content paths
- Why: Site appeared unstyled after deployment causing poor user experience
- How: Updated tailwind.config.ts with correct relative paths for monorepo structure
"
```

Para refactoring:
```bash
git commit -m "refactor: optimize analytics provider for SSG compatibility" -m "
- What: Modified useAnalytics hook to return no-ops during static generation
- Why: Prevented build failures while maintaining full client-side functionality
- How: Added null check with fallback to no-op functions instead of throwing errors
"
```

#### Tipos de commit permitidos:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización de código
- `perf:` Mejoras de performance
- `style:` Cambios de formato/estilo (no CSS)
- `docs:` Documentación
- `test:` Añadir o corregir tests
- `chore:` Mantenimiento, dependencias, etc.
- `build:` Cambios en build/deployment

#### Estructura del mensaje detallado:
```
- What: [Qué se hizo específicamente]
- Why: [Por qué era necesario/valor de negocio]
- How: [Detalles técnicos de implementación]
```

### 6. Checklist de Deployment

#### Pre-deployment:
- [ ] ¿package-lock.json está commiteado?
- [ ] ¿Las rutas de Tailwind content son específicas (no genéricas)?
- [ ] ¿El next.config.mjs tiene la configuración correcta (export vs SSR)?
- [ ] ¿Los providers de Context manejan SSG correctamente?
- [ ] ¿Viewport está exportado por separado?
- [ ] ¿Las versiones de dependencias son compatibles?

#### Netlify Setup:
- [ ] ¿El base path es correcto? (`apps/[nombre]`)
- [ ] ¿El build command incluye instalación desde raíz?
- [ ] ¿El publish path es correcto? (`out` para static, `.next` para SSR)
- [ ] ¿NODE_VERSION está especificado? (18.17.0 o superior)
- [ ] ¿El plugin de Next.js está configurado solo para SSR?

#### Post-deployment:
- [ ] Si falla, usar "Clear cache and deploy"
- [ ] Verificar en logs: "Using Next.js Runtime"
- [ ] Verificar que no haya warnings de Tailwind sobre node_modules
- [ ] Verificar que las rutas funcionen correctamente

### 7. Comandos de Build Probados

#### Monorepo con workspace (RECOMENDADO):
```bash
cd ../.. && npm install && npm -w apps/[app] install && cd apps/[app] && mkdir -p node_modules && npm run build
```

#### Monorepo simple:
```bash
cd ../.. && npm install && cd apps/[app] && npm run build
```

### 8. Debugging Tips

1. **Ver logs completos**: Los logs de Netlify se truncan en la UI, usar el link de "View complete log"
2. **Cache issues**: Siempre intentar "Clear cache and deploy" primero
3. **Verificar build local**: `npm run build` debe funcionar localmente antes de deployar
4. **Revisar package.json scripts**: Asegurar que `build` esté definido correctamente

### 9. Performance Tips

1. **Tailwind**: Ser específico en content paths para evitar escanear node_modules
2. **Next.js Cache**: Se guarda automáticamente entre builds en Netlify
3. **Dependencies**: Usar versiones exactas en producción para evitar sorpresas

### 10. Errores que NO debes cometer

1. ❌ NO uses `../../packages/**/*` en Tailwind (incluye node_modules)
2. ❌ NO olvides commitear package-lock.json
3. ❌ NO mezcles configuraciones de static export con SSR
4. ❌ NO uses npm ci sin package-lock.json
5. ❌ NO asumas que node_modules existe en apps de monorepo
6. ❌ NO uses viewport en metadata, expórtalo por separado
7. ❌ NO uses versiones incompatibles de eslint-config-next con Next.js
8. ❌ NO uses ESLint 8.55.0 o anteriores (están deprecated)

### 11. Template de Resolución de Problemas

Cuando algo falla:
1. Leer el error específico en los logs
2. Verificar si es un problema conocido (ver arriba)
3. Intentar "Clear cache and deploy"
4. Verificar que funcione localmente
5. Revisar las rutas relativas en tailwind.config.ts
6. Verificar las versiones de dependencias
7. Asegurar que el build command sea correcto para monorepo

---

## Resumen Ejecutivo

**Para deployar exitosamente un monorepo Next.js en Netlify:**

1. **Siempre** construye desde la raíz del monorepo
2. **Siempre** especifica rutas exactas en Tailwind
3. **Siempre** maneja SSG en Context providers
4. **Nunca** asumas que node_modules existe en subdirectorios
5. **Nunca** uses patrones genéricos que incluyan node_modules

Con estas lecciones, el deployment debería ser exitoso en el primer intento.