import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { ShopScreenView } from './ShopScreenView';
import { ShopScreenModel } from './ShopScreenModel';
import { COLORS, DIMENSIONS } from '../../constants';

export class ShopScreenController extends BaseScreen {
    private view: ShopScreenView;
    private model: ShopScreenModel;

    
    protected initialize(): void {

        this.view = new ShopScreenView(this.container);
        this.model = new ShopScreenModel();
    }
}