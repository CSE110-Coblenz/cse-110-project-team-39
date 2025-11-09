import Konva from 'konva';

export interface IScreen {
    container: Konva.Layer;
    show(): void;
    hide(): void;
    update?(deltaTime: number): void;
    destroy(): void;
}

export class ScreenManager {
    private stage: Konva.Stage;
    private screens: Map<string, IScreen> = new Map();
    private currentScreen: IScreen | null = null;
    private currentScreenName: string | null = null;

    constructor(containerId: string, width: number = 1200, height: number = 800) {
        // Store base dimensions
        this.baseWidth = width;
        this.baseHeight = height;
        
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }
    
    private baseWidth: number;
    private baseHeight: number;

    private handleResize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate scale to maintain aspect ratio
        const scale = Math.min(
            windowWidth / this.baseWidth,
            windowHeight / this.baseHeight
        );
        
        // Update stage dimensions to fill window
        this.stage.width(windowWidth);
        this.stage.height(windowHeight);
        
        // Scale and center the content
        this.stage.scale({ x: scale, y: scale });
        
        // Center the content if aspect ratios don't match
        const scaledWidth = this.baseWidth * scale;
        const scaledHeight = this.baseHeight * scale;
        const x = (windowWidth - scaledWidth) / 2;
        const y = (windowHeight - scaledHeight) / 2;
        
        this.stage.position({ x, y });
        this.stage.draw();
    }

    public registerScreen(name: string, screen: IScreen): void {
        this.screens.set(name, screen);
        this.stage.add(screen.container);
        screen.hide();
    }

    public switchTo(screenName: string): void {
        const nextScreen = this.screens.get(screenName);

        if (!nextScreen) {
            console.error(`Screen "${screenName}" not found!`);
            return;
        }

        // Hide current screen
        if (this.currentScreen) {
            this.currentScreen.hide();
        }

        // Show new screen
        this.currentScreen = nextScreen;
        this.currentScreenName = screenName;
        this.currentScreen.show();
        this.stage.draw();
    }

    public getStage(): Konva.Stage {
        return this.stage;
    }

    public getCurrentScreenName(): string | null {
        return this.currentScreenName;
    }

    public update(deltaTime: number): void {
        if (this.currentScreen && this.currentScreen.update) {
            this.currentScreen.update(deltaTime);
            this.stage.draw();
        }
    }

    public destroy(): void {
        this.screens.forEach(screen => screen.destroy());
        this.screens.clear();
        this.stage.destroy();
        window.removeEventListener('resize', () => this.handleResize());
    }
}