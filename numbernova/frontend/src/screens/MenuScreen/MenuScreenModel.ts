export class MenuScreenModel {
    private levelStates: Map<number, 'won' | 'lost' | null> = new Map();

    constructor() {
        // Initialize all 5 levels as not completed
        for (let i = 1; i <= 5; i++) {
            this.levelStates.set(i, null);
        }
        this.loadLevelStates();
    }

    private loadLevelStates(): void {
        try {
            const saved = localStorage.getItem('levelStates');
            if (saved) {
                const parsed = JSON.parse(saved);
                for (const [level, state] of Object.entries(parsed)) {
                    this.levelStates.set(parseInt(level), state as 'won' | 'lost' | null);
                }
            }
        } catch (e) {
            console.error('Failed to load level states:', e);
        }
    }

    private saveLevelStates(): void {
        try {
            const obj: { [key: string]: string | null } = {};
            this.levelStates.forEach((state, level) => {
                obj[level] = state;
            });
            localStorage.setItem('levelStates', JSON.stringify(obj));
        } catch (e) {
            console.error('Failed to save level states:', e);
        }
    }

    public setLevelState(level: number, state: 'won' | 'lost'): void {
        const currentState = this.levelStates.get(level);
        
        // If you won, always set to won (it's permanent)
        if (state === 'won') {
            this.levelStates.set(level, 'won');
        } 
        // If you lost, only set to lost if you haven't won yet
        else if (state === 'lost' && currentState !== 'won') {
            this.levelStates.set(level, 'lost');
        }
        // Otherwise, don't change the state (keep the win)
        
        this.saveLevelStates();
    }

    public getLevelState(level: number): 'won' | 'lost' | null {
        return this.levelStates.get(level) ?? null;
    }

    public hasCompletedLevel(level: number): boolean {
        return this.levelStates.get(level) === 'won';
    }

    public hasLostLevel(level: number): boolean {
        return this.levelStates.get(level) === 'lost';
    }
}