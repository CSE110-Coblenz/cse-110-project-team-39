import {COLORS} from '../../constants';
import { updateUserProfile } from '../../lib/supabase';

export class ShopScreenModel{

    private colors=[COLORS.red, COLORS.orange, COLORS.yellow, COLORS.green, COLORS.blue, COLORS.purple];
    private colorNames = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    private userId: string;
    private currenColor = COLORS.red;
    private colorsUnlocked = [true, true, true, false, false, false];
    private currency = 100;

    constructor(userId: string, initialData?: { tokens?: number; ship_color?: string; unlocked_colors?: Record<string, boolean> }) {
        this.userId = userId;
        if (initialData) {
            if (initialData.tokens !== undefined) {
                this.currency = initialData.tokens;
            }
            if (initialData.ship_color) {
                this.currenColor = initialData.ship_color;
            }
            if (initialData.unlocked_colors) {
                this.colorsUnlocked = this.convertUnlockedColorsToArray(initialData.unlocked_colors);
            }
        }
    }

    // Helper: Convert Record<string, boolean> to boolean array
    private convertUnlockedColorsToArray(unlockedColors: Record<string, boolean>): boolean[] {
        return this.colorNames.map(colorName => unlockedColors[colorName] ?? false);
    }

    // Helper: Convert boolean array to Record<string, boolean>
    private convertUnlockedColorsToRecord(): Record<string, boolean> {
        const result: Record<string, boolean> = {};
        this.colorNames.forEach((colorName, index) => {
            result[colorName] = this.colorsUnlocked[index];
        });
        return result;
    }


    //function to unlock color
    public async unlockColor(color: string): Promise<'success' | 'not-enough-tokens' | 'already-unlocked'> {
        const colorIndex = this.colors.indexOf(color);

        // Check if color is already unlocked
        if (this.colorsUnlocked[colorIndex]) {
            return 'already-unlocked';
        }

        // Check if user has enough tokens
        if (this.currency < 50) {
            return 'not-enough-tokens';
        }

        // Purchase the color
        this.currency -= 50; //deduct cost
        this.colorsUnlocked[colorIndex] = true; //unlock color

        // Update backend with new currency and unlocked colors
        await updateUserProfile(this.userId, {
            tokens: this.currency,
            unlocked_colors: this.convertUnlockedColorsToRecord()
        });

        return 'success';
    }

    public async setCurrentColor(color: string): Promise<boolean> {
        //check if color is unlocked
        const colorIndex = this.colors.indexOf(color);
        if(this.colorsUnlocked[colorIndex]){
            this.currenColor = color;

            // Update backend with new current color
            await updateUserProfile(this.userId, {
                ship_color: color
            });

            return true;
        }
        return false;
    }

    public getCurrentColor(): string{
        return this.currenColor;
    }

    public getColorsUnlocked(): boolean[]{
        return this.colorsUnlocked;
    }

    public getCurrency(): number{
        return this.currency;
    }

    public getColors(): string[]{
        return this.colors;
    }
}