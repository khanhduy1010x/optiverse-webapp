import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from '@svgr/rollup';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  env.VITE_APP_ENV = mode;

  console.log(`🚀 Running in ${isProd ? 'production' : 'development'} mode`);

  return {
    plugins: [react(), tailwindcss(), svgr(), ...(isProd ? [] : [mkcert()])],

    server: {
      host: '0.0.0.0',
      // https: isProd ? undefined : {},
      port: Number(env.VITE_PORT) || 5173,
      allowedHosts: true,
      https: false,
    },

    build: {
      outDir: 'dist',
      minify: 'esbuild',
      cssMinify: 'esbuild',
      target: 'esnext',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      emptyOutDir: true,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
        supported: { 'top-level-await': true },
      },
    },
    define: {
      'import.meta.env.VITE_APP_ENV': JSON.stringify(mode),
    },
  };
});
