import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/** The real server (/api, /healthz) runs inside the Vite dev and preview servers. */
function apiServer(): Plugin {
  // Loaded on first request only, so `vite build` never opens the database.
  let app: ((req: any, res: any, next: () => void) => void) | null = null;
  const handler = async (req: any, res: any, next: () => void) => {
    if (!app) app = (await import('./src/server/app.ts')).createApp();
    app(req, res, next);
  };
  return {
    name: 'secondshelf-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServer()],
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 700,
  },
});
