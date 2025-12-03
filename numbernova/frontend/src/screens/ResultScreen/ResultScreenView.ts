import Konva from 'konva';
import { ResultScreenModel } from './ResultScreenModel';
import { COLORS, DIMENSIONS } from '../../constants';

type VoidFn = () => void;

export class ResultScreenView {
  private layer: Konva.Layer;
  private model: ResultScreenModel;
  private returnButtonHandlers: VoidFn[] = [];

  onReturnToMenu(cb: VoidFn) {
    this.returnButtonHandlers.push(cb);
  }

  private emitReturnToMenu() {
    for (const cb of this.returnButtonHandlers) cb();
  }

  constructor(layer: Konva.Layer, model: ResultScreenModel) {
    this.layer = layer;
    this.model = model;
    this.render();
  }

  private render(): void {
    const title = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 150,
      text: this.model.getTitle(),
      fontSize: 48,
      fontFamily: 'Jersey 10',
      fill: this.model.getTitleColor(),
      align: 'center'
    });
    title.offsetX(title.width() / 2);

    const message = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 220,
      text: this.model.getMessage(),
      fontSize: 24,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center'
    });
    message.offsetX(message.width() / 2);

    const returnButton = this.createReturnButton();

    this.layer.removeChildren();
    this.layer.add(title);
    this.layer.add(message);
    this.layer.add(returnButton);
    this.layer.draw();
  }

  private createReturnButton(): Konva.Group {
    const group = new Konva.Group();

    const rect = new Konva.Rect({
      x: DIMENSIONS.width / 2 - 90,
      y: 300,
      width: 180,
      height: 50,
      fill: COLORS?.primary ?? '#7b61ff',
      cornerRadius: 10,
      listening: true
    });

    const text = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 300 + 25 - 8,
      text: 'Return to Main Menu',
      fontSize: 18,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center'
    });
    text.offsetX(text.width() / 2);

    const handleClick = () => {
      this.emitReturnToMenu();
    };

    rect.on('click', handleClick);
    text.on('click', handleClick);

    rect.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';
      rect.fill(COLORS?.primaryLight ?? '#8d75ff');
      this.layer.getStage()?.draw();
    });

    rect.on('mouseleave', () => {
      document.body.style.cursor = 'default';
      rect.fill(COLORS?.primary ?? '#7b61ff');
      this.layer.getStage()?.draw();
    });

    group.add(rect);
    group.add(text);

    return group;
  }

  public destroy(): void {
    this.layer.removeChildren();
  }
}
