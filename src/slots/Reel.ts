import { Container, Resource, Sprite, Texture } from 'pixi.js';

const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down

export class Reel {
	private speed: number = 0;
	public container: Container;
	private isSpinning: boolean = false;
	private readonly SYMBOL_TEXTURES: Texture<Resource>[];
	private readonly symbols: Sprite[];
	private readonly symbolSize: number;
	private readonly symbolCount: number;
	private readonly symbolOffset: number;
	private readonly snapPoints: number[] = [];

	constructor(
		symbolCount: number,
		symbolSize: number,
		textures: Texture<Resource>[],
		symbolOffset: number
	) {
		this.container = new Container();
		this.symbols = [];
		this.symbolSize = symbolSize;
		this.symbolCount = symbolCount;
		this.SYMBOL_TEXTURES = textures;
		this.symbolOffset = symbolOffset;

		this.createSymbols();

		for (let i = 0; i < this.symbols.length; i++) {
			this.snapPoints[i] = i * this.symbolSize + this.symbolOffset;
		}
	}

	private createSymbols(): void {
		for (let i = 0; i < this.symbolCount; i++) {
			const symbol = this.createRandomSymbol();
			this.symbols.push(symbol);
			this.container.addChild(symbol);
			// TODO: Make the offset apply to the container, instead of the symbols individually.
			// Note: Ran into a problem, where offset would apply to containers X but not Y axis, will fix later.
			symbol.x = this.symbolSize * i + this.symbolOffset;
			symbol.y += this.symbolOffset;
		}
	}

	private createRandomSymbol(): Sprite {
		const randomIndex = Math.floor(Math.random() * this.SYMBOL_TEXTURES.length);
		return new Sprite(this.SYMBOL_TEXTURES[randomIndex]);
	}

	public update(delta: number): void {
		if (!this.isSpinning && this.speed === 0) return;

		const rightBound = this.getRightBound();
		const totalWidth = this.getTotalWidth();

		for (let i = 0; i < this.symbols.length; i++) {
			const symbol = this.symbols[i];
			symbol.x += this.speed * delta;

			if (symbol.x > rightBound) {
				symbol.x -= totalWidth;

				this.symbols.splice(i, 1);
				this.symbols.unshift(symbol);
			}
		}

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

	private getRightBound(): number {
		return this.symbols.length * this.symbolSize - this.symbolSize / 2;
	}

	private getTotalWidth(): number {
		return this.symbols.length * this.symbolSize;
	}

	private snapToGrid(): void {
		this.symbols.forEach((symbol, i) => {
			symbol.x = this.snapPoints[i];
		});
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
