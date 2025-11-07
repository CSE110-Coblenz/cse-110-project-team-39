import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
import { KonvaInput } from '../../components/KonvaInput';

export class LeaderboardScreenView {
    private layer: Konva.Layer;
    private background: Konva.Rect;
    
    // Leaderboard elements
    private leaderboardTable: Konva.Group;
    private leaderboardHeader: Konva.Group;
    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.createBackground();
    }
    
    private createBackground(): void {
        this.background = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: COLORS.background
        });
        this.layer.add(this.background);
    }
}