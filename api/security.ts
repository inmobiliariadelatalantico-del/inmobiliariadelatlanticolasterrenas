// Cybersecurity Utilities for Serverless API Functions (2026 Standards)

// Secret key for HMAC signing (uses env variable or fallback secret for dev)
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.DATABASE_URL || 'hernandez-inmo-secure-salt-2026-key';

// Rate Limiting (In-memory sliding window for serverless / edge runtime)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Security Headers for API responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

// HTML Escaping to prevent XSS / HTML Injection
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;');
}

// String Sanitization (strips null bytes, controls, truncates)
export function sanitizeString(val: unknown, maxLength: number = 500): string {
  if (typeof val !== 'string') return '';
  // Remove control characters (except common whitespace) and null bytes
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLength);
}

// Strict Email validation
export function sanitizeEmail(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const email = val.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (email.length > 254 || !emailRegex.test(email)) {
    return null;
  }
  return email;
}

// Number sanitization with boundary checks
export function sanitizeNumber(val: unknown, min: number = 0, max: number = 1000000000, defaultVal: number = 0): number {
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return defaultVal;
  return Math.min(Math.max(num, min), max);
}

// Safe Image URL / Data URI validation
export function sanitizeImageUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Safe default assets
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed.slice(0, 500);
  }

  // Valid HTTPS URL
  if (/^https:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/i.test(trimmed)) {
    return trimmed.slice(0, 1000);
  }

  // Valid Base64 Image (limited size to prevent DoS)
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    if (trimmed.length > 5 * 1024 * 1024) {
      // 5MB limit
      return '';
    }
    return trimmed;
  }

  return '';
}

// Array of images sanitization
export function sanitizeImages(images: unknown, maxCount: number = 15): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .slice(0, maxCount)
    .map(img => sanitizeImageUrl(img))
    .filter(img => Boolean(img));
}

// Web Crypto HMAC Token Generation & Verification
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  let str = '';
  if (typeof buffer === 'string') {
    str = btoa(unescape(encodeURIComponent(buffer)));
  } else {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    str = btoa(binary);
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

export interface TokenPayload {
  username: string;
  role: 'admin' | 'editah' | 'franciscoh';
  exp: number; // timestamp ms
}

export async function createAuthToken(username: string, role: 'admin' | 'editah' | 'franciscoh', expiresInHours: number = 24): Promise<string> {
  const payload: TokenPayload = {
    username,
    role,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(signatureBuffer);
  return `${dataToSign}.${encodedSignature}`;
}

export async function verifyAuthToken(authHeader: string | null): Promise<TokenPayload | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getCryptoKey();

    // Convert signature from base64Url to bytes
    const base64 = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const binary = atob(padded);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp < Date.now()) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Safe error response formatting (never leak DB or system internals)
export function createSafeErrorResponse(status: number, publicMessage: string): Response {
  return new Response(JSON.stringify({ error: publicMessage }), {
    status,
    headers: getSecurityHeaders(),
  });
}
