export class LoginScreenModel {
    private isLoading: boolean = false;
    
    public async login(email: string, password: string): Promise<boolean> {
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