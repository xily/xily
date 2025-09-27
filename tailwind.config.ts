import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purpleBrand: '#7C3AED',
        'purpleBrand-light': '#C4B5FD',
        'purpleBrand-dark': '#5B21B6',
        primary: '#7C3AED',
        'primary-light': '#C4B5FD',
        'primary-dark': '#5B21B6',
        accent: '#C4B5FD',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
