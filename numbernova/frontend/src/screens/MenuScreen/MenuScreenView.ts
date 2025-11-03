import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';

export class MenuScreenView {
    private layer: Konva.Layer;
    private menuGroup: Konva.Group;
    
    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.createMenu();
    }
    
    private createMenu(): void {
        this.menuGroup = new Konva.Group();
        
        // Title
        const title = new Konva.Text({
            x: DIMENSIONS.width / 2 - 150,
            y: 100,
            text: 'MAIN MENU - WELCOME!',
            fontSize: 32,
            fontFamily: 'Arial',
            fill: COLORS.text,
        });
        
        // Play button
        const playButton = new Konva.Rect({
            x: DIMENSIONS.width / 2 - 75,
            y: 200,
            width: 150,
            height: 50,
            fill: COLORS.primary,
            cornerRadius: 10,
        });
        
        const playText = new Konva.Text({
            x: DIMENSIONS.width / 2 - 30,
            y: 215,
            text: 'PLAY',
            fontSize: 18,
            fontFamily: 'Arial',
            fill: COLORS.text,
        });
        
        this.menuGroup.add(title);
        this.menuGroup.add(playButton);
        this.menuGroup.add(playText);
        this.layer.add(this.menuGroup);
        
        // Add click handler
        playButton.on('click', () => {
            console.log('Play button clicked!');
        });
        
        // Hover effects
        playButton.on('mouseenter', () => {
            playButton.fill(COLORS.primaryLight);
            document.body.style.cursor = 'pointer';
            this.layer.draw();
        });
        
        playButton.on('mouseleave', () => {
            playButton.fill(COLORS.primary);
            document.body.style.cursor = 'default';
            this.layer.draw();
        });
    }
}