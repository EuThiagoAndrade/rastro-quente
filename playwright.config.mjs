// Ciclo 003, issue #23 — E2E local: interface construída contra o Supabase local, com Auth local e dados
// fictícios. Usa o Chrome do sistema (channel 'chrome'), sem baixar navegadores. Roda em `npm run test:e2e`.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.mjs',
  globalSetup: './tests/e2e/global-setup.mjs',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    channel: 'chrome',
    locale: 'pt-BR',
    timezoneId: 'America/Cuiaba',
    trace: 'off',
    actionTimeout: 15_000,
  },
  webServer: {
    command: 'node scripts/interface/servir-e2e.mjs',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
