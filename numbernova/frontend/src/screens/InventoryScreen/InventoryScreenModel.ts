import { COLORS } from '../../constants';
import { updateUserProfile } from '../../lib/supabase';

export class InventoryScreenModel {
    private userId: string;
    private colors = [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.green, COLORS.blue, COLORS.purple];
    private colorNames = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    private colorsUnlocked: boolean[];
    private currentColor: string;

    constructor(userId: string, initialData: { ship_color?: string; unlocked_colors?: Record<string, boolean> }) {
        this.userId = userId;
        this.colorsUnlocked = this.convertUnlockedColorsToArray(initialData.unlocked_colors || {});
        this.currentColor = initialData.ship_color || COLORS.red;
    }

    private convertUnlockedColorsToArray(unlockedColors: Record<string, boolean>): boolean[] {
        return this.colorNames.map(name => unlockedColors[name] ?? false);
    }

    public getOwnedColors(): string[] {
        return this.colors.filter((_, index) => this.colorsUnlocked[index]);
    }

    public getCurrentColor(): string {
        return this.currentColor;
    }

    public async setCurrentColor(color: string): Promise<boolean> {
        const index = this.colors.indexOf(color);
        if (index === -1 || !this.colorsUnlocked[index]) {
            return false;
        }

        this.currentColor = color;

        await updateUserProfile(this.userId, {
            ship_color: color
        });

        return true;
    }
}
