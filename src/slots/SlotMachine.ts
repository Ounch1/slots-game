import 'pixi-spine';
import { Application, Container, Graphics, Sprite } from 'pixi.js';
import { Spine } from 'pixi-spine';
import { Reel } from '../slots/Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';

const WIN_RATE = 1;
const REEL_COUNT = 4;
const SYMBOLS_PER_REEL = 6;
const SYMBOL_SIZE = 150;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;
const SPIN_DELAY = 200;
const TOTAL_SPIN_DURATION = 500 + (REEL_COUNT - 1) * SPIN_DELAY; // REEL_COUNT-1 for delay between the reels
const BACKGROUND_OFFSET = -20;
const BACKGROUND_PADDING = 40;

export class SlotMachine {
	public container: Container;
	private app: Application;
	private isSpinning: boolean = false;
	private spinButton: Sprite | null = null;
	private frameSpine: Spine | null = null;
	private winAnimation: Spine | null = null;
	private readonly reels: Reel[];
	private readonly totalReelWidth: number = SYMBOL_SIZE * SYMBOLS_PER_REEL;
	private readonly totalReelHeight: number =
		REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1);

	constructor(app: Application) {
		this.app = app;
		this.container = new Container();
		this.reels = [];

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
			reel.container.y = i * (REEL_HEIGHT + REEL_SPACING) + BACKGROUND_OFFSET;
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
		}, TOTAL_SPIN_DURATION);
	}

	private stopSpin(): void {
		for (let i = 0; i < this.reels.length; i++) {
			setTimeout(() => {
				this.reels[i].stopSpin();

				// If this is the last reel, check for wins and enable spin button
				if (i === this.reels.length - 1) {
					setTimeout(() => {
						this.checkWin();
						this.isSpinning = false;

						if (this.spinButton) {
							this.spinButton.texture =
								AssetLoader.getTexture('ui/button_spin.png');
							this.spinButton.interactive = true;
						}
					}, 500);
				}
			}, i * 400);
		}
	}

	private checkWin(): void {
		// Simple win check - just for demonstration
		const randomWin = Math.random() < WIN_RATE;

		if (randomWin) {
			sound.play('win');
			console.log('Winner!');

			if (this.winAnimation) {
				// TODO: Play the win animation found in "big-boom-h" spine
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
			}
		} catch (error) {
			console.error('Error initializing spine animations:', error);
		}
	}
}
