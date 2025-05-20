import { test, expect } from '@playwright/test';
import {
	SlotMachine,
	REEL_SPIN_DURATION,
	REEL_COUNT,
} from '@/slots/SlotMachine';

declare global {
	interface Window {
		slotMachine: SlotMachine;
	}
}

test.beforeEach(async ({ page }) => {
	await page.goto('http://localhost:9000/');

	// Wait for slot machine to instantiate
	await expect
		.poll(async () => {
			return await page.evaluate(() => !!window.slotMachine);
		})
		.toBe(true);
});

test('spin functionality works as expected', async ({ page }) => {
	// Make sure this is the right page
	await expect(page).toHaveTitle('Slots Game');
	// Make sure spinning is set to false
	await expect
		.poll(async () => {
			return await page.evaluate(() => window.slotMachine?.isSpinningStatus);
		})
		.toBe(false);
	// Click on the button
	await page.locator('canvas').click({
		position: {
			x: 618,
			y: 615,
		},
	});
	// Spinning should be set to true after the click
	await expect
		.poll(async () => {
			return await page.evaluate(() => window.slotMachine?.isSpinningStatus);
		})
		.toBe(true);

	// Click again, to try to mess up the flag. If it works as intended, next check will succeed.
	await page.locator('canvas').click({
		position: {
			x: 618,
			y: 615,
		},
	});

	// Wait for the spin to finish and verify isSpinningStatus flag as false
	await expect
		.poll(
			async () => {
				return await page.evaluate(() => window.slotMachine?.isSpinningStatus);
			},
			{ timeout: REEL_SPIN_DURATION * REEL_COUNT + 100 }
		)
		.toBe(false); // Add a little buffer
});
