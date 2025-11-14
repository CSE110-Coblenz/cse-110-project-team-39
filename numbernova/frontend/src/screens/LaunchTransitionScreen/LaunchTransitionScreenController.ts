import { BaseScreen } from '../../core/BaseScreen';
import { LaunchTransitionScreenModel } from './LaunchTransitionScreenModel';
import { LaunchTransitionScreenView } from './LaunchTransitionScreenView';

export class LaunchTransitionScreenController extends BaseScreen {
  private model: LaunchTransitionScreenModel;
  private view: LaunchTransitionScreenView;
  private planetNumber: number = 1;

  protected initialize(): void {
    this.model = new LaunchTransitionScreenModel(this.planetNumber);
    this.view = new LaunchTransitionScreenView(this.container);

    // When animation completes, switch to gameplay
    this.view.onComplete(() => {
      this.screenManager.switchTo('gameplay');
    });
  }

  public setPlanetNumber(num: number): void {
    this.planetNumber = num;
    this.model?.setPlanetNumber(num);
  }

  public show(): void {
    super.show();
    // Start animation when screen is shown
    this.view.playAnimation(this.planetNumber);
  }

  public destroy(): void {
    this.view?.destroy();
    super.destroy();
  }
}
