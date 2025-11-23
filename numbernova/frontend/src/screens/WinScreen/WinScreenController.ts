import Konva from 'konva';
import { BaseScreen } from '../../core/BaseScreen';
import { COLORS, DIMENSIONS } from '../../constants';

export class WinScreenController extends BaseScreen {
  protected initialize(): void {
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: DIMENSIONS.width,
      height: DIMENSIONS.height,
      fill: '#1a1a2e'
    });
    
    const title = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 150,
      text: 'VICTORY! 🎉',
      fontSize: 48,
      fontFamily: 'Jersey 10',
      fill: '#4ecdc4',
      align: 'center'
    });
    title.offsetX(title.width() / 2);
    
    const message = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 220,
      text: 'You defeated all the aliens!',
      fontSize: 24,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center'
    });
    message.offsetX(message.width() / 2);
    
    const returnButton = this.createReturnButton();
    
    this.container.add(background);
    this.container.add(title);
    this.container.add(message);
    this.container.add(returnButton);
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
    
    rect.on('click', () => {
      this.screenManager.switchTo('menu');
    });

    rect.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';
      rect.fill(COLORS?.primaryLight ?? '#8d75ff');
      this.container.getStage()?.draw();
    });
    
    rect.on('mouseleave', () => {
      document.body.style.cursor = 'default';
      rect.fill(COLORS?.primary ?? '#7b61ff');
      this.container.getStage()?.draw();
    });
    
    group.add(rect);
    group.add(text);
    
    return group;
  }
}