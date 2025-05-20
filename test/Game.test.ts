import { Game } from '@/Game';

// PIXI.js
jest.mock('pixi.js', () => {
    class MockContainer {
        addChild = jest.fn((child) => {
            this.children.push(child);
            return child;
        });
        removeChild = jest.fn((child) => {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
            }
            return child;
        });
        destroy = jest.fn();
        children: any[] = [];
        scale = { set: jest.fn() };
        position = { set: jest.fn() };
        pivot = { set: jest.fn() };
        x = 0;
        y = 0;
    }

    class MockRenderer {
        resize = jest.fn();
        destroy = jest.fn();
    }

    class MockTicker {
        // eslint-disable-next-line @typescript-eslint/ban-types
        private callbacks: Function[] = [];
        add = jest.fn((callback) => {
            this.callbacks.push(callback);
        });
        remove = jest.fn((callback) => {
            const index = this.callbacks.indexOf(callback);
            if (index > -1) {
                this.callbacks.splice(index, 1);
            }
        });
        emit = jest.fn((event, delta) => {
            this.callbacks.forEach(callback => callback(delta));
        });
    }

    return {
        Application: jest.fn().mockImplementation(() => ({
            stage: new MockContainer(),
            view: document.createElement('canvas'),
            screen: { width: 1280, height: 800 },
            renderer: new MockRenderer(),
            ticker: new MockTicker(),
            destroy: jest.fn(),
        })),
        Container: MockContainer,
        Texture: { EMPTY: {} },
        Sprite: jest.fn().mockImplementation(() => ({
            interactive: true,
            on: jest.fn(),
            off: jest.fn(),
            destroy: jest.fn(),
        })),
    };
});

// AssetLoader
jest.mock('@/utils/AssetLoader', () => {
    class MockAssetLoader {
        loadAssets = jest.fn().mockResolvedValue(undefined);
        getTexture = jest.fn().mockReturnValue({});
        getTextures = jest.fn().mockReturnValue([{}, {}, {}, {}]);
        getSpine = jest.fn().mockReturnValue({ spineData: {} });
    }
    return {
        AssetLoader: MockAssetLoader,
    };
});

// SlotMachine
jest.mock('@/slots/SlotMachine', () => ({
    SlotMachine: jest.fn().mockImplementation(() => ({
        container: { destroy: jest.fn() },
        update: jest.fn(),
        spin: jest.fn(),
        setSpinButton: jest.fn(),
    })),
}));

// UI
jest.mock('@/ui/UI', () => ({
    UI: jest.fn().mockImplementation(() => ({
        container: { destroy: jest.fn() },
    })),
}));

describe('Game (integration)', () => {
    let game: Game;

    beforeEach(() => {
        // container in the DOM for PIXI to render into
        document.body.innerHTML = '<div id="game-container"></div>';
        game = new Game();
    });

    afterEach(() => {
        // clean up PIXI canvas and DOM
        const container = document.getElementById('game-container');
        if (container) container.innerHTML = '';
        if (game && (game as any).app && (game as any).app.destroy) {
            (game as any).app.destroy(true, { children: true, texture: true, baseTexture: true });
        }
    });

    it('initializes and attaches PIXI view to DOM', async () => {
        await game.init();
        const container = document.getElementById('game-container');
        // PIXI app.view
        expect(container?.children.length).toBeGreaterThan(0);
    });

    it('creates slotMachine and UI after init', async () => {
        await game.init();
        expect((game as any).slotMachine).toBeDefined();
        expect((game as any).ui).toBeDefined();
    });

    it('adds slotMachine and UI containers to the PIXI stage', async () => {
        await game.init();
        const app = (game as any).app;
        const slotMachine = (game as any).slotMachine;
        const ui = (game as any).ui;
        // Check that both containers are children of the stage
        const stageChildren = app.stage.children;
        expect(stageChildren).toContain(slotMachine.container);
        expect(stageChildren).toContain(ui.container);
    });

    it('calls update on slotMachine when ticker runs', async () => {
        await game.init();
        const slotMachine = (game as any).slotMachine;
        const spy = jest.spyOn(slotMachine, 'update');
        // Simulate a ticker update
        (game as any).app.ticker.emit('tick', 1);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('resizes the renderer when the window is resized', async () => {
        await game.init();
        const app = (game as any).app;
        const resizeSpy = jest.spyOn(app.renderer, 'resize');
        // Simulate window resize
        window.dispatchEvent(new Event('resize'));
        expect(resizeSpy).toHaveBeenCalled();
        resizeSpy.mockRestore();
    });

    it('does not throw if init is called multiple times', async () => {
        await expect(game.init()).resolves.not.toThrow();
        await expect(game.init()).resolves.not.toThrow();
    });

    it('logs an error if asset loading fails', async () => {
        // Temporarily replace loadAssets to throw
        const originalLoadAssets = (game as any).assetLoader.loadAssets;
        (game as any).assetLoader.loadAssets = jest.fn().mockRejectedValue(new Error('fail'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        await game.init();
        expect(errorSpy).toHaveBeenCalled();
        (game as any).assetLoader.loadAssets = originalLoadAssets;
        errorSpy.mockRestore();
    });
});