import Konva from "konva";
import { COLORS, DIMENSIONS, FONTS } from '../../constants';

export class ShopScreenView {
    private layer: Konva.Layer;
    private bg: Konva.Rect;
    private stars: Konva.Group;
    private title: Konva.Text;
    private shopGroup: Konva.Group;

    //menu button
    private menuButton: {group: Konva.Group, rect: Konva.Rect, text: Konva.Text};

    //interactive elements

    constructor(layer: Konva.Layer) {

        //create the background of the view
        this.layer = layer;
        this.bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: COLORS.background,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: DIMENSIONS.width, y: DIMENSIONS.height },
            fillLinearGradientColorStops: [0, '#060616', 0.5, '#0a0a24', 1, '#0e1033']
        });
        
        //create stars in the background
        this.stars = new Konva.Group();
        this.spawnStars(this.stars, 150, 0.2, 1.5);

        //title of the shop
        this.title = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 90,
            text: 'Welcome to the Shop Planet!!',
            fontSize: 32,
            fontFamily: FONTS.title,
            fill: COLORS.text,
            align: 'center'
        });
        this.title.offsetX(this.title.width() / 2);


        //create the menu button
        this.menuButton = {
            group: new Konva.Group(),
            rect: new Konva.Rect({
                x: DIMENSIONS.width - 200,
                y: 30,
                width: 160,
                height: 40,
                fill: COLORS?.primary || '#7b61ff',
                cornerRadius: 10,
                listening: true
            }),
            text: new Konva.Text({
                x: DIMENSIONS.width - 200 + 80,
                y: 30 + 20 - 8,
                text: 'Return to Main Menu',
                fontSize: 16,
                fontFamily: FONTS.label || 'Arial',
                fill: '#ffffff',
                align: 'center'
            })
        };
        this.menuButton.text.offsetX(this.menuButton.text.width() / 2);
        this.menuButton.group.add(this.menuButton.rect);
        this.menuButton.group.add(this.menuButton.text);
        
        //add all elements to the layer
        this.layer.add(this.bg);
        this.layer.add(this.stars);
        this.layer.add(this.title);
        this.layer.add(this.menuButton.group);

        this.shopGroup = new Konva.Group();
        //create the shop elements
        this.createShop();

        this.layer.add(this.shopGroup);

        this.layer.draw();
    }

    private createShop(): void {
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


    private spawnStars(group: Konva.Group, count: number, opacityBase: number, maxRadius: number) {
        for (let i = 0; i < count; i++) {
          const s = new Konva.Circle({
            x: Math.random() * DIMENSIONS.width,
            y: Math.random() * DIMENSIONS.height,
            radius: Math.random() * maxRadius + 0.4,
            fill: '#ffffff',
            opacity: opacityBase + Math.random() * 0.4,
            listening: false
          });
          group.add(s);
        }
      }
}
