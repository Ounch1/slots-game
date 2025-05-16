import { Reel } from '@/slots/Reel';

let reel: Reel;
beforeEach(() => {
	reel = new Reel(6, 150);
});

describe('Reel', () => {
	test.todo(
		'createSymbols initializes the correct number of symbols and adds them to the container.'
	);
	test.todo('createRandomSymbol returns a PIXI.Sprite with a valid texture');
});
