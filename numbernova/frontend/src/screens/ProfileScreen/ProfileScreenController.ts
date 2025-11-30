import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { COLORS, DIMENSIONS } from '../../constants';
import { ProfileScreenView } from './ProfileScreenView';
import { ProfileScreenModel } from './ProfileScreenModel';

export class ProfileScreenController extends BaseScreen {

    private view: ProfileScreenView;
    private model: ProfileScreenModel;

   protected initialize(): void {
        this.model = new ProfileScreenModel('user123');

        this.view = new ProfileScreenView(   
              this.container,   
                this.model.getProfilePictureUrl(),
                this.model.getProfileName(),
                this.model.getGamesWon(),
                this.model.getGamesPlayed(),
                this.model.getScore(),
                this.model.getLevel(),
                this.model.getRank(),
                this.model.getShipColor(),
                this.model.getCurrency()
        );

        this.setupEventListeners();
    }

    public show(): void {
        super.show();
    }

    private setupEventListeners(): void {
        this.view.onMenuClick(() => {
            this.returnToMenu();
        });

        this.view.onEditProfileClick(() => {
            this.updateProfile();
        })
    }

    private returnToMenu(){
        this.screenManager.switchTo('menu');
    }

    private updateProfile(){
        const username = this.view.getInputUsername().trim();
        const profileURL = this.view.getInputProfileURL().trim();

        //handle the profile picture url first
        if(!(profileURL === "") && profileURL != null){
            this.model.updateProfilePicture(profileURL);
            this.view.updateProfilePicture(profileURL);
        }
        //handle the username update next
        if(!(username === "") && username != null){
            this.model.updateProfileName(username); 
            this.view.updateProfileName(username);
        }

        this.view.clearInputs();

    }
    
}