import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
import { KonvaInput } from '../../components/KonvaInput';
type VoidFn = () => void;

export class ProfileScreenView {
    private profile: Konva.layer;

    private stars : Konva.Group;
    private statsTitle : Konva.Text;
    private scoreText : Konva.Text;
    private levelText : Konva.Text
    private shipColorText : Konva.Text;
    private rankText : Konva.Text;
    private profilePicture : Konva.Circle;
    private usernameText : Konva.Text;
    private gamesWonText : Konva.Text;
    private gamesPlayedText : Konva.Text;
    private currencyText : Konva.Text;  

    private statsBackground : Konva.Rect;

    // button to go back to menu

    private menuButton: {group: Konva.Group, rect: Konva.Rect, text: Konva.Text};

    // button to edit profile

    private editProfileButton : {group: Konva.Group, rect: Konva.Rect, text: Konva.Text};

    private editProfileGroup: Konva.Group | null;
    private newUserNameInput: Konva.Input;
    private newPictureInput: Konva.Input;


    // handlers
    private menuHandler: VoidFn[] = [];
    private editProfileHandler: VoidFn[] = [];

    //events to handle button clicks
    onMenuClick(cb: VoidFn) {this.menuHandler.push(cb);}
    onEditProfileClick(cb: VoidFn) {this.editProfileHandler.push(cb);}

    constructor(layer: Konva.Layer, profilePictureUrl: string, profileName: string, gamesWon: number, gamesPlayed: number, score: number, level: number, rank: string, shipColor: string, currency: number) {
        // Profile Picture
        //create a profile screen with the profile circle and username on the left side of the screen and the 
        // stats on the right side of the screen

        this.profilePicture = new Konva.Circle({
            x: DIMENSIONS.width * 0.25,
            y: DIMENSIONS.height * 0.3,
            radius: 80,
            fillPatternImage: profilePictureUrl ? undefined : undefined,
            stroke: COLORS.text,
            strokeWidth: 4,
        });

        this.usernameText = new Konva.Text({
            x: DIMENSIONS.width * 0.25 - 75,
            y: DIMENSIONS.height * 0.45,
            text: profileName,
            fontFamily: FONTS.subtitle,
            fontSize: 48,
            fill: COLORS.text,
            width: 150,
            align: 'center',
        });

        this.statsBackground = new Konva.Rect({
            x: DIMENSIONS.width * 0.55,
            y: DIMENSIONS.height * 0.2,
            width: DIMENSIONS.width * 0.35,
            height: DIMENSIONS.height * 0.5,
            fill: COLORS.primaryDark,
            cornerRadius    : 10,
            stroke: COLORS.text,
            strokeWidth: 2,
        });
        
        this.statsTitle = new Konva.Text({
            x: DIMENSIONS.width * 0.55 + 20,
            y: DIMENSIONS.height * 0.22,
            text: profileName + '\'s Stats',
            fontSize: 42,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });
        this.scoreText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.30,
            text: `Score: ${score}`,
            fontSize: 36,
            fontFamily: FONTS.primary,         
            fill: COLORS.text,
        });

        this.levelText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.35,
            text: `Level: ${level}`,
            fontSize: 36,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });

        this.rankText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.40,
            text: `Rank: ${rank}`,
            fontSize: 36,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });

        this.gamesWonText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.45,
            text: `Games Won: ${gamesWon}`,
            fontSize: 36,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });

        this.gamesPlayedText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.50,
            text: `Games Played: ${gamesPlayed}`,
            fontSize: 36,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });

        this.currencyText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.55,
            text: `Currency: ${currency}`,
            fontSize: 36,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });

        this.shipColorText = new Konva.Text({
            x: DIMENSIONS.width * 0.6,
            y: DIMENSIONS.height * 0.60,
            text: `Ship Color: ${shipColor}`,
            fontSize: 36,
            fontFamily: FONTS.primary,
            fill: COLORS.text,
        });

        //create 

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


        this.createStars(this.stars = new Konva.Group(), 100, 0.2, 1.5);

        this.newUserNameInput = new KonvaInput({
            x: 0,
            y: 0,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'enter new username',
            type: 'text'
        });

        this.newPictureInput = new KonvaInput({
            x: 0,
            y: DIMENSIONS.inputHeight * 2,
            width: DIMENSIONS.inputWidth,
            height: DIMENSIONS.inputHeight,
            placeholder: 'enter new profile picture url',
            type: 'text'
        });

        this.editProfileButton = {
            group: new Konva.Group(),
            rect: new Konva.Rect({
            x: 0,
            y: DIMENSIONS.inputHeight * 4,
            width: 220,
            height: 60,
            fill: COLORS?.primary || '#7b61ff',
            cornerRadius: 16,
            listening: true
            }),
            text: new Konva.Text({
            text: 'Update Profile',
            x: 0 + 20,
            y: DIMENSIONS.inputHeight * 4 + 20,
            fontSize: 22,
            fontFamily: FONTS.label || 'Arial',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle'
            })
        };
       
        this.editProfileButton.group.add(this.editProfileButton.rect);
        this.editProfileButton.group.add(this.editProfileButton.text);

        this.editProfileGroup = new Konva.Group({
            x: DIMENSIONS.width * 0.25 - 75,
            y: DIMENSIONS.height * 0.55,
        });

        this.editProfileGroup.add(this.newUserNameInput);
        this.editProfileGroup.add(this.newPictureInput);
        this.editProfileGroup.add(this.editProfileButton.group);

        layer.add(this.stars);
        layer.add(this.profilePicture);
        layer.add(this.usernameText);
        layer.add(this.statsBackground);
        layer.add(this.statsTitle);
        layer.add(this.scoreText);
        layer.add(this.levelText);
        layer.add(this.rankText);   
        layer.add(this.gamesWonText);
        layer.add(this.gamesPlayedText);
        layer.add(this.currencyText);
        layer.add(this.shipColorText);
        layer.add(this.menuButton.group);
        layer.add(this.editProfileGroup);
        this.attachEventHandlers();
        this.profile = layer;
        this.profile.draw();    
    }

    private createStars(group: Konva.Group, count: number, opacityBase: number, maxRadius: number) {
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

    private updateProfilePicture(newUrl: string) {
        this.profilePicture.fillPatternImage(newUrl ? undefined : undefined);
        this.profile.draw();
    }
    
    private updateProfileName(newName: string) {
        this.usernameText.text(newName);
        this.statsTitle.text(newName + '\'s Stats');
        this.profile.draw();
    }

    private attachEventHandlers(){
        this.menuButton.group.on('click', () => {
            this.menuHandler.forEach(fn => fn());
        });
    }

}

