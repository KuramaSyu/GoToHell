import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node', // logic-only tests → node is fastest
    globals: true, // allows `describe`, `it`, `expect` without imports
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html'],
    },
  },
});
