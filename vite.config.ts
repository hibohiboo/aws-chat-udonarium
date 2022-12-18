import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// @ts-ignore
const dev = process.env.npm_lifecycle_event === 'dev';
const base = dev ? '' : `/mobile-udonarium/`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
