import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Vite config for building @cip/ui as a distributable library.
 * Run with:  npm run build  (in packages/ui)
 *
 * Outputs:
 *   dist/index.mjs      — ESM bundle
 *   dist/index.cjs      — CJS bundle
 *   dist/style.css      — compiled CSS (tokens + Tailwind utilities)
 *   dist/types/         — TypeScript declarations (via tsc, see tsconfig.build.json)
 */
export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/build-entry.ts'),
      name: 'CIPUi',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.mjs' : 'index.cjs',
    },

    rollupOptions: {
      // React must be peer — never bundle it
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
      output: {
        // Keep asset names predictable
        assetFileNames: '[name][extname]',
        globals: {
          react:           'React',
          'react-dom':     'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
        },
      },
    },

    // All CSS → single dist/style.css
    cssCodeSplit: false,

    // Source maps help consumers debug in dev
    sourcemap: true,

    outDir:      'dist',
    emptyOutDir: true,
  },
})
