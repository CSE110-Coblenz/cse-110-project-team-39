import { BaseScreen } from '../../core/BaseScreen';
import { GamePlayScreenModel } from './GameplayScreenModel';
import { GamePlayScreenView } from './GameplayScreenView';
import { WORLD_CONFIGS } from '../../config/worldConfig';
import { Card } from '../../types';

export class GameplayScreenController extends BaseScreen {
  private model!: GamePlayScreenModel;
  private view!: GamePlayScreenView;
  private worldNumber: number = 1;

  protected initialize(): void {
    // Don't initialize here - wait for setWorldNumber to be called
    // This is because initialize() runs in constructor before setWorldNumber()
  }

  private initializeWorld(): void {
    const config = WORLD_CONFIGS[this.worldNumber];

    // Clean up old view if it exists
    if (this.view) {
      this.view.destroy();
    }

    this.model = new GamePlayScreenModel(config);
    this.view = new GamePlayScreenView(this.container, config);

    this.setupEventHandlers();
    this.render();
  }

  private setupEventHandlers(): void {
    // Exit button
    this.view.onExit(() => {
      console.log('Exiting game...');
      this.screenManager.switchTo('menu');
    });

    // Fight button
    this.view.onFight(() => {
      this.handleFight();
    });

    // Clear button
    this.view.onClear(() => {
      this.view.animatePlayerArm();
      this.model.clearExpression();
      this.render();
    });

    // Swap button
    this.view.onSwap(() => {
      this.view.animatePlayerArm();
      // Animate swap first, then update model
      this.view.animateSwap(() => {
        this.model.swapNumbers();
        this.render();
        this.updatePlayerResult();
      });
    });

    // Card click - try to place in slot with animation
    this.view.onCardClick((card: Card) => {
      const result = this.model.tryPlaceCard(card);

      if (result.success && result.targetSlot !== undefined) {
        // Animate player arm
        this.view.animatePlayerArm();

        // Animate card to slot
        this.view.animateCardToSlot(card.id, result.targetSlot, () => {
          this.render();
          this.updatePlayerResult();
        });
      } else {
        // Shake card to indicate no space
        this.view.shakeCard(card.id);
      }
    });

    // Slot click - return card to hand
    this.view.onSlotClick((slotIndex: number) => {
      // Animate player arm and card back to hand
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
  
    setTimeout(() => {
      const gameState = this.model.getGameState();
      if (gameState === 'complete') {
        const resultScreen = this.screenManager.getScreen('result') as any;
        if (resultScreen && typeof resultScreen.setResult === 'function') {
          resultScreen.setResult(true);
        }
        this.screenManager.switchTo('result');
      } else if (gameState === 'lost') {
        const resultScreen = this.screenManager.getScreen('result') as any;
        if (resultScreen && typeof resultScreen.setResult === 'function') {
          resultScreen.setResult(false);
        }
        this.screenManager.switchTo('result');
      } else if (gameState === 'playing') {
        this.model.nextRound();
        this.render();
      }
    }, 2200);
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
    // Ensure world is initialized before showing
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
    // Re-initialize with new world config
    this.initializeWorld();
  }
}
