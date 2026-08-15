/**
 * Brand token reference for LeanChem Phase 2.
 * Runtime theme is defined in `src/styles/app.css` (@theme) for Tailwind CSS v4.
 */
import type { Config } from 'tailwindcss'

const config = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        lapis: '#1E5897',
        adamantine: '#45ABEF',
        velvet: '#222235',
        organza: '#7B8DC6',
        canvas: '#F8FAFC',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      width: {
        rail: '280px',
      },
      maxWidth: {
        drawer: '640px',
      },
      zIndex: {
        command: '50',
        banner: '60',
      },
      transitionDuration: {
        hover: '250ms',
      },
    },
  },
} satisfies Config

export default config
