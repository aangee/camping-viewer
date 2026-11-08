import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const PORT = 4173
const BASE = '/camping-viewer/'

const bravePath = process.env.BRAVE_PATH
  ?? 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'

if (!existsSync(bravePath)) {
  throw new Error(
    `Brave introuvable: ${bravePath}. Installe Brave ou définis BRAVE_PATH.`
  )
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // channel: 'chrome' + executablePath = Brave. Sans channel, Playwright 1.59
    // lance chromium_headless_shell (pas Brave).
    channel: 'chrome',
    launchOptions: {
      executablePath: bravePath,
    },
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host',
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
