/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/types/**',
        'src/test/**',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        'eslint.config.js',
      ],
      // Interim ratchet; the strategic target documented in TEST_STRATEGY.md
      // is line ≥ 70 % on stateful components. Current measured figures are
      // well above that thanks to the integration shape of these tests
      // (statements 90.67, branches 85.83, functions 82.41, lines 90.64).
      // Each minimum sits roughly two points below the actual figure so a
      // good-faith refactor has headroom but a regression fails the build.
      thresholds: {
        statements: 88,
        branches: 83,
        functions: 80,
        lines: 88,
      },
    },
  },
})
