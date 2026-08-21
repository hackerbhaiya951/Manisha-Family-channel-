import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] }, colors: { brand: { pink: '#ec4899', purple: '#8b5cf6', orange: '#f97316' } } } },
  plugins: [],
}
export default config
