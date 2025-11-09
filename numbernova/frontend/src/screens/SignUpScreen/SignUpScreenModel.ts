export class SignUpScreenModel {
    private isLoading: boolean = false;
    private displayName: string = '';

    public validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public validateDisplayName(displayName: string): boolean {
        // Optional field - empty is valid
        if (!displayName || displayName.trim() === '') {
            return true;
        }
        // Max 30 characters, alphanumeric, spaces, and basic punctuation
        if (displayName.length > 30) {
            return false;
        }
        // Allow letters, numbers, spaces, hyphens, underscores, and periods
        const displayNameRegex = /^[a-zA-Z0-9\s\-_.]+$/;
        return displayNameRegex.test(displayName);
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

    public getDisplayName(): string {
        return this.displayName;
    }

    public setDisplayName(displayName: string): void {
        this.displayName = displayName;
    }
}