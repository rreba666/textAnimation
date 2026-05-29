import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// 挂载 React 应用到 #root 节点
// StrictMode 仅在开发环境启用双重渲染以检测副作用
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
