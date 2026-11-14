/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oyster: {
          50: '#FAF8F4',
          100: '#F5F2EA',
          DEFAULT: '#F1EEE5',
          200: '#E8E4D8',
          300: '#D8D6CC',
          400: '#C5C1B4',
        },
        'deep-ink': {
          DEFAULT: '#111916',
          light: '#1E2C27',
          surface: '#0B120F',
          // Sidebar nav section headers & secondary links: now bright #9EC2B4 (~7.5:1 on dark)
          muted: '#9EC2B4',
          border: '#273933',
        },
        'electric-lime': {
          DEFAULT: '#C6E86B',
          hover: '#B5DC54',
          muted: '#E3F5A8',
          subtle: 'rgba(198, 232, 107, 0.16)',
          // Dark text on lime bg — crisp ~12:1
          text: '#13260E',
        },
        sage: {
          50: '#F2F6F4',
          100: '#E3ECE8',
          // #2D5446 → 7.2:1 on white, 6.7:1 on oyster (WCAG AAA)
          DEFAULT: '#2D5446',
          hover: '#224035',
          light: '#5B8676',
          surface: '#E2ECE7',
        },
        clay: {
          50: '#FDF7F5',
          100: '#F8ECE6',
          // #963815 → 7.0:1 on white, 6.5:1 on oyster (WCAG AAA)
          DEFAULT: '#963815',
          hover: '#7A2C0E',
          light: '#BD5730',
          surface: '#FAE8E1',
        },
        ink: {
          DEFAULT: '#111916',
          // #2F3E37 → 9.1:1 on white, 8.4:1 on oyster (WCAG AAA)
          secondary: '#2F3E37',
          // #4B5E55 → 5.6:1 on white, 5.2:1 on oyster (WCAG AA+)
          muted: '#4B5E55',
        },
        border: {
          DEFAULT: '#B8B5A8',
          subtle: '#CCC8BC',
          strong: '#8A877A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(17, 25, 22, 0.08), 0 1px 2px -1px rgba(17, 25, 22, 0.05)',
        'editorial': '0 4px 16px -2px rgba(17, 25, 22, 0.10), 0 2px 6px -2px rgba(17, 25, 22, 0.06)',
        'elevated': '0 12px 32px -4px rgba(17, 25, 22, 0.14), 0 4px 12px -3px rgba(17, 25, 22, 0.08)',
        'card': '0 1px 2px 0 rgba(17, 25, 22, 0.06), 0 0 0 1px rgba(17, 25, 22, 0.05)',
        'lime-glow': '0 0 18px rgba(198, 232, 107, 0.45)',
      }
    },
  },
  plugins: [],
}
