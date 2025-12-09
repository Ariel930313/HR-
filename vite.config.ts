import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 這裡用了 path.resolve，是更強制的寫法，保證抓到 client 資料夾
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
})
