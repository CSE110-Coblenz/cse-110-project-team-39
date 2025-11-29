import Konva from 'konva';
import { MinigameState } from './MinigameScreenModel';

export class MinigameScreenView {
  private container: any;
  private layer: Konva.Layer;
  private barRect: Konva.Rect;
  private greenRect: Konva.Rect;
  private pointer: Konva.Line;
  private valueLabel: Konva.Text;

  public onExit?: (success: boolean) => void;

  private barX = 100;
  private barY = 250;
  private barWidth = 600;
  private barHeight = 40;

  constructor(container: any) {
    this.container = container;
    this.layer = new Konva.Layer();

    const stage = this.container.getStage?.();
    if (stage) {
      stage.add(this.layer);
    }

    this.barRect = new Konva.Rect({
      x: this.barX,
      y: this.barY,
      width: this.barWidth,
      height: this.barHeight,
      fill: '#c0392b',
      cornerRadius: 10,
    });

    this.greenRect = new Konva.Rect({
      x: this.barX,
      y: this.barY,
      width: this.barWidth / 3,
      height: this.barHeight,
      fill: '#27ae60',
      cornerRadius: 10,
    });

    this.pointer = new Konva.Line({
      points: [this.barX, this.barY - 20, this.barX, this.barY + this.barHeight + 20],
      stroke: '#ffffff',
      strokeWidth: 3,
    });

    this.valueLabel = new Konva.Text({
      x: this.barX,
      y: this.barY - 50,
      width: this.barWidth,
      align: 'center',
      fontSize: 32,
      fontFamily: 'Jersey 10, sans-serif',
      fill: '#ffffff',
      text: '',
    });

    this.layer.add(this.barRect);
    this.layer.add(this.greenRect);
    this.layer.add(this.pointer);
    this.layer.add(this.valueLabel);

    this.layer.draw();
  }

  public update(state: MinigameState): void {
    const range = state.maxValue - state.minValue || 1;

    const valueRatio = (state.currentValue - state.minValue) / range;
    const startRatio = (state.targetMin - state.minValue) / range;
    const endRatio = (state.targetMax - state.minValue) / range;

    const pointerX = this.barX + valueRatio * this.barWidth;
    const greenX = this.barX + startRatio * this.barWidth;
    const greenWidth = (endRatio - startRatio) * this.barWidth;

    this.greenRect.x(greenX);
    this.greenRect.width(greenWidth);
    this.valueLabel.text(state.currentValue.toString());
    this.pointer.points([pointerX, this.barY - 20, pointerX, this.barY + this.barHeight + 20]);

    this.layer.draw();
  }
}
