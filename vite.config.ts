import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 這裡不需要 root: 'client' 了，因為檔案就在根目錄
  build: {
    outDir: 'dist',
  }
})
