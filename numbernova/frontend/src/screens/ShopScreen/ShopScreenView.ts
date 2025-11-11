import Konva from "konva";
import { COLORS, DIMENSIONS, FONTS } from '../../constants';

export class ShopScreenView {
    private layer: Konva.Layer;
    private background: Konva.Rect;
    private stars: Konva.Group;
    private shopGroup: Konva.Group;

    //interactive elements
    private returnButton: Konva.Group;

    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.createBackground();
        this.createStars();
        this.createShop();
    }

    private createShop(): void {
        this.shopGroup = new Konva.Group();

        // Top-left return button
        const returnGroup = new Konva.Group({ x: 20, y: 18 });
        const returnBg = new Konva.Rect({
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: COLORS.background,
        });
        const returnText = new Konva.Text({
            x: 12,
            y: 8,
            text: 'Return to\nMain Menu',
            fontSize: 12,
            fontFamily: FONTS.label || 'Arial',
            fill: '#fff'
        });
        returnGroup.add(returnBg);
        returnGroup.add(returnText);
        this.shopGroup.add(returnGroup);

        // Left column title and subtitle
        const title = new Konva.Text({
            x: 40,
            y: 80,
            text: 'Welcome to the shop\nplanet!!',
            fontSize: 22,
            fontFamily: FONTS.title,
            fill: COLORS.text,
        });
        const subtitle = new Konva.Text({
            x: 40,
            y: 130,
            text: 'Buy colors and customize\nyour appearance',
            fontSize: 14,
            fontFamily: FONTS.subtitle || 'Arial',
            fill: COLORS.text,
        });
        this.shopGroup.add(title);
        this.shopGroup.add(subtitle);

        // Character preview (left side)
        const previewX = 120;
        const head = new Konva.Circle({
            x: previewX,
            y: 220,
            radius: 28,
            fill: '#f0f0f0',
            stroke: '#bbbbbb',
            strokeWidth: 2,
        });
        const body = new Konva.Rect({
            x: previewX - 30,
            y: 260,
            width: 60,
            height: 140,
            cornerRadius: 6,
            fill: '#6aa84f', // green body
            stroke: '#5a8a3a',
            strokeWidth: 2,
        });
        this.shopGroup.add(head);
        this.shopGroup.add(body);

        // Color swatches grid (right side)
        const swatchStartX = DIMENSIONS.width - 260;
        const swatchStartY = 120;
        const swatchGapX = 90;
        const swatchGapY = 80;
        const swatchRadius = 28;
        const colors = ["red", "orange", "yellow", "green", "blue", "purple"];

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const idx = row * 2 + col;
                const cx = swatchStartX + col * swatchGapX;
                const cy = swatchStartY + row * swatchGapY;
                const swatchBg = new Konva.Circle({
                    x: cx,
                    y: cy,
                    radius: swatchRadius + 6,
                    fill: '#222', // background ring
                    opacity: 0.2,
                });
                const swatch = new Konva.Circle({
                    x: cx,
                    y: cy,
                    radius: swatchRadius,
                    fill: colors[idx],
                    stroke: '#111',
                    strokeWidth: 2,
                    shadowColor: '#000',
                    shadowBlur: 6,
                    shadowOffset: { x: 0, y: 2 }
                });
                this.shopGroup.add(swatchBg);
                this.shopGroup.add(swatch);
            }
        }

        // Add group to layer and draw
        this.layer.add(this.shopGroup);
        this.layer.draw();
    }
}
