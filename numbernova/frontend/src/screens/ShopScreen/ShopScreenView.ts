import Konva from "konva";
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
type VoidFn = () => void;
export class ShopScreenView {
    private layer: Konva.Layer;
    private bg: Konva.Rect;
    private title: Konva.Text;


    //the next few comments define groups that have private methods to create them
    //  they will need public methods to change them for the controller

    //group for the shop items
    private shopGroup: Konva.Group;
    private red!: Konva.Circle;
    private orange!: Konva.Circle;
    private yellow!: Konva.Circle;
    private green!: Konva.Circle;
    private blue!: Konva.Circle;
    private purple!: Konva.Circle;

    private redOverlay!: Konva.Group;
    private orangeOverlay!: Konva.Group;
    private yellowOverlay!: Konva.Group;
    private greenOverlay!: Konva.Group;
    private blueOverlay!: Konva.Group;
    private purpleOverlay!: Konva.Group;    

    //menu button
    private menuButton: {group: Konva.Group, rect: Konva.Rect, text: Konva.Text};

    //person drawing
    private personGroup: Konva.Group;

    //the currency tag
    private currencyText: Konva.Text;

    //handlers for menu screen and color swatches

    private menuHandler: VoidFn[] = [];
    private redHandler: VoidFn[] = [];
    private orangeHandler: VoidFn[] = [];
    private yellowHandler: VoidFn[] = [];
    private greenHandler: VoidFn[] = [];
    private blueHandler: VoidFn[] = [];
    private purpleHandler: VoidFn[] = [];

    private redOverlayHandler: VoidFn[] = [];
    private orangeOverlayHandler: VoidFn[] = [];
    private yellowOverlayHandler: VoidFn[] = [];
    private greenOverlayHandler: VoidFn[] = [];
    private blueOverlayHandler: VoidFn[] = [];
    private purpleOverlayHandler: VoidFn[] = [];

    //event functions to register handlers

    onMenuClick(cb: VoidFn) {this.menuHandler.push(cb);}
    onRedClick(cb: VoidFn) {this.redHandler.push(cb);}
    onOrangeClick(cb: VoidFn) {this.orangeHandler.push(cb);}
    onYellowClick(cb: VoidFn) {this.yellowHandler.push(cb);}
    onGreenClick(cb: VoidFn) {this.greenHandler.push(cb);}
    onBlueClick(cb: VoidFn) {this.blueHandler.push(cb);}
    onPurpleClick(cb: VoidFn) {this.purpleHandler.push(cb);}


    onRedOverlayClick(cb: VoidFn) {this.redOverlayHandler.push(cb);}
    onOrangeOverlayClick(cb: VoidFn) {this.orangeOverlayHandler.push(cb);}
    onYellowOverlayClick(cb: VoidFn) {this.yellowOverlayHandler.push(cb);}
    onGreenOverlayClick(cb: VoidFn) {this.greenOverlayHandler.push(cb);}
    onBlueOverlayClick(cb: VoidFn) {this.blueOverlayHandler.push(cb);}
    onPurpleOverlayClick(cb: VoidFn) {this.purpleOverlayHandler.push(cb);}

