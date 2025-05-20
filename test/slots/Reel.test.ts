import { Reel } from '@/slots/Reel';
import { Texture, BaseTexture } from 'pixi.js';

let reel: Reel;
const symbolCount: number = 6;
const symbolSize: number = 150;
const dummyTextures = Array(symbolCount).fill(Texture.EMPTY);

beforeEach(() => {
	reel = new Reel(symbolCount, symbolSize, dummyTextures);
});

// Memory clean
afterEach(() => {
	reel.container.destroy({ children: true });
	dummyTextures.forEach((texture) => texture.destroy());
});

describe('Reel', () => {
	it('createSymbols initializes the correct number of symbols and adds them to the container.', () => {
		expect(reel.container.children.length).toBe(symbolCount);
	});
	it('positions symbols with correct x and y offsets', () => {
		reel.container.children.forEach((symbol, i) => {
			expect(symbol.x).toBe(symbolSize * i);
			expect(symbol.y).toBe(0);
		});
	});
	it('startSpin sets isSpinning to true and speed to SPIN_SPEED', () => {
		reel.startSpin();
		expect(reel['isSpinning']).toBe(true);
		const SPIN_SPEED = 50;
		expect(reel['speed']).toBe(SPIN_SPEED);
	});
	it('update does nothing if not spinning and speed is 0', () => {
		const spy = jest.spyOn(reel['symbols'][0], 'x', 'set');
		reel.update(1);
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
	it('should update symbol positions while spinning', () => {
		reel.startSpin();
		const xBefore = reel['symbols'].map((s) => s.x);
		reel.update(1);
		const xAfter = reel['symbols'].map((s) => s.x);
		expect(xAfter).not.toEqual(xBefore);
	});

	it('should slow down and stop after stopSpin', () => {
		reel.startSpin();
		reel.update(1);
		reel.stopSpin();

		let safetyCounter = 0;
		while (reel['speed'] > 0 && safetyCounter < 1000) {
			reel.update(1);
			safetyCounter++;
		}

		expect(reel['speed']).toBe(0);
	});

	it('should snap all symbols to snapPoints', () => {
		reel['symbols'].forEach((symbol) => (symbol.x += 50));
		// Move the positions
		reel['snapToGrid']();
		reel['symbols'].forEach((symbol, i) => {
			expect(symbol.x).toBeCloseTo(i * reel['symbolSize']);
		});
	});

	it('should wrap symbols and reorder array', () => {
		reel.startSpin();

		const rightBound =
			reel['symbols'].length * reel['symbolSize'] - reel['symbolSize'] / 2;
		const firstSymbol = reel['symbols'][0];
		firstSymbol.x = rightBound + 1;

		reel.update(1);

		expect(reel['symbols'][0]).toBe(firstSymbol);
	});
	it('wraps multiple symbols if they cross the bound in a single update', () => {
		reel.startSpin();
		const rightBound = reel['symbols'].length * reel['symbolSize'] - reel['symbolSize'] / 2;
		const firstSymbol = reel['symbols'][0];
		const secondSymbol = reel['symbols'][1];
		// Move two symbols past the bound
		firstSymbol.x = rightBound + 10;
		secondSymbol.x = rightBound + 20;
		reel.update(1);
		expect(reel['symbols'][0]).toBe(secondSymbol);
		expect(reel['symbols'][1]).toBe(firstSymbol);
	});
	it('destroy cleans up all symbols and container', () => {
		const destroySpies = reel['symbols'].map(symbol => jest.spyOn(symbol, 'destroy'));
		const containerDestroySpy = jest.spyOn(reel.container, 'destroy');
		reel.destroy();
		destroySpies.forEach(spy => expect(spy).toHaveBeenCalled());
		expect(containerDestroySpy).toHaveBeenCalled();
		destroySpies.forEach(spy => spy.mockRestore());
		containerDestroySpy.mockRestore();
	});
});
