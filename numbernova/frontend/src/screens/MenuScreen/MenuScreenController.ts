import { MenuScreenView } from './MenuScreenView';
import { MenuScreenModel } from './MenuScreenModel';

export class MenuScreenController {
    private view: MenuScreenView;
    private model: MenuScreenModel;
    
    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.model = new MenuScreenModel();
        this.view = new MenuScreenView(layer);
        
        console.log('MenuScreen loaded successfully!');
    }
}