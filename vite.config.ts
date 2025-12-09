import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client', // 關鍵：告訴 Vercel 網頁的原始碼都在 client 資料夾裡
  build: {
    outDir: '../dist', // 關鍵：打包好的檔案要放到最外層的 dist，這樣 Vercel 才找得到
    emptyOutDir: true,
  }
})
