import { sql } from './db-client.js';
import {
  verifyAuthToken,
  getSecurityHeaders,
  sanitizeString,
  sanitizeNumber,
  sanitizeImages,
  createSafeErrorResponse
} from './security.js';

const ALLOWED_CATEGORIES = ['casa', 'apartamento', 'terreno'] as const;
const ALLOWED_TYPES = ['venta', 'alquiler'] as const;
const ALLOWED_CURRENCIES = ['USD', 'DOP', 'EUR'] as const;

export const config = {
  runtime: 'edge',
};

export default async (request: Request) => {
  const method = request.method;

  try {
    // Public GET request to list properties
    if (method === 'GET') {
      const properties = await sql`
        SELECT * FROM properties 
        ORDER BY id DESC
      `;

      const formatted = properties.map(p => ({
        ...p,
        price: Number(p.price) || 0,
        bedrooms: Number(p.bedrooms) || 0,
        bathrooms: Number(p.bathrooms) || 0,
        area: Number(p.area) || 0,
        featured: Boolean(p.featured),
        images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : [])
      }));

      return new Response(JSON.stringify(formatted), {
        status: 200,
        headers: getSecurityHeaders(),
      });
    }

    // Require authorization for mutating operations (POST, PUT, DELETE)
    const authHeader = request.headers.get('Authorization');
    const authPayload = await verifyAuthToken(authHeader);

    if (!authPayload) {
      return createSafeErrorResponse(401, 'No autorizado: Token de sesión inválido o expirado.');
    }

    // Check Role Permission (only franciscoh or admin can manage properties)
    if (authPayload.role !== 'franciscoh' && authPayload.role !== 'admin') {
      return createSafeErrorResponse(403, 'Acceso denegado: No cuenta con permisos para modificar inmuebles.');
    }

    if (method === 'POST') {
      const rawBody = await request.json().catch(() => ({}));

      const title = sanitizeString(rawBody.title, 150);
      const description = sanitizeString(rawBody.description, 4000);
      const location = sanitizeString(rawBody.location, 200);
      const price = sanitizeNumber(rawBody.price, 0, 1000000000);
      const bedrooms = sanitizeNumber(rawBody.bedrooms, 0, 100);
      const bathrooms = sanitizeNumber(rawBody.bathrooms, 0, 100);
      const area = sanitizeNumber(rawBody.area, 0, 10000000);
      const featured = Boolean(rawBody.featured);

      const currency = ALLOWED_CURRENCIES.includes(rawBody.currency) ? rawBody.currency : 'USD';
      const category = ALLOWED_CATEGORIES.includes(rawBody.category) ? rawBody.category : 'casa';
      const type = ALLOWED_TYPES.includes(rawBody.type) ? rawBody.type : 'venta';

      const images = sanitizeImages(rawBody.images, 20);

      if (!title || !location) {
        return createSafeErrorResponse(400, 'El título y la ubicación son campos obligatorios.');
      }

      const id = `prop-${Date.now()}`;

      await sql`
        INSERT INTO properties (id, title, description, price, currency, location, bedrooms, bathrooms, area, type, category, images, featured)
        VALUES (${id}, ${title}, ${description}, ${price}, ${currency}, ${location}, ${bedrooms}, ${bathrooms}, ${area}, ${type}, ${category}, ${images}, ${featured})
      `;

      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: getSecurityHeaders(),
      });
    }

    if (method === 'PUT') {
      const rawBody = await request.json().catch(() => ({}));
      const id = sanitizeString(rawBody.id, 50);

      if (!id) {
        return createSafeErrorResponse(400, 'ID de propiedad requerido para actualizar.');
      }

      const title = sanitizeString(rawBody.title, 150);
      const description = sanitizeString(rawBody.description, 4000);
      const location = sanitizeString(rawBody.location, 200);
      const price = sanitizeNumber(rawBody.price, 0, 1000000000);
      const bedrooms = sanitizeNumber(rawBody.bedrooms, 0, 100);
      const bathrooms = sanitizeNumber(rawBody.bathrooms, 0, 100);
      const area = sanitizeNumber(rawBody.area, 0, 10000000);
      const featured = Boolean(rawBody.featured);

      const currency = ALLOWED_CURRENCIES.includes(rawBody.currency) ? rawBody.currency : 'USD';
      const category = ALLOWED_CATEGORIES.includes(rawBody.category) ? rawBody.category : 'casa';
      const type = ALLOWED_TYPES.includes(rawBody.type) ? rawBody.type : 'venta';

      const images = sanitizeImages(rawBody.images, 20);

      await sql`
        UPDATE properties
        SET title = ${title},
            description = ${description},
            price = ${price},
            currency = ${currency},
            location = ${location},
            bedrooms = ${bedrooms},
            bathrooms = ${bathrooms},
            area = ${area},
            type = ${type},
            category = ${category},
            images = ${images},
            featured = ${featured}
        WHERE id = ${id}
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getSecurityHeaders(),
      });
    }

    if (method === 'DELETE') {
      const url = new URL(request.url);
      const rawId = url.searchParams.get('id');
      const id = sanitizeString(rawId, 50);

      if (!id) {
        return createSafeErrorResponse(400, 'ID de propiedad válido requerido.');
      }

      await sql`
        DELETE FROM properties
        WHERE id = ${id}
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getSecurityHeaders(),
      });
    }

    return createSafeErrorResponse(405, 'Método no permitido.');

  } catch (error) {
    console.error('Error in properties handler:', error);
    return createSafeErrorResponse(500, 'Error interno al procesar la operación sobre propiedades.');
  }
};
