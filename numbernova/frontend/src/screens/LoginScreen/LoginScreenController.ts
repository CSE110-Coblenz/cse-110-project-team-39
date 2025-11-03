import { LoginScreenView } from './LoginScreenView';
import { LoginScreenModel } from './LoginScreenModel';
import { BaseScreen } from '../../core/BaseScreen';
import { MenuScreenController } from '../MenuScreen/MenuScreenController';
import { signInWithEmail } from '../../lib/supabase';
export class LoginScreenController extends BaseScreen {
    private view: LoginScreenView;
    private model: LoginScreenModel;
    
    protected initialize(): void {
        this.model = new LoginScreenModel();
        this.view = new LoginScreenView(this.container);
        
        // TEMPORARY: Test if we can manually trigger login
        setTimeout(() => {
            console.log('Auto-triggering login in 2 seconds...');
            this.handleLogin();
        }, 2000);
        
        this.setupEventListeners();
        
        setTimeout(() => {
            this.container.getStage()?.draw();
        }, 100);
    }
    
    private setupEventListeners(): void {
        // Login button click
        this.view.getLoginButton().on('click', () => {
            this.handleLogin();
        });
        
        // Create account link click
        this.view.getCreateAccountButton().on('click', () => {
            this.handleCreateAccount();
        });
    }
    private switchToMenuScreen(): void {
        // Get the current stage and layer
        const stage = this.container.getStage();
        if (!stage) return;
        
        // Remove ALL layers from the stage
        stage.destroyChildren(); // This removes everything
        
        // Create and add menu layer
        const menuLayer = new Konva.Layer();
        stage.add(menuLayer);
        
        // Initialize menu screen
        new MenuScreenController(menuLayer);
        
        stage.draw();
        console.log('Switched to menu screen!');
    }

    private async handleLogin(): Promise<void> {
        const email = this.view.getEmailValue().trim();
        const password = this.view.getPasswordValue().trim();
        
        if (!email || !password) {
            console.log('Please fill in all fields');
            return;
        }
        
        console.log('Login clicked!', { email, password });
        
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
            console.error('Error signing in:', error);
            return;
        }
        console.log('Signed in successfully:', data);
        this.switchToMenuScreen();
    }
    
    private handleCreateAccount(): void {
        console.log('Create account clicked!');
        // In the future: switch to signup screen
        // this.screenManager.switchTo('signup');
    }
    
    public show(): void {
        super.show();
        this.view.animateStars();
        
        // Focus email input after a short delay
        setTimeout(() => {
            this.view.focusEmailInput();
        }, 100);
    }
}