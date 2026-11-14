import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Backend dung de proxy khi chay `npm run dev` (khong qua Docker/Nginx)
  const backend = env.DEV_PROXY_TARGET || 'http://localhost:18000'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 13000,
      host: true,
      proxy: {
        '/api': { target: backend, changeOrigin: true },
      },
    },
    preview: { port: 13000, host: true },
  }
})