import { BaseScreen } from '../../core/BaseScreen';
import { MinigameScreenModel } from './MinigameScreenModel';
import { MinigameScreenView } from './MinigameScreenView';

export class MinigameScreenController extends BaseScreen {
  private view!: MinigameScreenView;
  private model!: MinigameScreenModel;

  protected initialize(): void {
    this.model = new MinigameScreenModel();
    this.view = new MinigameScreenView(this.container);

    this.view.onExit = success => {
      // change 'gameplay' to whatever your main game screen key is
      this.screenManager.switchTo('gameplay');
    };

    this.view.update(this.model.getState());
  }

  // Call this when you enter the minigame, with the starting number (in the red zone)
  public startWithValue(value: number): void {
    this.model.startRound(value);
    this.view.update(this.model.getState());
  }

  // Call this whenever the player evaluates their card expression in the minigame
  public updateFromExpressionResult(value: number): void {
    this.model.updateCurrentValue(value);
    const state = this.model.getState();

    this.view.update(state);

    if (state.isInGreenZone) {
      this.view.onExit?.(true);
    }
  }
}
