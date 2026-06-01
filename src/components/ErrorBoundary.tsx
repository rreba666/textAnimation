// 错误边界组件 —— 捕获渲染错误，防止白屏

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error.message, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-notebook-bg flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">页面出错了</h2>
            <p className="text-sm text-text-secondary mb-4">
              {this.state.error.message || '未知错误'}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-warm-orange text-white rounded-xl text-sm hover:bg-warm-orange/90 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
