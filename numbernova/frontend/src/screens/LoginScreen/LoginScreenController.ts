import { LoginScreenView } from './LoginScreenView';
import { LoginScreenModel } from './LoginScreenModel';
import { BaseScreen } from '../../core/BaseScreen';

export class LoginScreenController extends BaseScreen {
    private view: LoginScreenView;
    private model: LoginScreenModel;
    
    protected initialize(): void {
        this.model = new LoginScreenModel();
        this.view = new LoginScreenView(this.container);
        
        this.setupEventListeners();
        
        // Trigger a draw to position inputs correctly
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
    
    private handleLogin(): void {
        const email = this.view.getEmailValue().trim();
        const password = this.view.getPasswordValue().trim();
        
        // Validate inputs
        if (!email || !password) {
            console.log('Please fill in all fields');
            // In the future: show error message to user
            return;
        }
        
        console.log('Login clicked!', { email, password });
        
        // For now, just log the values
        // In the future: validate credentials, then switch to menu
        // this.screenManager.switchTo('menu');
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