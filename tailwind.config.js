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
        notebook: {
          bg: 'rgb(var(--bg-primary) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          dot: 'rgb(var(--bg-dot) / <alpha-value>)',
        },
        warm: {
          orange: 'rgb(var(--accent-primary) / <alpha-value>)',
          pink: 'rgb(var(--accent-secondary) / <alpha-value>)',
          green: 'rgb(var(--accent-green) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          light: 'rgb(var(--text-light) / <alpha-value>)',
        },
        border: {
          light: 'rgb(var(--border-light) / <alpha-value>)',
        },
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      },
      fontFamily: {
        title: ['DingTalk JinBuTi', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
