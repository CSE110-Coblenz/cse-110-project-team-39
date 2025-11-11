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

        this.setupEventListeners();

        setTimeout(() => {
            this.container.getStage()?.draw();
        }, 100);
    }

    private setupEventListeners(): void {
        this.view.getMenuButton().on('click', () => {
            this.returnToMenu();
        });
    }

    private returnToMenu(): void {
        this.screenManager.switchTo('menu');
    }
}