import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // localhost bazen IPv6 (::1) olur; Docker portu genelde 127.0.0.1 üzerinde → 502 riski azalır
  const payrollTarget = env.VITE_PAYROLL_PROXY_TARGET || 'http://127.0.0.1:8086'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/payroll-api': {
          target: payrollTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/payroll-api/, '/api/v1'),
          timeout: 60_000,
          proxyTimeout: 60_000,
        },
      },
    },
  }
})
