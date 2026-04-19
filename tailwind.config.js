/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          muted: '#8b949e',
        },
        node: {
          start: '#10b981',
          task: '#3b82f6',
          approval: '#f59e0b',
          automated: '#8b5cf6',
          end: '#ef4444',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#8b5cf6',
        },
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, #30363d 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-md': '24px 24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