    constructor(layer: Konva.Layer, colors: string[], colorsUnlocked: boolean[], currentColor: string,
        currency: number
    ) {
        
        //create the background of the view
        this.layer = layer;
        this.bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: 'transparent'
        });

        //title of the shop
        this.title = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 40,
            text: 'Welcome to the Shop Planet!!',
            fontSize: 36,
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
        this.createShop(colors, colorsUnlocked);
        this.attachEventHandlers();

        //create the person wearing the current color
        this.personGroup = new Konva.Group();
        this.drawPerson(currentColor);

        //create the currency display with the current amount
        this.drawCurrencyDisplay(currency);

        this.layer.draw();
    }

    //private method to draw the shop
    private createShop(colorsAvailable: string[], colorsUnlocked: boolean[]): void {
       //add the color swatches to the shop group so that they take up the right half of the screen and are evenly spaced in a 3x2 grid
       const colors = [
        { color: colorsAvailable[0], locked: colorsUnlocked[0], circle: this.red, overlay: this.redOverlay},    // Red
        { color: colorsAvailable[1], locked: colorsUnlocked[1], circle: this.orange, overlay: this.orangeOverlay }, // Orange
        { color: colorsAvailable[2], locked: colorsUnlocked[2], circle: this.yellow, overlay: this.yellowOverlay }, // Yellow
        { color: colorsAvailable[3], locked: colorsUnlocked[3], circle: this.green, overlay: this.greenOverlay },  // Green
        { color: colorsAvailable[4], locked: colorsUnlocked[4], circle: this.blue, overlay: this.blueOverlay},   // Blue
        { color: colorsAvailable[5], locked: colorsUnlocked[5], circle: this.purple, overlay: this.purpleOverlay }  // Purple
       ];

       const swatchSize = 160;
       const padding = 60;
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

        // Ensure instance properties reference the actual circles added to the group
        // so attachEventHandlers binds listeners to the visible shapes.
        switch (index) {
            case 0: this.red = item.circle; break;
            case 1: this.orange = item.circle; break;
            case 2: this.yellow = item.circle; break;
            case 3: this.green = item.circle; break;
            case 4: this.blue = item.circle; break;
            case 5: this.purple = item.circle; break;
        }

        if(!item.locked){
            item.overlay = new Konva.Group(); // Empty group for unlocked colors
            const lockIcon = new Konva.Text({
                x: item.circle.x(),
                y: item.circle.y(),
                text: '🔒',
                fontSize: 40,
                fontFamily: FONTS.label,
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'middle'
            });
            lockIcon.offsetX(lockIcon.width() / 2);
            lockIcon.offsetY(lockIcon.height() / 2);
            item.overlay.add(lockIcon);

            const overlay = new Konva.Circle({
                x: item.circle.x(),
                y: item.circle.y(),
                radius: swatchSize / 2,
                fill: 'rgba(0, 0, 0, 0.5)',
                listening: false
            });
            item.overlay.add(overlay);

            switch (index) {
                case 0: this.redOverlay = item.overlay; break;
                case 1: this.orangeOverlay = item.overlay; break;
                case 2: this.yellowOverlay = item.overlay; break;
                case 3: this.greenOverlay = item.overlay; break;
                case 4: this.blueOverlay = item.overlay; break;
                case 5: this.purpleOverlay = item.overlay; break;
            }

            this.shopGroup.add(item.overlay);
        }
       });
       this.shopGroup.offsetY(60);
        this.layer.add(this.shopGroup);
    }


    //prviate method to redraw the person
    private drawPerson(color: string){
        //draw the person on the left side of the screen
        const head = new Konva.Circle({
            x: 150,
            y: 250,
            radius: 80,
            fill: COLORS.person,   
        });
        
        const body = new Konva.Rect({
            x: 70,
            y: 330,
            width: 160,
            height: 320,
            fill: color,
            cornerRadius: 5
        });

        this.personGroup = new Konva.Group();
        this.personGroup.add(head);
        this.personGroup.add(body);
        this.personGroup.offsetX(this.personGroup.width() / 2);
        this.layer.add(this.personGroup);
    }

    //private method to draw the currency display
    private drawCurrencyDisplay(currency: number){
        this.currencyText = new Konva.Text({
            x: DIMENSIONS.width - 150,
            y: 30,
            text: `Currency: ${currency}`,
            fontFamily: FONTS.subtitle,
            fontSize: 32,
            fill: COLORS.text,
            align: 'right'
        });
        this.currencyText.offsetX(this.currencyText.width() / 2);
        this.layer.add(this.currencyText);
    }

    //below are public methods to update various parts of the view

    // Attach event handlers for color circle clicks
    public attachEventHandlers() {
        this.menuButton.group.on('click', () => {
            this.menuHandler.forEach(fn => fn());
        });
        this.red.on('click', () => {
            this.redHandler.forEach(fn => fn());
        });
        this.orange.on('click', () => {
            this.orangeHandler.forEach(fn => fn());
        });
        this.yellow.on('click', () => {
            this.yellowHandler.forEach(fn => fn());
        });
        this.green.on('click', () => {
            this.greenHandler.forEach(fn => fn());
        });
        this.blue.on('click', () => {
            this.blueHandler.forEach(fn => fn());
        });
        this.purple.on('click', () => {
            this.purpleHandler.forEach(fn => fn());
        });

        if(this.redOverlay){
            this.redOverlay.on('click', () => {
                this.redOverlayHandler.forEach(fn => fn());
            });
        }
        if(this.orangeOverlay){
            this.orangeOverlay.on('click', () => {
                this.orangeOverlayHandler.forEach(fn => fn());
            });
        }
        if(this.yellowOverlay){
            this.yellowOverlay.on('click', () => {
                this.yellowOverlayHandler.forEach(fn => fn());
            });
        }
        if(this.greenOverlay){
            this.greenOverlay.on('click', () => {
                this.greenOverlayHandler.forEach(fn => fn());
            });
        }
        if(this.blueOverlay){
            this.blueOverlay.on('click', () => {
                this.blueOverlayHandler.forEach(fn => fn());
            });
        }
        if(this.purpleOverlay){
            this.purpleOverlay.on('click', () => {
                this.purpleOverlayHandler.forEach(fn => fn());
            });
        }
    }

    //redraw the person with a new color
    public updatePerson(color: string){
        this.personGroup.destroyChildren();
        this.drawPerson(color);
        this.layer.draw();
    }

    //redraw the currency display with a new amount
    public updateCurrencyDisplay(currency: number){
        this.currencyText.text(`Currency: ${currency}`);
        this.currencyText.offsetX(this.currencyText.width() / 2);
        this.layer.draw();
    }

    //redraw the shop with ne= unlocked colors
    public updateShop(colorsAvailable: string[], colorsUnlocked: boolean[]){
        this.shopGroup.destroyChildren();
        this.createShop(
            colorsAvailable,
            colorsUnlocked
        );
        this.attachEventHandlers();
        this.layer.draw();
    }
}
