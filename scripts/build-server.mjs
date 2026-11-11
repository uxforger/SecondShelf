// Bundles the Express server (and express itself) into dist-server/main.mjs,
// so the runtime image needs no node_modules.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/server/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  outfile: 'dist-server/main.mjs',
  sourcemap: false,
  legalComments: 'none',
  // express is CommonJS and uses require(); give the ESM bundle one.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: 'info',
});
