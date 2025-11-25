import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { COLORS, DIMENSIONS } from '../../constants';

export class ProfileScreenController extends BaseScreen {
    protected initialize(): void {
        // Use the same background color as Leaderboard
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: '#1a1a2e' // Same as Leaderboard
        });
        
        // Title matching Leaderboard style
        const title = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 80,
            text: 'PROFILE - Coming Soon!',
            fontSize: 36,
            fontFamily: 'Jersey 10',
            fill: '#ffffff',
            align: 'center'
        });
        title.offsetX(title.width() / 2);
        
        // Return button matching Leaderboard style
        const returnButton = this.createReturnButton();
        
        this.container.add(background);
        this.container.add(title);
        this.container.add(returnButton);
    }

    private createReturnButton(): Konva.Group {
        const group = new Konva.Group();
        
        const rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 180,
            height: 40,
            fill: COLORS?.primary ?? '#7b61ff',
            cornerRadius: 10,
            listening: true
        });
        
        const text = new Konva.Text({
            x: 50 + 180 / 2,
            y: 50 + 20 - 8,
            text: 'Return to Main Menu',
            fontSize: 16,
            fontFamily: 'Jersey 10',
            fill: '#ffffff',
            align: 'center',
            listening: false
        });
        text.offsetX(text.width() / 2);
        
        rect.on('click', () => {
            this.screenManager.switchTo('menu');
        });

        // Add hover effects to match other buttons
        rect.on('mouseenter', () => {
            document.body.style.cursor = 'pointer';
            rect.fill(COLORS?.primaryLight ?? '#8d75ff');
            this.container.getStage()?.draw();
        });
        
        rect.on('mouseleave', () => {
            document.body.style.cursor = 'default';
            rect.fill(COLORS?.primary ?? '#7b61ff');
            this.container.getStage()?.draw();
        });
        
        group.add(rect);
        group.add(text);
        
        return group;
    }
}