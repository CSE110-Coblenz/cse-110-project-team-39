import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';

export class ProfileScreenView {
    private profile: Konva.layer;
    private profilePicture : Konva.Circle;
    private usernameText : Konva.Text;
    private gamesWonText : Konva.Text;
    private gamesPlayedText : Konva.Text;
    private scoreText : Konva.Text;
    private levelText : Konva.Text;
    private rankText : Konva.Text;


    constructor(layer: Konva.Layer, profilePictureUrl: string, profileName: string, gamesWon: number, gamesPlayed: number, score: number, level: number, rank: string) {
        // Profile Picture
        this.profilePicture = new Konva.Circle({
            x: DIMENSIONS.width / 2,
            y: 150,
            radius: 60,
            fillPatternImage: undefined,
            fillPatternOffset: { x: 60, y: 60 },
            stroke: COLORS.text,
            strokeWidth: 4,
        });
        const imageObj = new Image();
        imageObj.onload = () => {
            this.profilePicture.fillPatternImage(imageObj);
            layer.draw();
        };
        imageObj.src = profilePictureUrl;

        // Username Text
        this.usernameText = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 230,
            text: profileName,
            fontSize: FONTS.subtitle,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
        });
        this.usernameText.offsetX(this.usernameText.width() / 2);

        // Stats Texts  
        this.gamesWonText = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 280,
            text: `Games Won: ${gamesWon}`,
            fontSize: FONTS.primary,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
        });
        this.gamesWonText.offsetX(this.gamesWonText.width() / 2);

        this.gamesPlayedText = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 310,
            text: `Games Played: ${gamesPlayed}`,
            fontSize: FONTS.primary,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
        });
        this.gamesPlayedText.offsetX(this.gamesPlayedText.width() / 2);

        this.scoreText = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 340,
            text: `Score: ${score}`,
            fontSize: FONTS.primary,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
        });
        this.scoreText.offsetX(this.scoreText.width() / 2);

        this.levelText = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 370,
            text: `Level: ${level}`,
            fontSize: FONTS.primary,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
        });
        this.levelText.offsetX(this.levelText.width() / 2);

        this.rankText = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 400,
            text: `Rank: ${rank}`,
            fontSize: FONTS.primary,
            fontFamily: 'Arial',
            fill: COLORS.text,
            align: 'center',
        });
        this.rankText.offsetX(this.rankText.width() / 2);

        // Add all elements to the layer
        layer.add(this.profilePicture);
        layer.add(this.usernameText);
        layer.add(this.gamesWonText);
        layer.add(this.gamesPlayedText);    
        layer.add(this.scoreText);
        layer.add(this.levelText);
        layer.add(this.rankText);

        this.profile = layer;
    
    }
}

