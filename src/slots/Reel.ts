import { Container, Resource, Sprite, Texture } from 'pixi.js';

const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down
const STOP_THRESHOLD = 0.5; // Speed threshold, at which movement will stop

export class Reel {
	public readonly container: Container;

	private speed: number = 0;
	private isSpinning: boolean = false;

	private readonly textures: Texture<Resource>[];
	private readonly symbols: Sprite[] = [];

	private readonly symbolSize: number;
	private readonly symbolCount: number;

	constructor(
		symbolCount: number,
		symbolSize: number,
		textures: Texture<Resource>[]
	) {
		this.container = new Container();
		this.symbols = [];
		this.symbolSize = symbolSize;
		this.symbolCount = symbolCount;
		this.textures = textures;

		this.createSymbols();
	}

	private getSnapPosition(index: number): number {
		return index * this.symbolSize;
	}

	private createSymbols(): void {
		for (let i = 0; i < this.symbolCount; i++) {
			const symbol = this.createRandomSymbol();
			this.symbols.push(symbol);

			symbol.x = this.getSnapPosition(i);

			this.container.addChild(symbol);
		}
	}

	private createRandomSymbol(): Sprite {
		const randomIndex = Math.floor(Math.random() * this.textures.length);
		return new Sprite(this.textures[randomIndex]);
	}

	public update(delta: number): void {
		if (!this.isSpinning && this.speed === 0) return;

		// For a smoother wrapping, I want the symbols to wrap when they are half-way through the bound, not all the way.
		const rightBound =
			this.symbols.length * this.symbolSize - this.symbolSize / 2;
		const totalWidth = this.symbols.length * this.symbolSize;

		for (let i = 0; i < this.symbols.length; i++) {
			const symbol = this.symbols[i];
			symbol.x += this.speed * delta;

			// Wrap around logics
			if (symbol.x > rightBound) {
				symbol.x -= totalWidth;

				// Reorder the array, last element goes into the beginning.
				this.symbols.splice(i, 1);
				this.symbols.unshift(symbol);
				i--; // Adjust the index
			}
		}

		// If we're stopping, slow down the reel
		if (!this.isSpinning && this.speed > 0) {
			this.speed *= SLOWDOWN_RATE;

			// If speed is very low, stop completely and snap to grid
			if (this.speed < STOP_THRESHOLD) {
				this.speed = 0;
				this.snapToGrid();
			}
		}
	}

	private snapToGrid(): void {
		this.symbols.forEach((symbol, i) => {
			symbol.x = this.getSnapPosition(i);
		});
	}

	/**
	 * Starts the reel spinning at full speed.
	 */
	public startSpin(): void {
		this.isSpinning = true;
		this.speed = SPIN_SPEED;
	}

	/**
	 * Gradually stops the spin.
	 */
	public stopSpin(): void {
		// The reel will gradually slow down in the update method
		this.isSpinning = false;
	}

	/**
	 * Destroy the reel
	 */
	public destroy(): void {
		this.symbols.forEach((symbol) => symbol.destroy());
		this.container.destroy({
			children: true,
			texture: true,
			baseTexture: true,
		});
	}
}
