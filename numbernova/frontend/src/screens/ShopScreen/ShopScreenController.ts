import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { ShopScreenView } from './ShopScreenView';
import { ShopScreenModel } from './ShopScreenModel';
import { COLORS, DIMENSIONS } from '../../constants';

export class ShopScreenController extends BaseScreen {
    private view: ShopScreenView;
    private model: ShopScreenModel;

    
    protected initialize(): void {

        this.model = new ShopScreenModel();
        //construct the view with the model data
        this.view = new ShopScreenView(this.container, 
            this.model.getColors(), this.model.getColorsUnlocked(), this.model.getCurrentColor(),
            this.model.getCurrency());

        this.view.onMenuClick(() => {
            this.returnToMenu();
        });

        this.view.onRedClick(() => {
            if(this.model.setCurrentColor(COLORS.red)){
                this.view.updatePerson(COLORS.red);
            }     
        });

        this.view.onOrangeClick(() => {
            if(this.model.setCurrentColor(COLORS.orange)){
                this.view.updatePerson(COLORS.orange);
            }     
        });

        this.view.onYellowClick(() => {
            if(this.model.setCurrentColor(COLORS.yellow)){
                this.view.updatePerson(COLORS.yellow);
            }     
        });

        this.view.onGreenClick(() => {
            if(this.model.setCurrentColor(COLORS.green)){
                this.view.updatePerson(COLORS.green);
            }     
        });

        this.view.onBlueClick(() => {
            if(this.model.setCurrentColor(COLORS.blue)){
                this.view.updatePerson(COLORS.blue);
            }     
        });

        this.view.onPurpleClick(() => {
            if(this.model.setCurrentColor(COLORS.purple)){
                this.view.updatePerson(COLORS.purple);
            }     
        });

        
        this.view.onRedOverlayClick(() => {
            if(this.model.unlockColor(COLORS.red)){
                this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
                this.view.updateCurrencyDisplay(this.model.getCurrency());
            }
        });

        this.view.onOrangeOverlayClick(() => {
            if(this.model.unlockColor(COLORS.orange)){
                this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
                this.view.updateCurrencyDisplay(this.model.getCurrency());
            }
        });

        this.view.onYellowOverlayClick(() => {
            if(this.model.unlockColor(COLORS.yellow)){
                this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
                this.view.updateCurrencyDisplay(this.model.getCurrency());
            }
        });

        this.view.onGreenOverlayClick(() => {
            if(this.model.unlockColor(COLORS.green)){
                this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
                this.view.updateCurrencyDisplay(this.model.getCurrency());
            }
        });

        this.view.onBlueOverlayClick(() => {
            if(this.model.unlockColor(COLORS.blue)){
                this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
                this.view.updateCurrencyDisplay(this.model.getCurrency());
            }
        });

        this.view.onPurpleOverlayClick(() => {
            if(this.model.unlockColor(COLORS.purple)){
                this.view.updateShop(this.model.getColors(), this.model.getColorsUnlocked());
                this.view.updateCurrencyDisplay(this.model.getCurrency());
            }
        }); 
        

        this.container.getStage()?.draw();
    }


    private returnToMenu(): void {
        this.screenManager.switchTo('menu');
    }
}