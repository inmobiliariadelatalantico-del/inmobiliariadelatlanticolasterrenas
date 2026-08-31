import { sql } from './db-client.js';
import {
  checkRateLimit,
  getSecurityHeaders,
  sanitizeString,
  createAuthToken,
  createSafeErrorResponse
} from './security.js';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return createSafeErrorResponse(405, 'Método no permitido.');
  }

  // Get client IP or fallback identifier for rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous-client';

  // Max 10 attempts per minute per IP to prevent brute-force attacks
  if (!checkRateLimit(`login-${clientIp}`, 10, 60000)) {
    return createSafeErrorResponse(429, 'Demasiados intentos fallidos. Por favor espere 1 minuto antes de reintentar.');
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const username = sanitizeString(rawBody.username, 50);
    const password = typeof rawBody.password === 'string' ? rawBody.password.slice(0, 100) : '';

    if (!username || !password) {
      return createSafeErrorResponse(400, 'Usuario y contraseña son requeridos.');
    }

    // Check credentials securely using parameterized query
    const results = await sql`
      SELECT id, username, password FROM admins 
      WHERE LOWER(username) = LOWER(${username}) AND password = ${password}
      LIMIT 1
    `;

    if (results && results.length > 0) {
      const user = results[0];
      const normalizedUser = (user.username || '').toLowerCase().trim();

      let role: 'admin' | 'editah' | 'franciscoh' = 'admin';
      if (normalizedUser === 'editah') role = 'editah';
      else if (normalizedUser === 'franciscoh') role = 'franciscoh';

      // Generate signed cryptographic token (valid for 24h)
      const token = await createAuthToken(user.username, role, 24);

      return new Response(JSON.stringify({
        success: true,
        username: user.username,
        role,
        token
      }), {
        status: 200,
        headers: getSecurityHeaders(),
      });
    } else {
      return createSafeErrorResponse(401, 'Credenciales inválidas.');
    }
  } catch (error) {
    console.error('Error in login handler:', error);
    return createSafeErrorResponse(500, 'Error al procesar la solicitud de autenticación.');
  }
};
