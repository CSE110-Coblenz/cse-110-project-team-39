import { LoginScreenView } from './LoginScreenView';
import { LoginScreenModel } from './LoginScreenModel';
import { BaseScreen } from '../../core/BaseScreen';
import { MenuScreenController } from '../MenuScreen/MenuScreenController';
import { SignUpScreenController } from '../SignUpScreen/SignUpScreenController';
import { signInWithEmail } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';
import Konva from 'konva';
export class LoginScreenController extends BaseScreen {
    private view: LoginScreenView;
    private model: LoginScreenModel;
    
    protected initialize(): void {
        this.model = new LoginScreenModel();
        this.view = new LoginScreenView(this.container);

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
    }

    private async handleLogin(): Promise<void> {
        const email = this.view.getEmailValue().trim();
        const password = this.view.getPasswordValue().trim();

        if (!email || !password) {
            createNotification('Please fill in all fields', 'warning');
            return;
        }

        const { data, error } = await signInWithEmail(email, password);
        if (error) {
            console.error('Error signing in:', error);
            createNotification('Invalid email or password', 'error');
            return;
        }

        createNotification('Login successful!', 'success');
        this.switchToMenuScreen();
    }
    
    private handleCreateAccount(): void {
        this.screenManager.switchTo('signup');
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
