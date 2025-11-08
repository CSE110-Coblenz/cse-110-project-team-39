import { ScreenManager } from './core/ScreenManager';
import { LoginScreenController } from './screens/LoginScreen/LoginScreenController';
import { MenuScreenController } from './screens/MenuScreen/MenuScreenController'; // ADD THIS
import { DIMENSIONS } from './constants';

class NumberNovaApp {
    private screenManager: ScreenManager;
    
    constructor() {
        this.initialize();
    }
    
    private initialize(): void {
        // Create screen manager
        this.screenManager = new ScreenManager(
            'game-container',
            DIMENSIONS.width,
            DIMENSIONS.height
        );
        
        // Register screens
        this.registerScreens();
        
        // Start with login screen
        this.screenManager.switchTo('login');
    }
    
    private registerScreens(): void {
        // Register login screen
        const loginScreen = new LoginScreenController(this.screenManager);
        this.screenManager.registerScreen('login', loginScreen);
        
        // REGISTER MENU SCREEN
        const menuScreen = new MenuScreenController(this.screenManager);
        this.screenManager.registerScreen('menu', menuScreen);
        
        // TODO: Register other screens as they are implemented
        // this.screenManager.registerScreen('signup', new SignUpScreenController(this.screenManager));
        // etc...     
    }
}

// Start the application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new NumberNovaApp();
});