import { Application, Container, Texture } from 'pixi.js';
import { SlotMachine } from '@/slots/SlotMachine';

// Mocks
jest.mock('@/utils/sound', () => ({
	sound: { play: jest.fn() },
}));

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
	})),
}));

// Tests
describe('SlotMachine', () => {
	let app: Application;
	let slotMachine: SlotMachine;

	beforeAll(() => {
		app = new Application({ width: 800, height: 600 });
	});
	beforeEach(() => {
		app.stage.removeChildren();
		slotMachine = new SlotMachine(app);
	});

	it('initializes with correct container', () => {
		expect(slotMachine.container).toBeInstanceOf(Container);
		expect(app.stage.children).not.toContain(slotMachine.container);
	});
});
