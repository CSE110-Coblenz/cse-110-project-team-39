import Konva from 'konva';
import { GamePlayScreenModel } from './GameplayScreenModel';
import { GamePlayScreenView } from './GameplayScreenView';
import { DIMENSIONS } from '../../constants';

export class GameplayScreenController {
  private layer: Konva.Layer;
  private model: GamePlayScreenModel;
  private view: GamePlayScreenView;
  private anim?: Konva.Animation;

  constructor(layer: Konva.Layer) {
    this.layer = layer;
    this.model = new GamePlayScreenModel();
    this.view = new GamePlayScreenView(this.layer);

    this.view.onHit(() => {
      if (!this.model.isRunning) return;
      this.model.addScore(1);
      this.view.setScoreText(this.model.score);
      this.randomizeTarget();
    });
  }

  setup() {
    this.model.start();
    this.anim = new Konva.Animation(() => {}, this.layer);
    this.anim.start();
  }

  teardown() {
    this.model.stop();
    this.anim?.stop();
    this.view.destroy();
  }

  private randomizeTarget() {
    const margin = 40;
    const x = margin + Math.random() * (DIMENSIONS.width - margin * 2);
    const y = margin + Math.random() * (DIMENSIONS.height - margin * 2);
    this.view.moveTarget(x, y);
  }
}
