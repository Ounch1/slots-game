import { Container, Sprite, Texture } from 'pixi.js';

const SYMBOL_TEXTURES = [
	'symbol1.png',
	'symbol2.png',
	'symbol3.png',
	'symbol4.png',
	'symbol5.png',
];

const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down

export class Reel {
	public container: Container;
	private symbols: Sprite[];
	private readonly symbolSize: number;
	private readonly symbolCount: number;
	private speed: number = 0;
	private isSpinning: boolean = false;

	constructor(symbolCount: number, symbolSize: number, symbolOffset: number) {
		this.container = new Container();
		this.symbols = [];
		this.symbolSize = symbolSize;
		this.symbolCount = symbolCount;

		this.createSymbols(symbolOffset);
	}

	private createSymbols(symbolOffset: number): void {
		for (let i = 0; i < this.symbolCount; i++) {
			const symbol = this.createRandomSymbol();
			this.symbols.push(symbol);
			this.container.addChild(symbol);
			// TODO: Make the offset apply to the container, instead of the symbols individually.
			// Note: Ran into a problem, where offset would apply to containers X but not Y axis, will fix later.
			symbol.x = this.symbolSize * i + symbolOffset;
			symbol.y += symbolOffset;
		}
	}

	private createRandomSymbol(): Sprite {
		const randomIndex = Math.floor(Math.random() * SYMBOL_TEXTURES.length);
		const texture = Texture.from(SYMBOL_TEXTURES[randomIndex]);
		return new Sprite(texture);
	}

	public update(delta: number): void {
		if (!this.isSpinning && this.speed === 0) return;

		// TODO:Move symbols horizontally

		// If we're stopping, slow down the reel
		if (!this.isSpinning && this.speed > 0) {
			this.speed *= SLOWDOWN_RATE;

			// If speed is very low, stop completely and snap to grid
			if (this.speed < 0.5) {
				this.speed = 0;
				this.snapToGrid();
			}
		}
	}

	private snapToGrid(): void {
		// TODO: Snap symbols to horizontal grid positions
	}

	public startSpin(): void {
		this.isSpinning = true;
		this.speed = SPIN_SPEED;
	}

	public stopSpin(): void {
		this.isSpinning = false;
		// The reel will gradually slow down in the update method
	}
}
