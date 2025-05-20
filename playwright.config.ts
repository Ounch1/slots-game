import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	testMatch: '**/*.spec.ts',
	retries: 1,
	use: {
		headless: false,
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		baseURL: 'https://example.com',
		viewport: { width: 1280, height: 720 },
	},
});
