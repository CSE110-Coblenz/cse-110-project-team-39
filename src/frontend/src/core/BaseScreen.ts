import Konva from 'konva';
import { IScreen } from './ScreenManager';

export abstract class BaseScreen implements IScreen {
    public container: Konva.Layer;
    protected screenManager: any; // Will be properly typed when we create the app structure

    constructor(screenManager: any) {
        this.screenManager = screenManager;
        this.container = new Konva.Layer();
        this.initialize();
    }

    protected abstract initialize(): void;

    public show(): void {
        this.container.visible(true);
    }

    public hide(): void {
        this.container.visible(false);
    }

    public update(deltaTime: number): void {
        // Override in subclasses if needed
    }

    public destroy(): void {
        this.container.destroy();
    }
}