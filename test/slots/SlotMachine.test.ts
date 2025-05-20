import { Application, Container, Sprite } from 'pixi.js';
import { SlotMachine, BACKGROUND_OFFSET, SYMBOL_SIZE, REEL_SPACING } from '../../src/slots/SlotMachine';

// sound utility
jest.mock('@/utils/sound', () => ({
	sound: { play: jest.fn(), stop: jest.fn() },
}));

// PIXI.js core classes
jest.mock('pixi.js', () => {
	class MockContainer {
		addChild = jest.fn();
		removeChild = jest.fn();
		destroy = jest.fn();
		children: any[] = [];
		x = 0;
		y = 0;
	}

	class MockSprite {
		interactive = true;
		on = jest.fn();
		off = jest.fn();
		destroy = jest.fn();
		emit = jest.fn();
		texture = {};
	}

	return {
		Application: jest.fn(() => ({
			stage: { addChild: jest.fn(), removeChild: jest.fn(), children: [] },
			screen: { width: 800, height: 600 },
			renderer: { destroy: jest.fn(), resize: jest.fn() },
			ticker: { add: jest.fn(), remove: jest.fn(), emit: jest.fn() },
			destroy: jest.fn(),
		})),
		Container: jest.fn(() => new MockContainer()),
		Texture: { EMPTY: {} },
		Sprite: jest.fn(() => new MockSprite()),
	};
});

// pixi-spine
jest.mock('pixi-spine', () => ({
	Spine: jest.fn().mockImplementation(() => ({
		state: {
			addListener: jest.fn(),
			setAnimation: jest.fn(),
			hasAnimation: jest.fn(() => true),
		},
		visible: false,
		x: 0,
		y: 0,
		destroy: jest.fn(),
	})),
}));

//  AssetLoader
jest.mock('@/utils/AssetLoader', () => ({
	AssetLoader: {
		getTextures: jest.fn(() => [{}, {}, {}, {}]),
		getTexture: jest.fn(() => ({})),
		getSpine: jest.fn(() => ({ spineData: {} })),
	},
}));

// Reel
jest.mock('@/slots/Reel', () => ({
	Reel: jest.fn().mockImplementation(() => ({
		container: { destroy: jest.fn() },
		startSpin: jest.fn(),
		stopSpin: jest.fn(),
		update: jest.fn(),
		destroy: jest.fn(),
	})),
}));

describe('SlotMachine', () => {
	let app: Application;
	let slotMachine: SlotMachine;

	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		app = new Application({ width: 800, height: 600 });
		slotMachine = new SlotMachine(app);
	});

	afterEach(() => {
		jest.useRealTimers();
		if (slotMachine) {
			slotMachine['reels'].forEach(reel => {
				reel.destroy();
			});
			slotMachine.container.destroy({ children: true, texture: true, baseTexture: true });
		}
		if (app) {
			app.destroy(true, { children: true, texture: true, baseTexture: true });
		}
		jest.clearAllMocks();
	});

	test('initializes with correct container', () => {
		expect(slotMachine.container).toBeDefined();
		expect(app.stage.children).not.toContain(slotMachine.container);
	});

	test('creates the correct number of reels', () => {
		const REEL_COUNT = 4;
		expect(slotMachine['reels'].length).toBe(REEL_COUNT);
	});

	it('should position reels correctly', () => {
		const reels = slotMachine['reels'];
		reels.forEach((reel, i) => {
			const expectedY = BACKGROUND_OFFSET + i * (SYMBOL_SIZE + REEL_SPACING);
			expect(reel.container.y).toBe(expectedY);
		});
	});

	test('calls startSpin on all reels when spin is called', () => {
		const reels = slotMachine['reels'];
		slotMachine.spin();
		jest.advanceTimersByTime(1000);
		reels.forEach(reel => {
			expect(reel.startSpin).toHaveBeenCalled();
		});
	});

	test('disables spin button and plays sound on spin', async () => {
		const spinButton = { texture: {}, interactive: true };
		slotMachine.setSpinButton(spinButton as any);
		slotMachine.spin();
		expect(spinButton.interactive).toBe(false);
		expect((await import('../../src/utils/sound')).sound.play).toHaveBeenCalledWith('Reel spin');
	});

	test('calls stopSpin on all reels after spin duration', () => {
		slotMachine.spin();
		jest.advanceTimersByTime(10000);
		slotMachine['reels'].forEach(reel => {
			expect(reel.stopSpin).toHaveBeenCalled();
		});
	});

	test('updates all reels on update', () => {
		const reels = slotMachine['reels'];
		slotMachine.update(1);
		reels.forEach(reel => {
			expect(reel.update).toHaveBeenCalledWith(1);
		});
	});

	describe('spin()', () => {
		it('should not spin if already spinning', () => {
			slotMachine['isSpinning'] = true;
			slotMachine.spin();
			slotMachine['reels'].forEach(reel => {
				expect(reel.startSpin).not.toHaveBeenCalled();
			});
		});

		it('should set spin button correctly', () => {
			const mockButton = new Sprite();
			slotMachine.setSpinButton(mockButton);
			expect(slotMachine['spinButton']).toBe(mockButton);
		});
	});

	describe('Container properties', () => {
		it('should have correct container position', () => {
			expect(slotMachine.container.x).toBe(app.screen.width / 2 - slotMachine.totalReelWidth / 2);
			expect(slotMachine.container.y).toBe(app.screen.height / 2 - slotMachine.totalReelHeight / 2);
		});
	});

	test('sets spinButton correctly', () => {
		const btn = { texture: {}, interactive: true };
		slotMachine.setSpinButton(btn as any);
		expect(slotMachine['spinButton']).toBe(btn);
	});

	test('calls sound.stop and enables spin button after stopSpin', async () => {
		const { sound } = await import('../../src/utils/sound');
		const spinButton = { texture: {}, interactive: false };
		slotMachine.setSpinButton(spinButton as any);
		slotMachine.spin();
		jest.advanceTimersByTime(10000);
		jest.advanceTimersByTime(500);
		expect(sound.stop).toHaveBeenCalledWith('Reel spin');
		expect(spinButton.interactive).toBe(true);
	});

	test('calls sound.play("win") and shows win animation on win', async () => {
		const { sound } = await import('../../src/utils/sound');
		jest.spyOn(Math, 'random').mockReturnValue(0);
		const winAnimation = {
			visible: false,
			state: { setAnimation: jest.fn() }
		};
		slotMachine['winAnimation'] = winAnimation as any;
		(slotMachine as any).checkWin();
		expect(sound.play).toHaveBeenCalledWith('win');
		expect(winAnimation.visible).toBe(true);
		expect(winAnimation.state.setAnimation).toHaveBeenCalledWith(0, 'start', false);
		jest.restoreAllMocks();
	});

	test('logs warning if winAnimation is null on win', async () => {
		const { sound } = await import('../../src/utils/sound');
		jest.spyOn(Math, 'random').mockReturnValue(0);
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
		slotMachine['winAnimation'] = null;
		(slotMachine as any).checkWin();
		expect(sound.play).toHaveBeenCalledWith('win');
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
		jest.restoreAllMocks();
	});
});
