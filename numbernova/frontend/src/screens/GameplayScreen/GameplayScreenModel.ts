import { WorldConfig } from '../../config/worldConfig';
import { Card, Alien, GameState, ExpressionSlot } from '../../types';

export class GamePlayScreenModel {
  private config: WorldConfig;
  private currentAlienIndex: number = 0;
  private aliens: Alien[] = [];
  private playerLives: number;
  private playerScore: number = 0;
  private playerHand: Card[] = [];
  private playerExpression: ExpressionSlot[] = [];
  private gameState: GameState = 'playing';

  constructor(config: WorldConfig) {
    this.config = config;
    this.playerLives = config.playerLives;
    this.initializeExpressionSlots();
    this.generateAllAliens();
    this.dealNewHand();
  }

  private initializeExpressionSlots(): void {
    // Slots: [Number 0] [Operation 1] [Number 2]
    this.playerExpression = [
      { index: 0, card: null }, // Left number
      { index: 1, card: null }, // Operation
      { index: 2, card: null }  // Right number
    ];
  }

  private generateAllAliens(): void {
    for (let i = 0; i < this.config.alienCount; i++) {
      this.aliens.push(this.generateAlien(i));
    }
  }

  private generateAlien(id: number): Alien {
    const expression: Card[] = [];

    // Progressive difficulty - aliens get stronger with tighter margins near the end
    // Aliens 0-2: 6-10 range (easy)
    // Aliens 3-5: 9-13 range (medium)
    // Aliens 6-8: 12-16 range (harder)
    // Alien 9: 15-18 range (hardest)
    const progressFactor = id / (this.config.alienCount - 1); // 0.0 to 1.0
    const baseStrength = Math.floor(6 + (progressFactor * 9)); // 6 to 15
    const rangeSize = Math.floor(5 - (progressFactor * 2)); // 5 to 3 (tighter at end)

    // Generate: num1 op num2 with controlled difficulty
    let num1: number;
    let num2: number;
    let op: string;
    let result: number;

    // Generate expression that hits target difficulty
    const attempts = 10;
    for (let i = 0; i < attempts; i++) {
      num1 = Math.floor(Math.random() * 8) + 2; // 2-9 for more interesting math
      num2 = Math.floor(Math.random() * 8) + 2;
      op = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];

      if (op === '+') result = num1 + num2;
      else if (op === '-') result = Math.max(0, num1 - num2); // No negatives
      else if (op === '×') result = num1 * num2;
      else if (op === '÷' && num2 !== 0) result = Math.floor(num1 / num2);
      else result = num1;

      // Check if result is in desired range
      const targetMin = baseStrength;
      const targetMax = baseStrength + rangeSize;

      if (result >= targetMin && result <= targetMax) {
        break; // Found good expression
      }
    }

    // Fallback if no good expression found
    if (!result!) {
      num1 = baseStrength;
      num2 = 0;
      op = '+';
      result = baseStrength;
    }

    expression.push({ id: `alien-${id}-0`, type: 'number', value: num1! });
    expression.push({ id: `alien-${id}-1`, type: 'operation', value: op! });
    expression.push({ id: `alien-${id}-2`, type: 'number', value: num2! });

