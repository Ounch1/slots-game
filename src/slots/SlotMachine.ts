import 'pixi-spine';
import { Application, Container, Graphics, Sprite } from 'pixi.js';
import { Spine } from 'pixi-spine';
import { Reel } from '../slots/Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';

const WIN_RATE = 0.3; // 30% Chance
const SYMBOLS_PER_REEL = 6;
const DELAY_BEFORE_STOP = 500; // How long the reels spin before stopping starts
const DELAY_BEFORE_WIN = 500; // Delay after last reel stops before checking win
const STOP_DELAY_BETWEEN_REELS = 400; // Delay between each reel to stop spinning
export const SPIN_DELAY = 200;
export const REEL_COUNT = 4;
export const SYMBOL_SIZE = 150;
export const REEL_SPACING = 10;
export const BACKGROUND_OFFSET = -20;
export const BACKGROUND_PADDING = 40;
export const REEL_SPIN_DURATION =
	DELAY_BEFORE_STOP + (REEL_COUNT - 1) * SPIN_DELAY; // REEL_COUNT-1 for delay between the reels

export class SlotMachine {
	public readonly totalReelWidth: number = SYMBOL_SIZE * SYMBOLS_PER_REEL;
	public readonly totalReelHeight: number =
		SYMBOL_SIZE * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1);
	public container: Container;
	private app: Application;
	private isSpinning: boolean = false;
	private spinButton: Sprite | null = null;
	private frameSpine: Spine | null = null;
	private winAnimation: Spine | null = null;
	private readonly reels: Reel[];

	constructor(app: Application) {
		this.app = app;
		this.container = new Container();
		this.reels = [];

		// For E2E
		(window as any).slotMachine = this;
		(window as any).spinDuration = REEL_SPIN_DURATION; // Small buffer

		// Center the slot machine
		this.container.x = this.app.screen.width / 2 - this.totalReelWidth / 2;
		this.container.y = this.app.screen.height / 2 - this.totalReelHeight / 2;

		this.createBackground();

		this.createReels();

		this.initSpineAnimations();
	}

	private createBackground(): void {
		try {
			const background = new Graphics();
			background.beginFill(0x000000, 0.5);
			background.drawRect(
				BACKGROUND_OFFSET,
				BACKGROUND_OFFSET,
				this.totalReelWidth + BACKGROUND_PADDING, // Width now based on symbols per reel
				this.totalReelHeight + BACKGROUND_PADDING // Height based on reel count
			);
			background.endFill();
			this.container.addChild(background);
		} catch (error) {
			console.error('Error creating background:', error);
		}
	}

	private createReels(): void {
		const symbolTextures = AssetLoader.getTextures('symbol');
		// Create each reel
		for (let i = 0; i < REEL_COUNT; i++) {
			const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE, symbolTextures);
			reel.container.y = i * (SYMBOL_SIZE + REEL_SPACING) + BACKGROUND_OFFSET;
			reel.container.x += BACKGROUND_OFFSET;
			this.container.addChild(reel.container);
			this.reels.push(reel);
		}
	}

	public update(delta: number): void {
		// Update each reel
		for (const reel of this.reels) {
			reel.update(delta);
		}
	}

	public spin(): void {
		if (this.isSpinning) return;

		this.isSpinning = true;

		// Play spin sound
		sound.play('Reel spin');

		// Disable spin button
		if (this.spinButton) {
			this.spinButton.texture = AssetLoader.getTexture(
				'ui/button_spin_disabled.png'
			);
			this.spinButton.interactive = false;
		}

		for (let i = 0; i < this.reels.length; i++) {
			setTimeout(() => {
				this.reels[i].startSpin();
			}, i * SPIN_DELAY);
		}

		// Stop all reels after a delay
		setTimeout(() => {
			this.stopSpin();
		}, REEL_SPIN_DURATION);
	}

	private stopSpin(): void {
		for (let i = 0; i < this.reels.length; i++) {
			setTimeout(() => {
				this.reels[i].stopSpin();

				// If this is the last reel, check for wins and enable spin button
				if (i === this.reels.length - 1) {
					sound.stop('Reel spin');
					setTimeout(() => {
						this.checkWin();
						this.isSpinning = false;

						if (this.spinButton) {
							this.spinButton.texture =
								AssetLoader.getTexture('ui/button_spin.png');
							this.spinButton.interactive = true;
						}
					}, DELAY_BEFORE_WIN);
				}
			}, i * STOP_DELAY_BETWEEN_REELS);
		}
	}

	private checkWin(): void {
		// Simple win check - just for demonstration
		const randomWin = Math.random() < WIN_RATE;

		if (randomWin) {
			sound.play('win');
			console.log('Winner!');

			if (this.winAnimation) {
				this.winAnimation.visible = true;
				this.winAnimation.state.setAnimation(0, 'start', false);
			} else {
				console.warn(`Spine ${this.winAnimation} is null`);
			}
		}
	}

	public setSpinButton(button: Sprite): void {
		this.spinButton = button;
	}

	private initSpineAnimations(): void {
		try {
			const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
			if (frameSpineData) {
				this.frameSpine = new Spine(frameSpineData.spineData);

				this.frameSpine.y = this.totalReelHeight / 2;
				this.frameSpine.x = this.totalReelWidth / 2;

				if (this.frameSpine.state.hasAnimation('idle')) {
					this.frameSpine.state.setAnimation(0, 'idle', true);
				}

				this.container.addChild(this.frameSpine);
			}

			const winSpineData = AssetLoader.getSpine('big-boom-h.json');
			if (winSpineData) {
				this.winAnimation = new Spine(winSpineData.spineData);

				this.winAnimation.x = this.totalReelHeight / 2;
				this.winAnimation.y = this.totalReelWidth / 2;

				this.winAnimation.visible = false;

				this.container.addChild(this.winAnimation);

				this.winAnimation!.state.addListener({
					complete: () => {
						this.winAnimation!.visible = false;
					},
				});
			}
		} catch (error) {
			console.error('Error initializing spine animations:', error);
		}
	}

	/**
	 * Return if it's currently spinning.
	 */
	public get isSpinningStatus(): boolean {
		return this.isSpinning;
	}
}
