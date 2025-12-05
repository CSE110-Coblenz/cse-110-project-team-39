import { SignUpScreenView } from './SignUpScreenView';
import { SignUpScreenModel } from './SignUpScreenModel';
import { BaseScreen } from '../../core/BaseScreen';

import { signUpWithEmail, updateUserProfile } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';

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
        this.screenManager.switchTo('menu');
    }

    private switchToLoginScreen(): void {
        this.screenManager.switchTo('login');
    }
    
    private async handleSignup(): Promise<void> {
        const email = this.view.getEmailValue().trim();
        const displayName = this.view.getDisplayNameValue().trim();
        const password = this.view.getPasswordValue().trim();
        const confirmPassword = this.view.getConfirmPasswordValue().trim();


        if (!email || !password || !confirmPassword) {
            createNotification('Please fill in all fields', 'warning');

            return;
        }


        if (!this.model.validateEmail(email)) {
            createNotification('Please enter a valid email', 'error');
            return;
        }


        // Validate display name if provided
        if (displayName && !this.model.validateDisplayName(displayName)) {
            console.log('Display name must be 30 characters or less and contain only letters, numbers, spaces, hyphens, underscores, and periods');
            return;
        }



        if (!this.model.validatePassword(password)) {
            createNotification('Password must be at least 6 characters', 'error');
            return;
        }


        if (!this.model.validatePasswordsMatch(password, confirmPassword)) {
            createNotification('Passwords do not match', 'error');
            return;
        }



        const { data, error } = await signUpWithEmail(email, password);

        if (error) {
            console.error('Error signing up:', error);
            createNotification('Error creating account. Please try again. ' + error.message, 'error');
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


        createNotification('Account created successfully!', 'success');

        this.switchToMenuScreen();
    }
    
    private handleBackToLogin(): void {
        this.switchToLoginScreen();
    }
    
    public show(): void {
        super.show();

        // Focus email input after a short delay
        setTimeout(() => {
            this.view.focusEmailInput();
        }, 100);
    }
}
