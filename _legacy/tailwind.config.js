/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'florentine-lapis': '#1E5897',
        'adamantine-blue': '#45ABEF',
        'black-velvet': '#222235',
        'organza-violet': '#7B8DC6',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  // Keep existing component CSS intact; this app is not a Tailwind-first UI.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
