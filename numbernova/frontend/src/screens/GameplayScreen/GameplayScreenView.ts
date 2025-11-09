import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';

export class GamePlayScreenView {
  private layer: Konva.Layer;
  private group: Konva.Group;
  private scoreText: Konva.Text;
  private target: Konva.Circle;
  private hitHandlers: Array<() => void> = [];

  constructor(layer: Konva.Layer) {
    this.layer = layer;
    this.group = new Konva.Group();
    const bg = new Konva.Rect({ x: 0, y: 0, width: DIMENSIONS.width, height: DIMENSIONS.height, fill: COLORS.background });
    this.scoreText = new Konva.Text({ x: 20, y: 20, text: 'Score: 0', fontSize: 24, fontFamily: 'Jersey 10', fill: COLORS.text });
    this.target = new Konva.Circle({ x: DIMENSIONS.width / 2, y: DIMENSIONS.height / 2, radius: 30, fill: COLORS.primary, listening: true });

    this.group.add(bg);
    this.group.add(this.scoreText);
    this.group.add(this.target);
    this.layer.add(this.group);

    const onClick = () => { this.emitHit(); };
    this.target.on('click', onClick);
    this.target.on('tap', onClick);

    this.layer.draw();
  }

  onHit(cb: () => void) { this.hitHandlers.push(cb); }
  private emitHit() { for (const cb of this.hitHandlers) cb(); }

  moveTarget(x: number, y: number) {
    this.target.position({ x, y });
    this.layer.batchDraw();
  }

  setScoreText(v: number) {
    this.scoreText.text(`Score: ${v}`);
    this.layer.batchDraw();
  }

  destroy() {
    this.group.destroy();
    this.layer.batchDraw();
  }
}
