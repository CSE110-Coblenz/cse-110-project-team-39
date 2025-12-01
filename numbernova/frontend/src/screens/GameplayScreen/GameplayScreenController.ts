import { BaseScreen } from '../../core/BaseScreen';
import { GamePlayScreenModel } from './GameplayScreenModel';
import { GamePlayScreenView } from './GameplayScreenView';
import { WORLD_CONFIGS } from '../../config/worldConfig';
import { Card } from '../../types';

export class GameplayScreenController extends BaseScreen {
  private model!: GamePlayScreenModel;
  private view!: GamePlayScreenView;
  private worldNumber: number = 1;

  protected initialize(): void {}

  private initializeWorld(): void {
    const config = WORLD_CONFIGS[this.worldNumber];

    if (this.view) {
      this.view.destroy();
    }

    this.model = new GamePlayScreenModel(config);
    this.view = new GamePlayScreenView(this.container, config);

    this.setupEventHandlers();
    this.render();
  }

  private setupEventHandlers(): void {
    this.view.onExit(() => {
      console.log('Exiting game...');
      this.screenManager.switchTo('menu');
    });

    this.view.onFight(() => {
      this.handleFight();
    });

    this.view.onClear(() => {
      this.view.animatePlayerArm();
      this.model.clearExpression();
      this.render();
    });

    this.view.onSwap(() => {
      this.view.animatePlayerArm();
      this.view.animateSwap(() => {
        this.model.swapNumbers();
        this.render();
        this.updatePlayerResult();
      });
    });

    this.view.onCardClick((card: Card) => {
      const result = this.model.tryPlaceCard(card);

      if (result.success && result.targetSlot !== undefined) {
        this.view.animatePlayerArm();
        this.view.animateCardToSlot(card.id, result.targetSlot, () => {
          this.render();
          this.updatePlayerResult();
        });
      } else {
        this.view.shakeCard(card.id);
      }
    });

    this.view.onSlotClick((slotIndex: number) => {
      this.view.animatePlayerArm();
      this.view.animateCardFromSlotToHand(slotIndex, () => {
        this.model.removeCardFromSlot(slotIndex);
        this.render();
        this.updatePlayerResult();
      });
    });
  }

  private handleFight(): void {
    const result = this.model.submitExpression();

    this.view.showResult(result.won, result.playerResult, result.alienResult);

    const gameState = this.model.getGameState();

    if (gameState === 'complete') {
      console.log('Player wins the planet!');
      this.screenManager.switchTo('menu');
    } else if (gameState === 'lost') {
      console.log('Player lost all lives!');
      this.screenManager.switchTo('menu');
    } else {
      this.model.nextRound();
      this.render();
    }
  }

  private updatePlayerResult(): void {
    const playerExpression = this.model.getPlayerExpression();
    const result = this.model.evaluateExpression(playerExpression);
    this.view.updatePlayerResult(result);
  }

  private render(): void {
    const alien = this.model.getCurrentAlien();
    const playerHand = this.model.getPlayerHand();
    const playerExpression = this.model.getPlayerExpression();
    const score = this.model.getPlayerScore();
    const aliensLeft = this.model.getAliensLeft();
    const lives = this.model.getPlayerLives();

    this.view.renderAlienExpression(alien);
    this.view.renderHand(playerHand);
    this.view.renderPlayerExpression(playerExpression);
    this.view.updateTopBar(score, aliensLeft, lives);
    this.updatePlayerResult();
  }

  public show(): void {
    super.show();
    if (!this.model || !this.view) {
      this.initializeWorld();
    }
    this.model.reset();
    this.render();
  }

  public destroy(): void {
    this.view?.destroy();
    super.destroy();
  }

  public setWorldNumber(num: number): void {
    this.worldNumber = num;
    this.initializeWorld();
  }
}
