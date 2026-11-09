import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { createDemoSync } from './src/lib/mock/syncServer.ts';

/** Shared demo state for every device on the network (dev and preview). */
function demoSync(): Plugin {
  const handler = createDemoSync();
  return {
    name: 'secondshelf-demo-sync',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), demoSync()],
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 700,
  },
});
