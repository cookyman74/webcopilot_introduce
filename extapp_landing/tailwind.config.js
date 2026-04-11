/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 배경 계열
        canvas: '#FFFFFF',
        surface: '#FBFAF9',
        'surface-alt': '#F7F6F3',
        // 경계선
        border: '#E9E9E7',
        // 텍스트 계열 (Notion-like 진회색 톤)
        ink: {
          900: '#191918',
          700: '#37352F',
          500: '#787774',
          400: '#9B9A97',
        },
        // 브랜드 액센트 — 차분한 블루 (브라우저 AI 코파일럿 정체성)
        accent: {
          DEFAULT: '#2E6EE6',
          hover: '#1F57C4',
          soft: '#EEF3FD',
        },
        // 구현 상태 배지 (Badge 컴포넌트가 토큰으로 사용)
        status: {
          done: '#10B981',
          wip: '#F59E0B',
          planned: '#9B9A97',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
