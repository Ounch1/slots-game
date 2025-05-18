import { sound } from './sound';
import { Assets, Texture } from 'pixi.js';

// Asset paths
const UI_IMAGES_PATH = 'assets/images/ui/';
const SYMBOL_PATH = 'assets/images/symbols/';
const SPINES_PATH = 'assets/spines/';
const SOUNDS_PATH = 'assets/sounds/';

// TODO: Implement automatic asset loading.
// Note: Instead of adding the names manually, it should be possible to simply add files into the respective directories.

// Asset lists
const UI_IMAGES = [
	'background.png',
	'button_spin.png',
	'button_spin_disabled.png',
];

const SYMBOL_IMAGES = [
	'symbol1.png',
	'symbol2.png',
	'symbol3.png',
	'symbol4.png',
	'symbol5.png',
];

const SPINES = ['big-boom-h.json', 'base-feature-frame.json'];

const SOUNDS = ['Reel spin.webm', 'win.webm', 'Spin button.webm'];

const textureCache: Record<string, Texture> = {};
const spineCache: Record<string, any> = {};

export class AssetLoader {
	constructor() {
		Assets.init({ basePath: '' });
	}

	public async loadAssets(): Promise<void> {
		try {
			Assets.addBundle(
				'images',
				UI_IMAGES.map((image) => ({
					alias: `ui/${image}`,
					src: UI_IMAGES_PATH + image,
				}))
			);

			Assets.addBundle(
				'symbols',
				SYMBOL_IMAGES.map((image) => ({
					alias: `symbol/${image}`,
					src: SYMBOL_PATH + image,
				}))
			);

			Assets.addBundle(
				'spines',
				SPINES.map((spine) => ({
					alias: spine,
					src: SPINES_PATH + spine,
				}))
			);

			const [imageAssets, symbolAssets] = await Promise.all([
				Assets.loadBundle('images'),
				Assets.loadBundle('symbols'),
			]);

			console.log('Images and symbols loaded successfully');

			for (const [key, texture] of Object.entries({
				...imageAssets,
				...symbolAssets,
			})) {
				textureCache[key] = texture as Texture;
			}

			try {
				const spineAssets = await Assets.loadBundle('spines');
				console.log('Spine animations loaded successfully');

				for (const [key, spine] of Object.entries(spineAssets)) {
					spineCache[key] = spine;
				}
			} catch (error) {
				console.error('Error loading spine animations:', error);
			}

			await this.loadSounds();
			console.log('Assets loaded successfully');
		} catch (error) {
			console.error('Error loading assets:', error);
			throw error;
		}
	}

	private async loadSounds(): Promise<void> {
		try {
			SOUNDS.forEach((soundFile) => {
				sound.add(soundFile.split('.')[0], SOUNDS_PATH + soundFile);
			});
		} catch (error) {
			console.error('Error loading sounds:', error);
			throw error;
		}
	}

	public static getTexture(name: string): Texture {
		return textureCache[name];
	}

	public static getTextures(bundlePrefix: string): Texture[] {
		return Object.entries(textureCache)
			.filter(([key]) => key.startsWith(`${bundlePrefix}/`))
			.map(([, texture]) => texture);
	}

	public static getSpine(name: string): any {
		return spineCache[name];
	}
}
