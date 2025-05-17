import * as PIXI from 'pixi.js';
import { SlotMachine } from '../../src/slots/SlotMachine';

let app: PIXI.Application;
let slotMachine: SlotMachine;

beforeEach(() => {
	app = new PIXI.Application({ width: 800, height: 600, forceCanvas: true });
	slotMachine = new SlotMachine(app);
});

afterEach(() => {
	app.destroy(true, { children: true });
});

describe('SlotMachine', () => {
	test.todo('initializes container and reels correctly');
});
