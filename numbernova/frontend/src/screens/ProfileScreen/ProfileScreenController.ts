import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { COLORS, DIMENSIONS } from '../../constants';
import { ProfileScreenView } from './ProfileScreenView';
import { ProfileScreenModel } from './ProfileScreenModel';

export class ProfileScreenController extends BaseScreen {

    private view: ProfileScreenView;
    private model: ProfileScreenModel;

   protected initialize(): void {
       this.model = new ProfileScreenModel('user123', {
           score: 1500,
           level: 5,
           ship_color: 'blue',
           rank: '5',
           profile_name: 'AcePilot',
           profile_picture_url: 'https://example.com/profile.jpg',
           games_played: 200,
           games_won: 120
       });

       this.view = new ProfileScreenView(   
              this.container,   
                this.model.getProfilePictureUrl(),
                this.model.getProfileName(),
                this.model.getGamesWon(),
                this.model.getGamesPlayed(),
                this.model.getScore(),
                this.model.getLevel(),
                this.model.getRank()
       );
   }

   public show(): void {
        super.show();
    }


    
}