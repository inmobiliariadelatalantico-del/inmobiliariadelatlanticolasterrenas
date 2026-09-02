import { sql } from './db-client.js';
import {
  verifyAuthToken,
  getSecurityHeaders,
  sanitizeString,
  sanitizeImageUrl,
  sanitizeImages,
  createSafeErrorResponse
} from './security.js';

export const config = {
  runtime: 'edge',
};

export default async (request: Request) => {
  const method = request.method;

  try {
    if (method === 'GET') {
      const projects = await sql`
        SELECT * FROM projects 
        ORDER BY id DESC
      `;
      const formatted = projects.map(p => {
        let imgs: string[] = [];
        if (p.images) {
          imgs = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []);
        } else if (p.image) {
          try {
            if (typeof p.image === 'string' && p.image.trim().startsWith('[')) {
              imgs = JSON.parse(p.image);
            } else {
              imgs = [p.image];
            }
          } catch {
            imgs = [p.image];
          }
        }
        const mainImg = imgs[0] || p.image || '/samana.png';
        return {
          ...p,
          description: p.description || '',
          image: mainImg,
          images: imgs.length > 0 ? imgs : [mainImg]
        };
      });

      return new Response(JSON.stringify(formatted), {
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
      const description = sanitizeString(rawBody.description, 4000);
      
      const images = sanitizeImages(rawBody.images, 20);
      const rawImage = sanitizeImageUrl(rawBody.image);
      const primaryImage = images[0] || rawImage || '/samana.png';
      const storedImage = images.length > 1 ? JSON.stringify(images) : primaryImage;

      if (!title || !location) {
        return createSafeErrorResponse(400, 'El título y la ubicación son campos obligatorios.');
      }

      const id = `proj-${Date.now()}`;

      try {
        await sql`
          INSERT INTO projects (id, title, location, description, image)
          VALUES (${id}, ${title}, ${location}, ${description}, ${storedImage})
        `;
      } catch {
        try {
          await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;`;
          await sql`
            INSERT INTO projects (id, title, location, description, image)
            VALUES (${id}, ${title}, ${location}, ${description}, ${storedImage})
          `;
        } catch {
          await sql`
            INSERT INTO projects (id, title, location, image)
            VALUES (${id}, ${title}, ${location}, ${storedImage})
          `;
        }
      }

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
      const description = sanitizeString(rawBody.description, 4000);

      const images = sanitizeImages(rawBody.images, 20);
      const rawImage = sanitizeImageUrl(rawBody.image);
      const primaryImage = images[0] || rawImage || '/samana.png';
      const storedImage = images.length > 1 ? JSON.stringify(images) : primaryImage;

      try {
        await sql`
          UPDATE projects
          SET title = ${title},
              location = ${location},
              description = ${description},
              image = ${storedImage}
          WHERE id = ${id}
        `;
      } catch {
        try {
          await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;`;
          await sql`
            UPDATE projects
            SET title = ${title},
                location = ${location},
                description = ${description},
                image = ${storedImage}
            WHERE id = ${id}
          `;
        } catch {
          await sql`
            UPDATE projects
            SET title = ${title},
                location = ${location},
                image = ${storedImage}
            WHERE id = ${id}
          `;
        }
      }

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