    return { id, expression, result: result! };
  }

  private randomNumber(): number {
    return Math.floor(
      Math.random() * (this.config.numberRange.max - this.config.numberRange.min + 1) +
      this.config.numberRange.min
    );
  }

  private dealNewHand(): void {
    this.playerHand = [];

    const alien = this.getCurrentAlien();
    const alienTarget = alien ? alien.result : 10;

    // Progressive difficulty based on alien index
    const alienIndex = this.currentAlienIndex;
    const progressFactor = alienIndex / (this.config.alienCount - 1); // 0.0 to 1.0

    // Ensure player can win but also can lose
    // Strategy: Give them numbers that CAN beat the alien, but require smart play
    // Later aliens get tighter margins (harder to win)

    // Deal 3 number cards with intelligent distribution
    const numbers: number[] = [];

    // Difficulty multipliers get tighter as game progresses
    const highMultiplier = 0.45 - (progressFactor * 0.1); // 0.45 to 0.35
    const medMultiplier = 0.35 - (progressFactor * 0.1); // 0.35 to 0.25

    // First number: high enough to potentially contribute to winning
    const highNum = Math.floor(Math.random() * 3) + Math.max(4, Math.floor(alienTarget * highMultiplier));
    numbers.push(Math.min(highNum, this.config.numberRange.max));

    // Second number: medium value
    const medNum = Math.floor(Math.random() * 4) + Math.max(2, Math.floor(alienTarget * medMultiplier));
    numbers.push(Math.min(medNum, this.config.numberRange.max));

    // Third number: could be low or medium (gets slightly higher in later rounds)
    const lowBase = Math.floor(1 + progressFactor * 2); // 1 to 3
    const lowNum = Math.floor(Math.random() * 5) + lowBase;
    numbers.push(Math.min(lowNum, this.config.numberRange.max));

    // Verify player CAN win with these numbers
    let canWin = false;
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j) continue;
        // Check if any combination with + can beat alien
        if (numbers[i] + numbers[j] > alienTarget) {
          canWin = true;
          break;
        }
      }
      if (canWin) break;
    }

    // If can't win, boost one number (but less generous in later rounds)
    if (!canWin) {
      const boostFactor = 0.65 - (progressFactor * 0.15); // 0.65 to 0.5
      numbers[0] = Math.ceil(alienTarget * boostFactor);
      if (numbers[0] > this.config.numberRange.max) {
        numbers[0] = this.config.numberRange.max;
      }
      // Ensure second number can combine to win
      numbers[1] = Math.max(numbers[1], Math.ceil(alienTarget * (boostFactor - 0.1)));
      if (numbers[1] > this.config.numberRange.max) {
        numbers[1] = this.config.numberRange.max;
      }
    }

    // Add the number cards
    for (let i = 0; i < 3; i++) {
      this.playerHand.push({
        id: `card-num-${i}-${Date.now()}-${Math.random()}`,
        type: 'number',
        value: numbers[i]
      });
    }

    // Deal 2 operation cards (always include +)
    this.playerHand.push({
      id: `card-op-0-${Date.now()}-${Math.random()}`,
      type: 'operation',
      value: '+'
    });

    // Second operation can be random
    const secondOp = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];
    this.playerHand.push({
      id: `card-op-1-${Date.now()}-${Math.random()}`,
      type: 'operation',
      value: secondOp
    });
  }

  public getCurrentAlien(): Alien | null {
    return this.aliens[this.currentAlienIndex] || null;
  }

  public getPlayerHand(): Card[] {
    return this.playerHand;
  }

  public getPlayerExpression(): ExpressionSlot[] {
    return this.playerExpression;
  }

  public getPlayerLives(): number {
    return this.playerLives;
  }

  public getPlayerScore(): number {
    return this.playerScore;
  }

  public getAliensLeft(): number {
    return this.config.alienCount - this.currentAlienIndex;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  // Click-based: Try to place card in first available appropriate slot
  public tryPlaceCard(card: Card): { success: boolean; targetSlot?: number } {
    // Find appropriate empty slot based on card type
    if (card.type === 'number') {
      // Try left number slot first (index 0), then right (index 2)
      if (this.playerExpression[0].card === null) {
        return this.placeCardInSlot(card, 0);
      } else if (this.playerExpression[2].card === null) {
        return this.placeCardInSlot(card, 2);
      }
    } else if (card.type === 'operation') {
      // Operation goes in middle slot (index 1)
      if (this.playerExpression[1].card === null) {
        return this.placeCardInSlot(card, 1);
      }
    }

    // No available slot
    return { success: false };
  }

  private placeCardInSlot(card: Card, slotIndex: number): { success: boolean; targetSlot: number } {
    // Remove card from hand
    const handIndex = this.playerHand.findIndex(c => c.id === card.id);
    if (handIndex === -1) return { success: false, targetSlot: slotIndex };

    // Place card
    this.playerExpression[slotIndex].card = card;
    this.playerHand.splice(handIndex, 1);

    return { success: true, targetSlot: slotIndex };
  }

  public removeCardFromSlot(slotIndex: number): void {
    if (slotIndex < 0 || slotIndex >= this.playerExpression.length) return;

    const card = this.playerExpression[slotIndex].card;
    if (card) {
      this.playerHand.push(card);
      this.playerExpression[slotIndex].card = null;
    }
  }

  public swapNumbers(): void {
    // Swap cards in slots 0 and 2
    const leftCard = this.playerExpression[0].card;
    const rightCard = this.playerExpression[2].card;

    this.playerExpression[0].card = rightCard;
    this.playerExpression[2].card = leftCard;
  }

  public clearExpression(): void {
    this.playerExpression.forEach(slot => {
      if (slot.card) {
        this.playerHand.push(slot.card);
        slot.card = null;
      }
    });
  }

  public evaluateExpression(slots: ExpressionSlot[]): number {
    const leftNum = slots[0].card;
    const operation = slots[1].card;
    const rightNum = slots[2].card;

    if (!leftNum || !rightNum) return 0;

    const num1 = typeof leftNum.value === 'number' ? leftNum.value : parseInt(leftNum.value);
    const num2 = typeof rightNum.value === 'number' ? rightNum.value : parseInt(rightNum.value);

    if (!operation) return num1; // Just the first number

    const op = operation.value as string;

    if (op === '+') return num1 + num2;
    if (op === '-') return num1 - num2;
    if (op === '×') return num1 * num2;
    if (op === '÷' && num2 !== 0) return Math.floor(num1 / num2);

    return num1;
  }

  public submitExpression(): { won: boolean; playerResult: number; alienResult: number } {
    const alien = this.getCurrentAlien();
    if (!alien) return { won: false, playerResult: 0, alienResult: 0 };

    const playerResult = this.evaluateExpression(this.playerExpression);
    const alienResult = alien.result;

    const won = playerResult > alienResult;

    if (won) {
      this.playerScore += 100;
      this.currentAlienIndex++;

      if (this.currentAlienIndex >= this.config.alienCount) {
        this.gameState = 'complete';
      }
    } else {
      this.playerLives--;

      if (this.playerLives <= 0) {
        this.gameState = 'lost';
      }
    }

    return { won, playerResult, alienResult };
  }

  public nextRound(): void {
    this.clearExpression();
    this.dealNewHand();
  }

  public reset(): void {
    this.currentAlienIndex = 0;
    this.playerLives = this.config.playerLives;
    this.playerScore = 0;
    this.gameState = 'playing';
    this.generateAllAliens();
    this.clearExpression();
    this.dealNewHand();
  }
}
