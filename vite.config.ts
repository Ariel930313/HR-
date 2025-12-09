import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',  // 告訴 Vercel：網頁入口在 client 資料夾
  build: {
    outDir: '../dist', // 告訴 Vercel：打包好的東西放回最外層
    emptyOutDir: true,
  }
})
