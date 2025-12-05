import { LoginScreenView } from './LoginScreenView';
import { LoginScreenModel } from './LoginScreenModel';
import { BaseScreen } from '../../core/BaseScreen';
import { signInWithEmail } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';

export class LoginScreenController extends BaseScreen {
    private view: LoginScreenView;
    private model: LoginScreenModel;
    
    protected initialize(): void {
        this.model = new LoginScreenModel();
        
        // Use the container that BaseScreen provides (from ScreenManager)
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
        
        // Use screen manager to switch screens
        this.screenManager.switchTo('menu');
    }
    
    private handleCreateAccount(): void {
        this.screenManager.switchTo('signup');
    }
    
    public show(): void {
        super.show();

        // Focus email input after a short delay
        setTimeout(() => {
            this.view.focusEmailInput();
        }, 100);
    }
}