# CBVP K141 Caazapá — Website

Sitio web del Cuerpo de Bomberos Voluntarios del Paraguay, Cuartel K141 Caazapá.

**Stack:** Cloudflare Pages (static) + Cloudflare Workers (auth/API) + Cloudflare KV (storage)
**Costo:** $0/mes

---

## Estructura del Proyecto

```
bomberos/
├── index.html           # Landing page principal
├── noticias.html        # Página de noticias
├── css/
│   └── styles.css       # Estilos (mobile-first)
├── js/
│   └── main.js          # JavaScript (módulos vanilla)
├── data/
│   ├── config.json      # Configuración del sitio
│   └── news.json        # Noticias (JSON, para desarrollo)
├── admin/
│   ├── index.html       # Panel de administración
│   ├── styles.css       # Estilos del admin
│   └── noticias.html    # Página de noticias (admin link)
├── workers/
│   └── admin-auth/
│       ├── index.js     # Cloudflare Worker (auth + API)
│       └── wrangler.toml
├── _headers             # Headers de Cloudflare Pages
├── _redirects           # Redirecciones (si se necesitan)
└── package.json
```

---

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.dev.vars` en la raíz del proyecto:

```bash
# .dev.vars (NO commitear este archivo!)
ADMIN_PASSWORD=bomberos2025
```

### 2. Configurar el Worker de Auth

El admin usa Cloudflare Workers + KV. Necesitás:

1. Crear una cuenta en [Cloudflare](https://dash.cloudflare.com)
2. Instalar Wrangler CLI: `npm install -g wrangler`
3. Login a Cloudflare: `wrangler login`

#### Crear el namespace de KV:

```bash
cd workers/admin-auth
wrangler kv:namespace create "CBVP_KV"
# Te va a dar un ID, copialo al wrangler.toml
```

Editá `workers/admin-auth/wrangler.toml` y reemplazá `YOUR_KV_NAMESPACE_ID`:

```toml
kv_namespaces = [
  { binding = "CBVP_KV", id = "AQUI_TU_ID_DEL_KV" }
]
```

#### Deploy del Worker:

```bash
cd workers/admin-auth
wrangler deploy
# Te da una URL como: https://cbvp-admin-auth.YOUR_SUBDOMAIN.workers.dev
```

### 3. Configurar Cloudflare Pages

1. Andá a [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Create a project → Connect to Git
3. Configurá:
   - **Project name:** `cbvp-k141-caazapa`
   - **Build command:** (vacío — es estático)
   - **Build output directory:** `/`
   - **Environment variables:**
     - `WORKER_URL` = URL del worker deployado (ej: `https://cbvp-admin-auth.workers.dev`)

4. **Custom Domain:** Configurá tu dominio (ej: `admin.bomberosk141.com.py`)

### 4. Configurar Proxy del Admin al Worker

El admin panel (`/admin/index.html`) hace requests a `/api/*`. Necesitás que Cloudflare Pages redirija esas requests al Worker.

**Opción A — Worker como standalone (recomendado):**
En Cloudflare Pages, configurá un **Custom Domain** para el worker y actualizá `API_BASE` en el admin:

```javascript
// En admin/index.html, buscá:
const API_BASE = '/api';
// Cambiar por:
const API_BASE = 'https://cbvp-admin-auth.workers.dev';
```

**Opción B — Pages Functions:**
En el root del proyecto (`functions/api/[...path].js`), creá un proxy:

```javascript
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  // Redirigir /api/* al worker
  return fetch(`https://TU_WORKER.workers.dev${url.pathname}`, request);
}
```

### 5. Primera Configuración del Admin

1. Accedé a `/admin/index.html`
2. La primera vez, el password por defecto es: **`bomberos2025`**
3. **IMPORTANTE:** Después del primer login, desde el panel podés cambiarlo (próximamente).

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Servir localmente (solo archivos estáticos)
npx serve .

# O usar Cloudflare Pages local:
npx wrangler pages dev ./

# Deploy del worker
cd workers/admin-auth
wrangler dev --local
```

---

