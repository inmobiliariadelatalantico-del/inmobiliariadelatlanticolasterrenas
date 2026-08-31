import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function netlifyDevApiPlugin(): Plugin {
  return {
    name: 'netlify-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Set Security Headers on local dev requests
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = url.pathname;

          let handler: ((request: Request) => Promise<Response>) | null = null;

          if (pathname === '/api/login') {
            const mod = await import('./api/login.ts');
            handler = mod.default;
          } else if (pathname === '/api/properties') {
            const mod = await import('./api/properties.ts');
            handler = mod.default;
          } else if (pathname === '/api/projects') {
            const mod = await import('./api/projects.ts');
            handler = mod.default;
          } else if (pathname === '/api/send-email') {
            const mod = await import('./api/send-email.ts');
            handler = mod.default;
          }

          if (!handler) {
            return next();
          }

          let body: string | undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            body = Buffer.concat(chunks).toString('utf8');
          }

          const webRequest = new Request(url.toString(), {
            method: req.method,
            headers: req.headers as any,
            body: body ? body : undefined,
          });

          const webResponse = await handler(webRequest);
          res.statusCode = webResponse.status;
          webResponse.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });
          const resBody = await webResponse.text();
          res.end(resBody);
        } catch (err: any) {
          console.error('Error in local API middleware:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.end(JSON.stringify({ error: 'Error interno en el servidor local.' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;
  if (env.RESEND_API_KEY) process.env.RESEND_API_KEY = env.RESEND_API_KEY;
  if (env.ADMIN_JWT_SECRET) process.env.ADMIN_JWT_SECRET = env.ADMIN_JWT_SECRET;

  return {
    plugins: [react(), tailwindcss(), netlifyDevApiPlugin()],
    server: {
      hmr: {
        overlay: false,
      },
    },
    build: {
      // Prevent source code leakage in production builds
      sourcemap: false,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
