import { Reel } from '@/slots/Reel';

let reel: Reel;
const symbolCount: number = 6;
const symbolSize: number = 150;
const symbolOffset: number = 20;
beforeEach(() => {
	reel = new Reel(symbolCount, symbolSize, symbolOffset);
});

describe('Reel', () => {
	it('createSymbols initializes the correct number of symbols and adds them to the container.', () => {
		expect(reel.container.children.length).toBe(symbolCount);
	});
	it('positions symbols with correct x and y offsets', () => {
		reel.container.children.forEach((symbol, i) => {
			expect(symbol.x).toBe(symbolSize * i + symbolOffset); // 20 is your offset
			expect(symbol.y).toBe(symbolOffset);
		});
	});

	test.todo('createRandomSymbol returns a PIXI.Sprite with a valid texture');
});
