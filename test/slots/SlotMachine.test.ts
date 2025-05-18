import { Application, Container, Sprite, Texture } from 'pixi.js';
import { BACKGROUND_OFFSET, REEL_COUNT, REEL_SPACING, SlotMachine, SYMBOL_SIZE } from '@/slots/SlotMachine';

// Mocks
jest.mock('@/utils/sound', () => ({
	sound: { play: jest.fn(), stop: jest.fn() },
}));

jest.mock('pixi.js', () => {
	const actual = jest.requireActual('pixi.js');
	return {
		...actual,
		Application: jest.fn(() => ({
			stage: { addChild: jest.fn(), removeChild: jest.fn() },
			screen: { width: 800, height: 600 },
			renderer: { destroy: jest.fn() },
			ticker: { add: jest.fn(), remove: jest.fn() },
			destroy: jest.fn(),
		})),
		Container: jest.fn(() => ({
			addChild: jest.fn(),
			destroy: jest.fn(),
			x: 0,
			y: 0,
		})),
		Graphics: jest.fn(() => ({
			beginFill: jest.fn(),
			drawRect: jest.fn(),
			endFill: jest.fn(),
		})),
		Sprite: jest.fn(() => ({
			texture: null,
			interactive: true,
		})),
	};
});

jest.mock('@/utils/AssetLoader', () => ({
	AssetLoader: {
		getTextures: jest.fn(() => [Texture.EMPTY]),
		getTexture: jest.fn(() => Texture.EMPTY),
		getSpine: jest.fn(() => ({ spineData: {} })),
	},
}));

jest.mock('@/slots/Reel', () => ({
	Reel: jest.fn().mockImplementation(() => ({
		container: new Container(),
		startSpin: jest.fn(),
		stopSpin: jest.fn(),
		update: jest.fn(),
		destroy: jest.fn(),
	})),
}));

// Tests
describe('SlotMachine', () => {
	let app: Application;
	let slotMachine: SlotMachine;

	beforeEach(() => {
		jest.clearAllMocks();
		app = new Application({ width: 800, height: 600 });
		slotMachine = new SlotMachine(app);
	});

	afterEach(() => {
		if (slotMachine) {
			slotMachine['reels'].forEach(reel => {
				reel.destroy();
			});
			slotMachine.container.destroy({ children: true, texture: true, baseTexture: true });
		}
		if (app) {
			app.destroy(true, { children: true, texture: true, baseTexture: true });
		}
	});

	it('should create correct number of reels', () => { // ensures 4 reels are initialized
		expect(slotMachine['reels'].length).toBe(REEL_COUNT);
	});

	it('should position reels correctly', () => {
		// Make sure the reels have the right positions relative to each other
		const reels = slotMachine['reels'];
		reels.forEach((reel, i) => {
			const expectedY = BACKGROUND_OFFSET + i * (SYMBOL_SIZE + REEL_SPACING);
			expect(reel.container.y).toBe(expectedY);
		});
	});

	it('should update all reels', () => {
		// Verify every reel has a working update
		const delta = 0.016;
		slotMachine.update(delta);
		slotMachine['reels'].forEach(reel => {
			expect(reel.update).toHaveBeenCalledWith(delta);
		});
	});

	describe('spin()', () => {
		it('should not spin if already spinning', () => {
			// Verify multiple simultaneous spins are prevented.
			slotMachine['isSpinning'] = true;
			slotMachine.spin();
			expect(slotMachine['reels'][0].startSpin).not.toHaveBeenCalled();
		});

		it('should set spin button correctly', () => {
			const mockButton = new Sprite();
			slotMachine.setSpinButton(mockButton);
			expect(slotMachine['spinButton']).toBe(mockButton);
		});
	});

	describe('Container properties', () => {
		it('should have correct container position', () => {
			// Verify containers are positioned in the center
			expect(slotMachine.container.x).toBe(app.screen.width / 2 - slotMachine.totalReelWidth / 2);
			expect(slotMachine.container.y).toBe(app.screen.height / 2 - slotMachine.totalReelHeight / 2);
		});
	});
});
