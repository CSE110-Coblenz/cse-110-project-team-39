import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';

export class ProfileScreenController extends BaseScreen {
    protected initialize(): void {
        // Create basic profile UI
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.container.getStage()?.width() || 800,
            height: this.container.getStage()?.height() || 600,
            fill: '#1a1a2e'
        });
        
        const title = new Konva.Text({
            x: 400,
            y: 100,
            text: 'PROFILE - Coming Soon!',
            fontSize: 36,
            fill: '#ffffff'
        });
        title.offsetX(title.width() / 2);
        
        const backButton = new Konva.Rect({
            x: 50,
            y: 50,
            width: 100,
            height: 40,
            fill: '#7b61ff',
            cornerRadius: 10
        });
        
        const backText = new Konva.Text({
            x: 100,
            y: 60,
            text: 'Back',
            fontSize: 16,
            fill: '#ffffff'
        });
        backText.offsetX(backText.width() / 2);
        
        backButton.on('click', () => {
            this.screenManager.switchTo('menu');
        });
        
        this.container.add(background);
        this.container.add(title);
        this.container.add(backButton);
        this.container.add(backText);
    }
}