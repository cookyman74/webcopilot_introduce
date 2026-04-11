/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // happy-dom 사용 사유: jsdom@27의 transitive deps(@asamuzakjp/css-color →
    // @csstools/css-calc)에서 CJS/ESM interop 깨짐 발생. happy-dom은 더 빠르고
    // 이런 문제가 없음. jsdom devDep은 호환성 위해 보존.
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
  },
});
