import { AssetLoader } from '@/utils/AssetLoader';
import { Assets, Texture } from 'pixi.js';

const mockTexture = {} as Texture;
const mockSpine = { animation: 'test' };

jest.mock('pixi.js', () => ({
	Assets: {
		init: jest.fn(),
		addBundle: jest.fn(),
		loadBundle: jest.fn(),
		reset: jest.fn(),
	},
	Texture: jest.fn(),
}));

describe('AssetLoader', () => {
	let loader: AssetLoader;

	beforeAll(() => {
		// Setup global mocks once
		(Assets.loadBundle as jest.Mock).mockImplementation(
			async (bundle: string) => {
				if (bundle === 'images' || bundle === 'symbols') {
					return {
						'ui/background.png': mockTexture,
						'symbol/symbol1.png': mockTexture,
					};
				}
				if (bundle === 'spines') {
					return {
						'big-boom-h.json': mockSpine,
					};
				}
				return {};
			}
		);
	});

	beforeEach(() => {
		jest.clearAllMocks();
		loader = new AssetLoader();
	});

	afterEach(() => {
		jest.resetAllMocks();
		Assets.reset();
		// @ts-expect-error - we're intentionally setting to undefined for cleanup
		loader = undefined;
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('should initialize Assets properly', () => {
		expect(Assets.init).toHaveBeenCalledWith({ basePath: '' });
	});

	test('should load assets successfully', async () => {
		await loader.loadAssets();

		expect(Assets.addBundle).toHaveBeenCalledWith('images', expect.any(Array));
		expect(Assets.addBundle).toHaveBeenCalledWith('symbols', expect.any(Array));
		expect(Assets.addBundle).toHaveBeenCalledWith('spines', expect.any(Array));

		expect(Assets.loadBundle).toHaveBeenCalledWith('images');
		expect(Assets.loadBundle).toHaveBeenCalledWith('symbols');
		expect(Assets.loadBundle).toHaveBeenCalledWith('spines');
	});

	test('should handle asset loading errors', async () => {
		(Assets.loadBundle as jest.Mock).mockRejectedValueOnce(
			new Error('Loading failed')
		);
		await expect(loader.loadAssets()).rejects.toThrow('Loading failed');
	});

	test('should get texture by name', () => {
		jest.spyOn(AssetLoader, 'getTexture').mockReturnValue(mockTexture);
		const texture = AssetLoader.getTexture('ui/background.png');
		expect(texture).toBe(mockTexture);
	});

	test('should get textures by bundle prefix', () => {
		jest.spyOn(AssetLoader, 'getTextures').mockReturnValue([mockTexture]);
		const textures = AssetLoader.getTextures('ui');
		expect(textures).toHaveLength(1);
		expect(textures[0]).toBe(mockTexture);
	});

	test('should get spine animation by name', () => {
		jest.spyOn(AssetLoader, 'getSpine').mockReturnValue(mockSpine);
		const spine = AssetLoader.getSpine('big-boom-h.json');
		expect(spine).toBe(mockSpine);
	});
});
