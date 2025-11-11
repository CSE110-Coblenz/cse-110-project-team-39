import {COLORS} from '../../constants';
export class ShopScreenModel{

    private colors=[COLORS.red, COLORS.orange, COLORS.yellow, COLORS.green, COLORS.blue, COLORS.purple];
    
    //TODO: connect to backend later based on the player's data
    private currenColor = COLORS.red;
    private colorsUnlocked = [true, false, false, false, false, false];
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

    protected getCurrentColor(): string{
        return this.currenColor;
    }

    protected getColorsUnlocked(): boolean[]{
        return this.colorsUnlocked;
    }

    protected getCurrency(): number{
        return this.currency;
    }

    protected getColors(): string[]{
        return this.colors;
    }
}