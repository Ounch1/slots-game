import * as PIXI from 'pixi.js';
import { UI } from '@/ui/UI';
import { sound } from '@/utils/sound';

// PIXI.Application and related classes
jest.mock('pixi.js', () => {
    const actual = jest.requireActual('pixi.js');
    // eslint-disable-next-line @typescript-eslint/ban-types
    let pointerDownCallback: Function | null = null;

    const mockSprite = jest.fn().mockImplementation(() => ({
        anchor: { set: jest.fn() },
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        interactive: false,
        cursor: '',
        on: jest.fn((event, callback) => {
            if (event === 'pointerdown') {
                pointerDownCallback = callback;
            }
        }),
        emit: jest.fn((event) => {
            if (event === 'pointerdown' && pointerDownCallback) {
                pointerDownCallback();
            }
        }),
        scale: { set: jest.fn() }
    }));

    const containerChildren: any[] = [];
    const mockContainer = jest.fn().mockImplementation(() => ({
        children: containerChildren,
        addChild: jest.fn((child) => {
            containerChildren.push(child);
            return child;
        })
    }));

    return {
        ...actual,
        Application: jest.fn().mockImplementation(() => ({
            stage: mockContainer(),
            view: document.createElement('canvas'),
            screen: { width: 800, height: 600 },
            renderer: {
                plugins: {
                    interaction: {
                        destroy: jest.fn(),
                    },
                },
            },
        })),
        Container: mockContainer,
        Sprite: mockSprite,
    };
});

jest.mock('@/utils/AssetLoader', () => ({
    AssetLoader: {
        getTexture: jest.fn(() => ({})),
    },
}));

jest.mock('@/utils/sound', () => ({
    sound: { play: jest.fn() },
}));

describe('UI', () => {
    let app: PIXI.Application;
    let slotMachine: { spin: jest.Mock, setSpinButton: jest.Mock };

    beforeEach(() => {
        app = new PIXI.Application();
        slotMachine = {
            spin: jest.fn(),
            setSpinButton: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('creates a spin button and adds it to the container', () => {
        const ui = new UI(app, slotMachine as any);
        expect(ui.container.children.length).toBeGreaterThan(0);
        expect(slotMachine.setSpinButton).toHaveBeenCalled();
    });

    it('calls slotMachine.spin and plays sound when spin button is clicked', () => {
        const ui = new UI(app, slotMachine as any);
        const spinButton = (ui as any).spinButton as PIXI.Sprite;
        spinButton.emit('pointerdown', {} as PIXI.FederatedPointerEvent);
        expect(sound.play).toHaveBeenCalledWith('Spin button');
        expect(slotMachine.spin).toHaveBeenCalled();
    });
});