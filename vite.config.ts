import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 构建输出路径（兼容 Node 16 服务器的静态文件服务）
  build: {
    outDir: 'dist',
    // 降级目标浏览器范围，确保兼容性
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
