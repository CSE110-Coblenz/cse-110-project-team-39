import { BaseScreen } from '../../core/BaseScreen';
import { Card } from '../../types';
import { MinigameScreenModel, MinigameConfig } from './MinigameScreenModel';
import { MinigameScreenView } from './MinigameScreenView';
import { supabase, getUserProfile, updateUserProfile } from '../../lib/supabase';

export class MinigameScreenController extends BaseScreen {
  private view!: MinigameScreenView;
  private model!: MinigameScreenModel;
  private userId: string = '';
  private playerShipColor: string = '#60a5fa';
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  protected initialize(): void {
    this.initPromise = this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    // Load user profile for ship color
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.userId = user.id;
      const profile = await getUserProfile(user.id);
      if (profile) {
        this.playerShipColor = profile.ship_color;
      }
    }

    const config: MinigameConfig = {
      numberRange: { min: 1, max: 10 },
      targetRange: { min: 1, max: 100 },
      operations: ['+', '-', '×', '÷'],
      roundCount: 3,
    };

    this.model = new MinigameScreenModel(config);
    this.view = new MinigameScreenView(this.container, this.playerShipColor);

    this.setupEventHandlers();
    this.render();
    this.isInitialized = true;
  }

  private setupEventHandlers(): void {
    this.view.onExit(() => {
      this.isInitialized = false;
      this.view.destroy();
      this.screenManager.switchTo('menu');
    });

    this.view.onCardClick((card: Card) => {
      this.handleCardClick(card);
    });

    this.view.onSlotClick((slotIndex: number) => {
      this.handleSlotClick(slotIndex);
    });

    this.view.onSubmit(() => {
      this.handleSubmit();
    });

    this.view.onClear(() => {
      this.handleClear();
    });

    this.view.onNext(() => {
      this.handleNext();
    });

    this.view.onSwap((index1: number, index2: number) => {
      this.handleSwap(index1, index2);
    });
  }

  private handleCardClick(card: Card): void {
    const result = this.model.tryPlaceCard(card);

    if (result.success && result.targetSlot !== undefined) {
      this.view.animateCardToSlot(card.id, result.targetSlot, () => {
        this.render();
      });
    } else {
      this.view.shakeCard(card.id);
    }
  }

  private handleSlotClick(slotIndex: number): void {
    this.view.animateCardFromSlotToHand(slotIndex, () => {
      this.model.removeCardFromSlot(slotIndex);
      this.render();
    });
  }

  private handleSubmit(): void {
    const result = this.model.submitExpression();

    if (!result) {
      return;
    }

    const target = this.model.getTargetNumber();
    this.view.showResult(result.result, target, result.scoreEarned, result.isExact, result.roundWon);
    this.render();

    // Check if game is complete
    if (this.model.isLastRound()) {
      setTimeout(async () => {
        await this.handleGameComplete();
        const won = this.model.didWinGame();
        this.view.showGameComplete(this.model.getTotalScore(), won);
      }, 2000);
    }
  }

  private handleClear(): void {
    this.model.clearExpression();
    this.render();
  }

  private handleSwap(index1: number, index2: number): void {
    if (this.model.canSwapNumbers(index1, index2)) {
      this.view.animateSwap(index1, index2, () => {
        this.model.swapNumbers(index1, index2);
        this.render();
      });
    }
  }

  private handleNext(): void {
    this.view.hideFeedback();
    const hasMoreRounds = this.model.nextRound();

    if (hasMoreRounds) {
      this.render();
    } else {
      this.handleGameComplete().then(() => {
        const won = this.model.didWinGame();
        this.view.showGameComplete(this.model.getTotalScore(), won);
      });
    }
  }

  private async handleGameComplete(): Promise<void> {
    const totalScore = this.model.getTotalScore();
    const won = this.model.didWinGame();

    const userProfile = await getUserProfile(this.userId);
    if (!userProfile) return;

    if (won) {
      // Won: add positive score and bonus tokens
      await updateUserProfile(this.userId, {
        score: userProfile.score + totalScore,
        tokens: userProfile.tokens + 25,
        games_won: userProfile.games_won + 1,
      });
    } else {
      // Lost: score is already negative, so adding it subtracts from total
      await updateUserProfile(this.userId, {
        score: Math.max(0, userProfile.score + totalScore),
      });
    }
  }

  private async incrementGamesPlayed(): Promise<void> {
    const userProfile = await getUserProfile(this.userId);
    if (userProfile) {
      await updateUserProfile(this.userId, {
        games_played: userProfile.games_played + 1,
      });
    }
  }

  private render(): void {
    this.view.render(this.model.getState());
  }

  public async show(): Promise<void> {
    super.show();

    // Wait for initial async initialization to complete
    if (this.initPromise) {
      await this.initPromise;
    }

    // Re-create view if it was destroyed (e.g., after exiting and re-entering)
    if (!this.isInitialized) {
      await this.initializeAsync();
    }

    // Show loading screen with flying ship animation
    await new Promise<void>((resolve) => {
      this.view.showLoadingScreen(resolve);
    });

    // Increment games played on load
    await this.incrementGamesPlayed();
    // Reset game when showing the screen
    this.model.resetGame();
    this.view.hideFeedback();
    this.render();
  }
}
