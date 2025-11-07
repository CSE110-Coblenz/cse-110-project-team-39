import { LeaderboardScreenView } from './LeaderboardScreenView';
import { LeaderboardScreenModel } from './LeaderboardScreenModel';

export class LeaderboardScreenController {
    private view: LeaderboardScreenView;
    private model: LeaderboardScreenModel;
    
    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.model = new LeaderboardScreenModel();
        this.view = new LeaderboardScreenView(layer);

        this.model.getLeaderboard().then((leaderboard) => {
            console.log(leaderboard);
        });
        console.log('LeaderboardScreen loaded successfully!');
    }
}