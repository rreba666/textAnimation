/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 莫兰迪色系 —— 通过 CSS 变量支持亮/暗主题
        notebook: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-card)',
          dot: 'var(--bg-dot)',
        },
        warm: {
          orange: 'var(--accent-primary)',
          pink: 'var(--accent-secondary)',
          green: 'var(--accent-green)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          light: 'var(--text-light)',
        },
        border: {
          light: 'var(--border-light)',
        },
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 28px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
