import { ScreenManager } from './core/ScreenManager';
import { LoginScreenController } from './screens/LoginScreen/LoginScreenController';
import { SignUpScreenController } from './screens/SignUpScreen/SignUpScreenController';
import { MenuScreenController } from './screens/MenuScreen/MenuScreenController';
import { ShopScreenController } from './screens/ShopScreen/ShopScreenController';
import { LeaderboardScreenController } from './screens/LeaderboardScreen/LeaderboardScreenController';
import { ProfileScreenController } from './screens/ProfileScreen/ProfileScreenController';
import { DIMENSIONS } from './constants';

class NumberNovaApp {
    private screenManager: ScreenManager;
    
    constructor() {
        this.initialize();
    }
    
    private initialize(): void {
        this.screenManager = new ScreenManager(
            'game-container',
            DIMENSIONS.width,
            DIMENSIONS.height
        );
        
        this.registerScreens();
        this.screenManager.switchTo('login');
    }
    
    private registerScreens(): void {
        // Register all screens
        this.screenManager.registerScreen('login', new LoginScreenController(this.screenManager));
        this.screenManager.registerScreen('signup', new SignUpScreenController(this.screenManager));
        this.screenManager.registerScreen('menu', new MenuScreenController(this.screenManager));
        this.screenManager.registerScreen('shop', new ShopScreenController(this.screenManager));
        this.screenManager.registerScreen('leaderboard', new LeaderboardScreenController(this.screenManager));
        this.screenManager.registerScreen('profile', new ProfileScreenController(this.screenManager));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new NumberNovaApp();
});