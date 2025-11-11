import Konva from "konva";
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
type VoidFn = () => void;
export class ShopScreenView {
    private layer: Konva.Layer;
    private bg: Konva.Rect;
    private stars: Konva.Group;
    private title: Konva.Text;
    private shopGroup: Konva.Group;
    private swatches: Konva.Circle[] = [];
    private red: Konva.Circle;
    private orange: Konva.Circle;
    private yellow: Konva.Circle;
    private green: Konva.Circle;
    private blue: Konva.Circle;
    private purple: Konva.Circle;

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
