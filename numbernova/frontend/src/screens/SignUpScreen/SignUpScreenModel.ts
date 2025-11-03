export class SignUpScreenModel {
    private isLoading: boolean = false;
    
    public validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    public validatePassword(password: string): boolean {
        // Minimum 6 characters for young users
        return password.length >= 6;
    }
    
    public validatePasswordsMatch(password: string, confirmPassword: string): boolean {
        return password === confirmPassword;
    }
    
    public async signup(email: string, password: string): Promise<boolean> {
        this.isLoading = true;
        
        // Simulate API call
        // In production, this would call the backend API
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isLoading = false;
                // For now, always return true
                resolve(true);
            }, 1000);
        });
    }
    
    public getIsLoading(): boolean {
        return this.isLoading;
    }
}