import Konva from "konva";
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
type VoidFn = () => void;
export class ShopScreenView {
    private layer: Konva.Layer;
    private bg: Konva.Rect;
    private stars: Konva.Group;
    private title: Konva.Text;
    private shopGroup: Konva.Group;
    private red!: Konva.Circle;
    private orange!: Konva.Circle;
    private yellow!: Konva.Circle;
    private green!: Konva.Circle;
    private blue!: Konva.Circle;
    private purple!: Konva.Circle;

    //menu button
    private menuButton: {group: Konva.Group, rect: Konva.Rect, text: Konva.Text};

    //handlers for menu screen and color swatches

    private menuHandler: VoidFn[] = [];
    private redHandler: VoidFn[] = [];
    private orangeHandler: VoidFn[] = [];
    private yellowHandler: VoidFn[] = [];
    private greenHandler: VoidFn[] = [];
    private blueHandler: VoidFn[] = [];
    private purpleHandler: VoidFn[] = [];

    //event functions to register handlers

    onMenuClick(fn: VoidFn) {this.menuHandler.push(fn);}
    onRedClick(fn: VoidFn) {this.redHandler.push(fn);}
    onOrangeClick(fn: VoidFn) {this.orangeHandler.push(fn);}
    onYellowClick(fn: VoidFn) {this.yellowHandler.push(fn);}
    onGreenClick(fn: VoidFn) {this.greenHandler.push(fn);}
    onBlueClick(fn: VoidFn) {this.blueHandler.push(fn);}
    onPurpleClick(fn: VoidFn) {this.purpleHandler.push(fn);}

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


        //create the menu button (bigger and aligned to upper left)
        const menuBtnWidth = 220;
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
            fill: COLORS?.primary || '#7b61ff',
            cornerRadius: 16,
            listening: true
            }),
            text: new Konva.Text({
            x: menuBtnX + menuBtnWidth / 2,
            y: menuBtnY + menuBtnHeight / 2,
            text: 'Return to Main Menu',
            fontSize: 22,
            fontFamily: FONTS.label || 'Arial',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle'
            })
        };
        // Center the text in the button
        this.menuButton.text.offsetX(this.menuButton.text.width() / 2);
        this.menuButton.text.offsetY(this.menuButton.text.height() / 2);
        this.menuButton.group.add(this.menuButton.rect);
        this.menuButton.group.add(this.menuButton.text);
        //add all elements to the layer
        this.layer.add(this.bg);
        this.layer.add(this.stars);
        this.layer.add(this.title);
        this.layer.add(this.menuButton.group);

        this.shopGroup = new Konva.Group();

        this.red = new Konva.Circle();
        this.orange = new Konva.Circle();
        this.yellow = new Konva.Circle();
        this.green = new Konva.Circle();
        this.blue = new Konva.Circle();
        this.purple = new Konva.Circle();
        //create the shop elements
        this.createShop();

        this.layer.add(this.shopGroup);

        this.layer.draw();
    }

    private createShop(): void {
       //add the color swatches to the shop group so that they take up the right half of the screen and are evenly spaced in a 3x2 grid
       const colors = [
        { color: COLORS.red, circle: this.red},    // Red
        { color: COLORS.orange, circle: this.orange }, // Orange
        { color: COLORS.yellow, circle: this.yellow }, // Yellow
        { color: COLORS.green, circle: this.green },  // Green
        { color: COLORS.blue, circle: this.blue },   // Blue
        { color: COLORS.purple, circle: this.purple }  // Purple
       ];

       const swatchSize = 100;
       const padding = 40;
       const startX = DIMENSIONS.width / 2 + (DIMENSIONS.width / 2 - (3 * swatchSize + 2 * padding)) / 2;
       const startY = 150;

       colors.forEach((item, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;

        item.circle = new Konva.Circle({
            x: startX + col * (swatchSize + padding) + swatchSize / 2,
            y: startY + row * (swatchSize + padding) + swatchSize / 2,
            radius: swatchSize / 2,
            fill: item.color,
            strokeWidth: 4,
            shadowColor: item.color,
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 },
            shadowOpacity: 0.5,
            listening: true
        }); 

        this.shopGroup.add(item.circle);
       });
        
    }

    private drawPerson(){

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
