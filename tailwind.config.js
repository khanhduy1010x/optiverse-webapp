/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      fontFamily: {
        regular: ['NotoSans-Regular', 'sans-serif'],
        notoBold: ['NotoSans-Bold', 'sans-serif'],
        pixel: ['Pixel', 'sans-serif']
      },
      fontWeight: {
        medium: '500',
        hard: '800'
      },
    },
  },
  safelist: [
    'text-[12px]',
    'text-[14px]',
    'text-[16px]',
    'text-[18px]',
    'text-[20px]',
    'text-[24px]',
    'text-[32px]',
    'text-[36px]'
  ],
  plugins: [],
};
