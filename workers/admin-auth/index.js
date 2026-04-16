/**
 * CBVP K141 Admin Auth Worker
 * Cloudflare Worker for authentication and API endpoints
 * Uses Cloudflare KV for storage (free tier: 1,000 writes/day, 10MB)
 */

const SESSION_COOKIE = 'cbvp_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// In-memory cache for bcrypt (worker lives across requests)
let bcryptCache = null;
async function getBcrypt() {
  if (!bcryptCache) {
    const mod = await import('bcryptjs');
    bcryptCache = mod.default || mod;
  }
  return bcryptCache;
}

// Simple token generator
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// KV binding — set in wrangler.toml
// For Pages Functions, we use env.KV from the binding
async function getKV(env) {
  return env.KV || env.CBVP_KV;
}

// ==========================================
// Password hashing helpers
// ==========================================
async function hashPassword(password) {
  const bcrypt = await getBcrypt();
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

async function verifyPassword(password, hash) {
  const bcrypt = await getBcrypt();
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

// ==========================================
// Session Management
// ==========================================
async function createSession(token, env) {
  const kv = await getKV(env);
  if (!kv) return false;
  await kv.put(`session:${token}`, JSON.stringify({
    created: Date.now(),
    expires: Date.now() + SESSION_MAX_AGE
  }), { expirationTtl: 7 * 24 * 60 * 60 });
  return true;
}

async function getSession(token, env) {
  const kv = await getKV(env);
  if (!kv) return null;
  const data = await kv.get(`session:${token}`, 'json');
  if (!data) return null;
  if (Date.now() > data.expires) {
    await kv.delete(`session:${token}`);
    return null;
  }
  return data;
}

async function deleteSession(token, env) {
  const kv = await getKV(env);
  if (!kv) return;
  await kv.delete(`session:${token}`);
}

async function getAdminUser(env) {
  const kv = await getKV(env);
  if (!kv) return null;
  const user = await kv.get('admin:user', 'json');
  return user;
}

async function setAdminUser(user, env) {
  const kv = await getKV(env);
  if (!kv) return;
  await kv.put('admin:user', JSON.stringify(user));
}

// ==========================================
// News CRUD (KV storage)
// ==========================================
async function getAllNews(env) {
  const kv = await getKV(env);
  if (!kv) return [];
  const keys = await kv.list({ prefix: 'news:' });
  const news = await Promise.all(
    keys.keys.map(k => kv.get(k.name, 'json'))
  );
  return news.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function getNewsItem(id, env) {
  const kv = await getKV(env);
  if (!kv) return null;
  return await kv.get(`news:${id}`, 'json');
}

async function saveNewsItem(item, env) {
  const kv = await getKV(env);
  if (!kv) throw new Error('KV not available');
  await kv.put(`news:${item.id || item.date}`, JSON.stringify(item));
  return item;
}

async function deleteNewsItem(id, env) {
  const kv = await getKV(env);
  if (!kv) return;
  await kv.delete(`news:${id}`);
}

// ==========================================
// Config (KV storage)
// ==========================================
async function getConfig(env) {
  const kv = await getKV(env);
  if (!kv) return null;
  const data = await kv.get('site:config', 'json');
  return data;
}

async function saveConfig(config, env) {
  const kv = await getKV(env);
  if (!kv) throw new Error('KV not available');
  await kv.put('site:config', JSON.stringify(config));
  return config;
}

// ==========================================
// Auth Middleware
// ==========================================
async function authenticateRequest(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const session = await getSession(token, env);
  return session ? token : null;
}

// ==========================================
// CORS Helper
// ==========================================
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// ==========================================
// Request Handler
// ==========================================
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Set up KV from context if available (Pages Functions)
  const kv = env.KV || ctx?.KV || null;

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders() });
  }

  // ==========================================
  // Auth Routes
  // ==========================================
  if (path === '/api/auth/login' && request.method === 'POST') {
    try {
      const { password } = await request.json();
      if (!password) {
        return errorResponse('Password required', 400);
      }

      // Get stored admin user or create default
      let adminUser = await kv?.get('admin:user', 'json');
      if (!adminUser) {
        // First time setup — hash the default password
        const defaultPassword = 'bomberos2025';
        const hash = await hashPassword(defaultPassword);
        adminUser = { username: 'admin', passwordHash: hash };
        await kv?.put('admin:user', JSON.stringify(adminUser));
      }

      const valid = await verifyPassword(password, adminUser.passwordHash);
      if (!valid) {
        return errorResponse('Invalid password', 401);
      }

      const token = generateToken();
      await createSession(token, env);

      const response = jsonResponse({ success: true, token });
      response.headers.set('Set-Cookie',
        `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE / 1000}`
      );
      return response;
    } catch (err) {
      console.error('Login error:', err);
      return errorResponse('Server error', 500);
    }
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const token = await authenticateRequest(request, env);
    if (token) await deleteSession(token, env);
    const response = jsonResponse({ success: true });
    response.headers.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
    return response;
  }

  if (path === '/api/auth/status' && request.method === 'GET') {
    const token = await authenticateRequest(request, env);
    return jsonResponse({ authenticated: !!token });
  }

  // ==========================================
  // News Routes
  // ==========================================
  if (path === '/api/news' && request.method === 'GET') {
    try {
      const news = await getAllNews(env);
      return jsonResponse(news);
    } catch (err) {
      console.error('Get news error:', err);
      return errorResponse('Failed to load news', 500);
    }
  }

  if (path === '/api/news' && request.method === 'POST') {
    const token = await authenticateRequest(request, env);
    if (!token) return errorResponse('Unauthorized', 401);

    try {
      const item = await request.json();
      if (!item.title || !item.date || !item.excerpt) {
        return errorResponse('Missing required fields', 400);
      }
      // Generate ID if not provided
      if (!item.id) {
        item.id = `${item.date}-${item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30)}`;
      }
      await saveNewsItem(item, env);
      return jsonResponse(item, 201);
    } catch (err) {
      console.error('Save news error:', err);
      return errorResponse('Failed to save news', 500);
    }
  }

  // /api/news/:id DELETE
  const newsDeleteMatch = path.match(/^\/api\/news\/(.+)$/);
  if (newsDeleteMatch && request.method === 'DELETE') {
    const token = await authenticateRequest(request, env);
    if (!token) return errorResponse('Unauthorized', 401);

    try {
      await deleteNewsItem(newsDeleteMatch[1], env);
      return jsonResponse({ success: true });
    } catch (err) {
      return errorResponse('Failed to delete', 500);
    }
  }

  // ==========================================
  // Config Routes
  // ==========================================
  if (path === '/api/config' && request.method === 'GET') {
    try {
      let config = await getConfig(env);
      if (!config && kv) {
        // Try to fetch from original file as fallback
        const original = await fetch(new URL('/data/config.json', request.url).toString()).catch(() => null);
        if (original?.ok) {
          config = await original.json();
          await saveConfig(config, env);
        }
      }
      return jsonResponse(config || {});
    } catch (err) {
      console.error('Get config error:', err);
      return errorResponse('Failed to load config', 500);
    }
  }

  if (path === '/api/config' && request.method === 'PUT') {
    const token = await authenticateRequest(request, env);
    if (!token) return errorResponse('Unauthorized', 401);

    try {
      const config = await request.json();
      await saveConfig(config, env);
      return jsonResponse({ success: true });
    } catch (err) {
      console.error('Save config error:', err);
      return errorResponse('Failed to save config', 500);
    }
  }

  // Fallback — not found
  return errorResponse('Not found', 404);
}

// ==========================================
// Worker Entry Point
// ==========================================
export default {
  async fetch(request, env, ctx) {
    try {
      // For Pages Functions compatibility
      if (typeof handleRequest === 'function') {
        return await handleRequest(request, env, ctx);
      }
      return handleRequest(request, env, ctx);
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