## Endpoints del Worker (Auth)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Login con password | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/status` | Check auth status | No |
| GET | `/api/news` | Listar noticias | No |
| POST | `/api/news` | Crear/actualizar noticia | Sí |
| DELETE | `/api/news/:id` | Eliminar noticia | Sí |
| GET | `/api/config` | Obtener config | No |
| PUT | `/api/config` | Guardar config | Sí |

---

## Deployment

### Landing Page (Cloudflare Pages)

```bash
# Connect GitHub repo to Cloudflare Pages
# Deploys automatically on push to main
```

### Worker (Cloudflare Workers)

```bash
cd workers/admin-auth
wrangler deploy
```

### Resetear Password del Admin

Si perdiste el password, ejecutá en la consola de Cloudflare:

```javascript
// En el dashboard de Cloudflare Workers → Tu Worker → "Execute Worker"
// o usando wrangler:
wrangler kv:key delete admin:user --namespace-id=TU_KV_ID
// Luego accedé al admin de nuevo — se creará con el password por defecto
```

---

## Cómo Agregar Noticias desde el Admin

1. Ir a `/admin/` → click en **Noticias**
2. Click en **Nueva Noticia**
3. Completar:
   - **Título** (requerido)
   - **Fecha** (YYYY-MM-DD)
   - **Extracto** (breve descripción para la tarjeta)
   - **Contenido completo** (opcional)
   - **URL de imagen** (opcional)
   - **Publicada** (toggle — solo las publicadas aparecen en el sitio)
4. Click **Vista Previa** para ver cómo quedó
5. Click **Guardar Noticia**

---

## Cómo Actualizar Configuración

1. Ir a `/admin/` → **Configuración**
   - Datos del cuartel, teléfonos, emails, redes sociales
2. Ir a `/admin/` → **Donaciones**
   - Datos bancarios para donaciones

Los cambios se guardan en Cloudflare KV y se reflejan inmediatamente en el sitio.

---

## Notas Técnicas

### Almacenamiento
- **KV (Cloudflare):** $0/mes (free tier: 1,000 writes/day, 10MB storage)
- **Pages:** $0/mes (ilimitadas requests)
- **Worker:** $0/mes (free tier: 100,000 requests/day)

### Rate Limits
- KV free tier: 1,000 writes/day, 100,000 reads/day
- Worker free tier: 100,000 requests/day

### Importante
- No guardes el `wrangler.toml` con secrets en Git (ya está en `.gitignore`)
- Mantené el password de admin seguro
- Para producción, usá un dominio propio

---

## Comandos Útiles

```bash
# Ver logs del worker
wrangler tail

# Revisar el namespace de KV
wrangler kv:key list --namespace-id=TU_ID

# Eliminar todas las noticias (para reset)
wrangler kv:key delete --namespace-id=TU_ID --prefix=news

# Deploy con environment específico
wrangler deploy --env production
```

---

## Estructura de Datos

### config.json

```json
{
  "cuartel": {
    "nombreCompleto": "...",
    "ciudad": "Caazapá",
    "direccion": "..."
  },
  "contacto": {
    "telefonoEmergencias": "132",
    "telefonoCentral": "+595 542 232 132",
    "emailInstitucional": "..."
  },
  "donaciones": {
    "banco": "...",
    "numeroCuenta": "...",
    "nombreTitular": "..."
  },
  "redesSociales": {
    "facebook": "...",
    "instagram": "..."
  }
}
```

### news.json

```json
[{
  "id": "2026-04-10-equipo-respiratorio",
  "title": "...",
  "date": "2026-04-10",
  "excerpt": "...",
  "content": "...",
  "image": "",
  "author": "Cmdte. ...",
  "published": true
}]
```

---

## Troubleshooting

**"KV not available" error:**
- Verificá que el `kv_namespaces` binding en `wrangler.toml` coincida con el nombre del binding en el Worker
- Ejecutá `wrangler kv:namespace list` para ver los namespaces disponibles

**Admin no puede cargar noticias:**
- Verificá que el `API_BASE` en `admin/index.html` apunte a la URL correcta del worker
- Verificá CORS headers en el worker

**Cambios no se reflejan:**
- KV puede tener cache de hasta 60 segundos
- Hacé hard refresh del navegador (Ctrl+Shift+R)

---

*Desarrollado para el Cuerpo de Bomberos Voluntarios del Paraguay K141 Caazapá*
