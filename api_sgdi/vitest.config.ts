import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['testes/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
});
