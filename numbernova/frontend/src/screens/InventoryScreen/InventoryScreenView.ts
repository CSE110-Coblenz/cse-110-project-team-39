import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';

type VoidFn = () => void;
type ColorFn = (color: string) => void;

export class InventoryScreenView {
    private layer: Konva.Layer;
    private bg: Konva.Rect;
    private title: Konva.Text;

    private menuButton: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };

    private personGroup: Konva.Group;
    private colorSwatches: { circle: Konva.Circle; color: string }[] = [];

    private menuHandlers: VoidFn[] = [];
    private colorClickHandlers: ColorFn[] = [];

    constructor(layer: Konva.Layer, ownedColors: string[], currentColor: string) {
        this.layer = layer;

        this.bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: 'transparent'
        });

        this.title = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 40,
            text: 'Inventory',
            fontSize: 36,
            fontFamily: FONTS.title,
            fill: COLORS.text,
            align: 'center'
        });
        this.title.offsetX(this.title.width() / 2);

        const menuBtnWidth = 180;
        const menuBtnHeight = 60;
        const menuBtnX = 30;
        const menuBtnY = 30;

        this.menuButton = {
            group: new Konva.Group(),
            rect: new Konva.Rect({
                x: menuBtnX,
                y: menuBtnY,
                width: menuBtnWidth,
                height: menuBtnHeight,
                fill: COLORS.primary,
                cornerRadius: 16,
                listening: true
            }),
            text: new Konva.Text({
                x: menuBtnX + menuBtnWidth / 2,
                y: menuBtnY + menuBtnHeight / 2,
                text: 'Back to Menu',
                fontSize: 22,
                fontFamily: FONTS.label || 'Arial',
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'middle'
            })
        };

        this.menuButton.text.offsetX(this.menuButton.text.width() / 2);
        this.menuButton.text.offsetY(this.menuButton.text.height() / 2);
        this.menuButton.group.add(this.menuButton.rect);
        this.menuButton.group.add(this.menuButton.text);

        this.personGroup = new Konva.Group();
        this.drawPerson(currentColor);

        this.createColorSwatches(ownedColors, currentColor);

        this.layer.add(this.bg);
        this.layer.add(this.title);
        this.layer.add(this.menuButton.group);
        this.layer.add(this.personGroup);

        this.attachHandlers();

        this.layer.batchDraw();
    }

    public onMenuClick(cb: VoidFn): void {
        this.menuHandlers.push(cb);
    }

    public onColorClick(cb: ColorFn): void {
        this.colorClickHandlers.push(cb);
    }

    private drawPerson(color: string): void {
        this.personGroup.destroyChildren();

        const head = new Konva.Circle({
            x: 160,
            y: 250,
            radius: 80,
            fill: COLORS.person
        });

        const body = new Konva.Rect({
            x: 90,
            y: 330,
            width: 140,
            height: 260,
            fill: color,
            cornerRadius: 5
        });

        this.personGroup.add(head);
        this.personGroup.add(body);
    }

    private createColorSwatches(ownedColors: string[], currentColor: string): void {
        this.colorSwatches.forEach(swatch => swatch.circle.destroy());
        this.colorSwatches = [];

        const swatchSize = 120;
        const padding = 40;
        const columns = 3;

        const areaWidth = DIMENSIONS.width / 2;
        const totalWidth = columns * swatchSize + (columns - 1) * padding;
        const startX = DIMENSIONS.width / 2 + (areaWidth - totalWidth) / 2;
        const startY = 180;

        ownedColors.forEach((color, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;

            const circle = new Konva.Circle({
                x: startX + col * (swatchSize + padding) + swatchSize / 2,
                y: startY + row * (swatchSize + padding) + swatchSize / 2,
                radius: swatchSize / 2,
                fill: color,
                stroke: color === currentColor ? '#ffffff' : '#000000',
                strokeWidth: color === currentColor ? 8 : 2,
                shadowColor: color,
                shadowBlur: 10,
                shadowOffset: { x: 0, y: 4 },
                shadowOpacity: 0.5,
                listening: true
            });

            this.colorSwatches.push({ circle, color });

            circle.on('click', () => {
                this.colorClickHandlers.forEach(fn => fn(color));
            });

            this.layer.add(circle);
        });
    }

    private attachHandlers(): void {
        this.menuButton.group.on('click', () => {
            this.menuHandlers.forEach(fn => fn());
        });
    }

    public updateCurrentColor(color: string): void {
        this.drawPerson(color);

        this.colorSwatches.forEach(swatch => {
            swatch.circle.stroke(swatch.color === color ? '#ffffff' : '#000000');
            swatch.circle.strokeWidth(swatch.color === color ? 8 : 2);
        });

        this.layer.batchDraw();
    }
}
