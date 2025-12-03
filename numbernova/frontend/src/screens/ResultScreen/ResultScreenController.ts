import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { ResultScreenModel } from './ResultScreenModel';
import { ResultScreenView } from './ResultScreenView';
import { COLORS, DIMENSIONS } from '../../constants';

export class ResultScreenController extends BaseScreen {
  private model!: ResultScreenModel;
  private view!: ResultScreenView;

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

  public setResult(won: boolean): void {
    this.model.setWon(won);
    this.view.destroy();
    this.view = new ResultScreenView(this.container, this.model);
    this.setupEventHandlers();
  }

  public show(): void {
    super.show();
  }

  public destroy(): void {
    this.view?.destroy();
    super.destroy();
  }
}
