export class ShopScreenModel{

    //TODO: connect to backend later based on the player's data
    private colors=["red", "orange", "yellow", "green", "blue", "purple"];
    private colorsUnlocked = [true, false, false, false, false, false];
    private currency = 100;


    //function to unlock color
    private unlockColor(color: string){
        //check to see if purchase is possible
        if(this.currency >= 50 && !this.colorsUnlocked[this.colors.indexOf(color)]){
            this.currency -= 50; //deduct cost
            this.colorsUnlocked[this.colors.indexOf(color)] = true; //unlock color
        }
    }

}