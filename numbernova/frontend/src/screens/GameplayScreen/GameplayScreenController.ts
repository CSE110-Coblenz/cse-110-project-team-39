import { BaseScreen } from '../../core/BaseScreen';
import { GamePlayScreenModel } from './GameplayScreenModel';
import { GamePlayScreenView } from './GameplayScreenView';
import { WORLD_CONFIGS } from '../../config/worldConfig';
import { Card } from '../../types';
import { getCurrentUser, getUserProfile, updateUserProfile } from '../../lib/supabase';

export class GameplayScreenController extends BaseScreen {
  private model!: GamePlayScreenModel;
  private view!: GamePlayScreenView;
  private worldNumber: number = 1;
  private userId!: string;
  private playerShipColor: string = '#60a5fa'; // Default blue
  private currentUserScore: number = 0;
  private gamesPlayedIncremented: boolean = false;

  protected initialize(): void {
    // Don't initialize here - wait for setWorldNumber to be called
    // This is because initialize() runs in constructor before setWorldNumber()
  }

  private async initializeWorld(): Promise<void> {
    try {
      // Load user data from backend
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('No user logged in');
        this.screenManager.switchTo('menu');
        return;
      }

      const userProfile = await getUserProfile(currentUser.id);
      if (!userProfile) {
        console.error('Failed to load user profile');
        this.screenManager.switchTo('menu');
        return;
      }

      // Store user data
      this.userId = currentUser.id;
      this.playerShipColor = userProfile.ship_color;
      this.currentUserScore = userProfile.score;

      const config = WORLD_CONFIGS[this.worldNumber];

      // Clean up old view if it exists
      if (this.view) {
        this.view.destroy();
      }

      this.model = new GamePlayScreenModel(config);
      this.view = new GamePlayScreenView(this.container, config, this.playerShipColor);

      this.setupEventHandlers();
      this.render();
    } catch (error) {
      console.error('Error initializing world:', error);
      this.screenManager.switchTo('menu');
    }
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

    setTimeout(async () => {
      const gameState = this.model.getGameState();

      if (gameState === 'complete') {
        console.log('Player wins the planet!');
        await this.handleGameWin();
        this.screenManager.switchTo('menu');
      } else if (gameState === 'lost') {
        console.log('Player lost all lives!');
        await this.handleGameLose();
        this.screenManager.switchTo('menu');
      } else if (result.won) {
        this.model.nextRound();
        this.render();
      } else {
        this.model.nextRound();
        this.render();
      }
    }, 2200);
  }

  private async handleGameWin(): Promise<void> {
    try {
      const pointsEarned = this.model.getPlayerScore();
      const userProfile = await getUserProfile(this.userId);

      if (userProfile) {
        await updateUserProfile(this.userId, {
          score: userProfile.score + pointsEarned,
          tokens: userProfile.tokens + 50,
          games_won: userProfile.games_won + 1
        });
        console.log(`Game won! Score +${pointsEarned}, Tokens +50, Wins +1`);
      }
    } catch (error) {
      console.error('Error updating game win:', error);
    }
  }

  private async handleGameLose(): Promise<void> {
    try {
      const pointsEarned = this.model.getPlayerScore();
      const userProfile = await getUserProfile(this.userId);

      if (userProfile) {
        const newScore = Math.max(0, userProfile.score - pointsEarned);
        await updateUserProfile(this.userId, {
          score: newScore
        });
        console.log(`Game lost! Score -${pointsEarned} (new score: ${newScore})`);
      }
    } catch (error) {
      console.error('Error updating game loss:', error);
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

  public async show(): Promise<void> {
    super.show();
    // Ensure world is initialized before showing
    if (!this.model || !this.view) {
      await this.initializeWorld();
    }

    // Reset game state for new game
    this.model.reset();
    this.render();

    // Increment games_played only once per game session
    if (!this.gamesPlayedIncremented && this.userId) {
      await this.incrementGamesPlayed();
      this.gamesPlayedIncremented = true;
    }
  }

  private async incrementGamesPlayed(): Promise<void> {
    try {
      const userProfile = await getUserProfile(this.userId);
      if (userProfile) {
        await updateUserProfile(this.userId, {
          games_played: userProfile.games_played + 1
        });
        console.log('Games played incremented');
      }
    } catch (error) {
      console.error('Error incrementing games_played:', error);
    }
  }

  public hide(): void {
    // Reset the flag so games_played increments on next game session
    this.gamesPlayedIncremented = false;
    super.hide();
  }

  public destroy(): void {
    this.view?.destroy();
    super.destroy();
  }

  public async setWorldNumber(num: number): Promise<void> {
    this.worldNumber = num;
    // Re-initialize with new world config
    await this.initializeWorld();
  }
}
