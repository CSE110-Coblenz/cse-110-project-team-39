import {COLORS} from '../../constants';
export class ShopScreenModel{

    private colors=[COLORS.red, COLORS.orange, COLORS.yellow, COLORS.green, COLORS.blue, COLORS.purple];
    
    //TODO: connect to backend later based on the player's data
    private currenColor = COLORS.red;
    private colorsUnlocked = [true, true, true, false, false, false];
    private currency = 100;


    //function to unlock color
    protected unlockColor(color: string){
        //check to see if purchase is possible
        if(this.currency >= 50 && !this.colorsUnlocked[this.colors.indexOf(color)]){
            this.currency -= 50; //deduct cost
            this.colorsUnlocked[this.colors.indexOf(color)] = true; //unlock color

            //TODO: update backend with new currency and unlocked colors
        }
    }

    public setCurrentColor(color: string): boolean{
        //check if color is unlocked
        const colorIndex = this.colors.indexOf(color);
        if(this.colorsUnlocked[colorIndex]){
            this.currenColor = color;
            return true;

            //TODO: update backend with new current color
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