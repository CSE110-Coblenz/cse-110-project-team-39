import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { ResultScreenModel } from './ResultScreenModel';
import { ResultScreenView } from './ResultScreenView';
import { COLORS, DIMENSIONS } from '../../constants';

export class ResultScreenController extends BaseScreen {
  private model!: ResultScreenModel;
  private view!: ResultScreenView;
  private worldNumber: number = 1;

  protected initialize(): void {
    this.model = new ResultScreenModel(false);
    this.view = new ResultScreenView(this.container, this.model);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.view.onReturnToMenu(() => {
      this.screenManager.switchTo('menu');
    });
  }

  public setResult(won: boolean, worldNumber: number = 1): void {
    this.worldNumber = worldNumber;
    this.model.setWon(won);
    this.view.destroy();
    this.view = new ResultScreenView(this.container, this.model);
    this.setupEventHandlers();

    // Save the result to the menu model
    const menuScreen = this.screenManager.getScreen('menu') as any;
    if (menuScreen && typeof menuScreen.saveLevelResult === 'function') {
      menuScreen.saveLevelResult(this.worldNumber, won ? 'won' : 'lost');
    }
  }

  public show(): void {
    super.show();
  }

  public destroy(): void {
    this.view?.destroy();
    super.destroy();
  }
}
