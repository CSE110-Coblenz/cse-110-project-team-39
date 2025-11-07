import { SignUpScreenView } from './SignUpScreenView';
import { SignUpScreenModel } from './SignUpScreenModel';
import { BaseScreen } from '../../core/BaseScreen';
import { MenuScreenController } from '../MenuScreen/MenuScreenController';
import { LoginScreenController } from '../LoginScreen/LoginScreenController';
import { signUpWithEmail, updateUserProfile } from '../../lib/supabase';
import Konva from 'konva';

export class SignUpScreenController extends BaseScreen {
    private view: SignUpScreenView;
    private model: SignUpScreenModel;
    
    protected initialize(): void {
        this.model = new SignUpScreenModel();
        this.view = new SignUpScreenView(this.container);
        
        this.setupEventListeners();
        
        setTimeout(() => {
            this.container.getStage()?.draw();
        }, 100);
    }
    
    private setupEventListeners(): void {
        // Signup button click
        this.view.getSignupButton().on('click', () => {
            this.handleSignup();
        });
        
        // Already have account link click
        this.view.getLoginButton().on('click', () => {
            this.handleBackToLogin();
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
    
    private switchToLoginScreen(): void {
        const stage = this.container.getStage();
        if (!stage) return;
    
        stage.destroyChildren();
    
        const loginScreen = new LoginScreenController(this.screenManager);
        stage.add(loginScreen.container);
        loginScreen.show();
        stage.draw();
        console.log('Switched to login screen!');
    }
    
    private async handleSignup(): Promise<void> {
        const email = this.view.getEmailValue().trim();
        const displayName = this.view.getDisplayNameValue().trim();
        const password = this.view.getPasswordValue().trim();
        const confirmPassword = this.view.getConfirmPasswordValue().trim();

        // Required fields check (display name is optional)
        if (!email || !password || !confirmPassword) {
            console.log('Please fill in all required fields');
            return;
        }

        if (!this.model.validateEmail(email)) {
            console.log('Please enter a valid email');
            return;
        }

        // Validate display name if provided
        if (displayName && !this.model.validateDisplayName(displayName)) {
            console.log('Display name must be 30 characters or less and contain only letters, numbers, spaces, hyphens, underscores, and periods');
            return;
        }

        if (!this.model.validatePassword(password)) {
            console.log('Password must be at least 6 characters');
            return;
        }

        if (!this.model.validatePasswordsMatch(password, confirmPassword)) {
            console.log('Passwords do not match');
            return;
        }

        console.log('Signup clicked!', { email, displayName });

        const { data, error } = await signUpWithEmail(email, password);
        if (error) {
            console.error('Error signing up:', error);
            return;
        }

        console.log('Signed up successfully:', data);

        // Update user profile with display name if provided
        if (data?.user?.id && displayName) {
            const updateResult = await updateUserProfile(data.user.id, {
                profile_name: displayName
            });
            if (updateResult) {
                console.log('Profile updated with display name:', displayName);
            }
        }

        this.switchToMenuScreen();
    }
    
    private handleBackToLogin(): void {
        console.log('Back to login clicked!');
        this.switchToLoginScreen();
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
