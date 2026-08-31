import { sql } from './db-client.js';
import {
  verifyAuthToken,
  getSecurityHeaders,
  sanitizeString,
  sanitizeImageUrl,
  createSafeErrorResponse
} from './security.js';

export default async (request: Request) => {
  const method = request.method;

  try {
    if (method === 'GET') {
      const projects = await sql`
        SELECT * FROM projects 
        ORDER BY id DESC
      `;
      return new Response(JSON.stringify(projects), {
        status: 200,
        headers: getSecurityHeaders(),
      });
    }

    // Require authorization for mutating operations
    const authHeader = request.headers.get('Authorization');
    const authPayload = await verifyAuthToken(authHeader);

    if (!authPayload) {
      return createSafeErrorResponse(401, 'No autorizado: Token de sesión inválido o expirado.');
    }

    // Check Role Permission (only editah or admin can manage architecture projects)
    if (authPayload.role !== 'editah' && authPayload.role !== 'admin') {
      return createSafeErrorResponse(403, 'Acceso denegado: No cuenta con permisos para modificar proyectos de arquitectura.');
    }

    if (method === 'POST') {
      const rawBody = await request.json().catch(() => ({}));
      const title = sanitizeString(rawBody.title, 150);
      const location = sanitizeString(rawBody.location, 200);
      const rawImage = sanitizeImageUrl(rawBody.image);
      const image = rawImage || '/samana.png';

      if (!title || !location) {
        return createSafeErrorResponse(400, 'El título y la ubicación son campos obligatorios.');
      }

      const id = `proj-${Date.now()}`;

      await sql`
        INSERT INTO projects (id, title, location, image)
        VALUES (${id}, ${title}, ${location}, ${image})
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
        return createSafeErrorResponse(400, 'ID de proyecto requerido para actualizar.');
      }

      const title = sanitizeString(rawBody.title, 150);
      const location = sanitizeString(rawBody.location, 200);
      const rawImage = sanitizeImageUrl(rawBody.image);
      const image = rawImage || '/samana.png';

      await sql`
        UPDATE projects
        SET title = ${title},
            location = ${location},
            image = ${image}
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
        return createSafeErrorResponse(400, 'ID de proyecto válido requerido.');
      }

      await sql`
        DELETE FROM projects
        WHERE id = ${id}
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: getSecurityHeaders(),
      });
    }

    return createSafeErrorResponse(405, 'Método no permitido.');

  } catch (error) {
    console.error('Error in projects handler:', error);
    return createSafeErrorResponse(500, 'Error interno al procesar la operación sobre proyectos.');
  }
};
