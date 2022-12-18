import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// @ts-ignore
const dev = process.env.npm_lifecycle_event === 'dev';
const base = dev ? '' : `/mobile-udonarium/`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 4200 },
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          udonarium: ['crypto-js', 'lzbase62', 'msgpack-lite', 'pako', 'skyway-js'],
        },
      },
    },
  },
});
