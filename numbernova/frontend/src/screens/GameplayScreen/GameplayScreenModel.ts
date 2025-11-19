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
      op = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];

      // For factorial, use smaller numbers (1-8)
      if (op === '!') {
        num1 = Math.floor(Math.random() * 8) + 1; // 1-8
        num2 = 0; // Factorial ignores second number
        result = this.factorial(num1);
      }
      // For exponent, use smaller numbers to avoid huge results
      else if (op === '^') {
        num1 = Math.floor(Math.random() * 5) + 2; // 2-6
        num2 = Math.floor(Math.random() * 3) + 2; // 2-4
        result = Math.pow(num1, num2);
      }
      // For other operations, use larger numbers
      else {
        num1 = Math.floor(Math.random() * 8) + 2; // 2-9 for more interesting math
        num2 = Math.floor(Math.random() * 8) + 2;

        if (op === '+') result = num1 + num2;
        else if (op === '-') result = Math.max(0, num1 - num2); // No negatives
        else if (op === '×') result = num1 * num2;
        else if (op === '÷' && num2 !== 0) result = Math.floor(num1 / num2);
        else result = num1;
      }

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

    // Decide which operations to deal (ensure they're different)
    const firstOp = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];
    let secondOp: string;

    if (this.config.operations.length > 1) {
      // Pick a different operation
      do {
        secondOp = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];
      } while (secondOp === firstOp);
    } else {
      // Only one operation available, use it
      secondOp = firstOp;
    }

    // For factorial/exponent world, decide how many number cards to deal
    const hasFactorial = firstOp === '!' || secondOp === '!';
    const hasExponent = firstOp === '^' || secondOp === '^';

    let numNumberCards = 3; // Default
    if (this.config.operations.includes('!')) {
      // World 5 logic: smart card dealing
      if (hasFactorial && !hasExponent) {
        numNumberCards = 2; // Factorial only needs 1 number, give 2 for flexibility
      } else if (!hasFactorial && hasExponent) {
        numNumberCards = 3; // Exponent needs 2 numbers
      } else {
        numNumberCards = 3; // Mixed or both
      }
    }

    // Deal number cards with intelligent distribution (ensure all different)
    const numbers: number[] = [];
    const range = this.config.numberRange.max - this.config.numberRange.min + 1;

    for (let i = 0; i < numNumberCards; i++) {
      let num: number;
      let attempts = 0;

      // Keep trying until we get a unique number (max 50 attempts to avoid infinite loop)
      do {
        if (this.config.operations.includes('!') || this.config.operations.includes('^')) {
          // For factorial/exponent worlds, use full range randomly
          num = Math.floor(Math.random() * range) + this.config.numberRange.min;
        } else {
          // For other worlds, distribute across the range intelligently
          // First card: upper 60% of range
          // Second card: middle 60% of range
          // Third card: lower 60% of range
          let subRangeSize = Math.ceil(range * 0.6);
          let subRangeStart: number;

          if (i === 0) {
            // Upper range: max down to 40% of the way
            subRangeStart = this.config.numberRange.max - subRangeSize + 1;
          } else if (i === 1) {
            // Middle range: centered
            subRangeStart = this.config.numberRange.min + Math.floor(range * 0.2);
          } else {
            // Lower range: min up to 60% of the way
            subRangeStart = this.config.numberRange.min;
          }

          num = Math.floor(Math.random() * subRangeSize) + subRangeStart;
          num = Math.max(this.config.numberRange.min, Math.min(num, this.config.numberRange.max));
        }

        attempts++;
      } while (numbers.includes(num) && attempts < 50);

      numbers.push(num);
    }

    // Verify player CAN win with these numbers and operations
    let canWin = false;

    // Check with the operations we're actually dealing
    const opsToCheck = [firstOp, secondOp];

    for (const op of opsToCheck) {
      if (op === '!') {
        // Factorial only needs one number
        for (const num of numbers) {
          if (this.factorial(num) > alienTarget) {
            canWin = true;
            break;
          }
        }
      } else {
        // Binary operations need two numbers
        for (let i = 0; i < numbers.length; i++) {
          for (let j = 0; j < numbers.length; j++) {
            if (i === j) continue;

            let testResult = 0;
            if (op === '+') testResult = numbers[i] + numbers[j];
            else if (op === '-') testResult = numbers[i] - numbers[j];
            else if (op === '×') testResult = numbers[i] * numbers[j];
            else if (op === '÷' && numbers[j] !== 0) testResult = Math.floor(numbers[i] / numbers[j]);
            else if (op === '^') testResult = Math.pow(numbers[i], numbers[j]);

            if (testResult > alienTarget) {
              canWin = true;
              break;
            }
          }
          if (canWin) break;
        }
      }
      if (canWin) break;
    }

    // If can't win, boost numbers appropriately for this world
    if (!canWin) {
      // For factorial/exponent worlds, adjust to good factorial/exponent numbers
      if (this.config.operations.includes('!')) {
        // For factorial, we need numbers whose factorial beats the target
        // Find smallest n where n! > alienTarget
        for (let n = this.config.numberRange.min; n <= this.config.numberRange.max; n++) {
          if (this.factorial(n) > alienTarget) {
            numbers[0] = n;
            canWin = true;
            break;
          }
        }
        // Add another strategic number for exponents if we have room
        if (numbers.length > 1 && hasExponent) {
          // For exponents, smaller bases with good powers
          numbers[1] = Math.min(Math.max(2, Math.ceil(Math.pow(alienTarget, 0.4))), this.config.numberRange.max);
        }
      }
      // For multiplication worlds, moderate numbers needed
      else if (this.config.operations.includes('×')) {
        numbers[0] = Math.min(Math.max(this.config.numberRange.min, Math.ceil(alienTarget * 0.4)), this.config.numberRange.max);
        if (numbers.length > 1) {
          numbers[1] = Math.min(Math.max(this.config.numberRange.min, Math.ceil(alienTarget * 0.3)), this.config.numberRange.max);
        }
      }
      // For addition/subtraction worlds, large numbers needed
      else {
        const boostFactor = 0.65 - (progressFactor * 0.15);
        numbers[0] = Math.min(Math.max(this.config.numberRange.min, Math.ceil(alienTarget * boostFactor)), this.config.numberRange.max);
        if (numbers.length > 1) {
          numbers[1] = Math.min(Math.max(this.config.numberRange.min, Math.ceil(alienTarget * (boostFactor - 0.1))), this.config.numberRange.max);
        }
      }
    }

    // Add the number cards (variable amount based on operations)
    for (let i = 0; i < numbers.length; i++) {
      this.playerHand.push({
        id: `card-num-${i}-${Date.now()}-${Math.random()}`,
        type: 'number',
        value: numbers[i]
      });
    }

    // Deal 2 operation cards (already decided at the top)
    this.playerHand.push({
      id: `card-op-0-${Date.now()}-${Math.random()}`,
      type: 'operation',
      value: firstOp
    });

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
      // Check if we have a factorial operation - if so, only allow left slot
      const operation = this.playerExpression[1].card;
      const isFactorial = operation && operation.value === '!';

      // Try left number slot first (index 0)
      if (this.playerExpression[0].card === null) {
        return this.placeCardInSlot(card, 0);
      } else if (this.playerExpression[2].card === null && !isFactorial) {
        // Only allow right slot if NOT factorial
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

    // Special handling: If we just placed a factorial operation and there's a second number, return it to hand
    if (slotIndex === 1 && card.value === '!' && this.playerExpression[2].card !== null) {
      const secondNumber = this.playerExpression[2].card;
      this.playerHand.push(secondNumber);
      this.playerExpression[2].card = null;
    }

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

    if (!leftNum) return 0;

    const num1 = typeof leftNum.value === 'number' ? leftNum.value : parseInt(leftNum.value);

    if (!operation) return num1; // Just the first number

    const op = operation.value as string;

    // Factorial is unary - ignores second number
    if (op === '!') {
      return this.factorial(num1);
    }

    // All other operations need a second number
    if (!rightNum) return num1;
    const num2 = typeof rightNum.value === 'number' ? rightNum.value : parseInt(rightNum.value);

    if (op === '+') return num1 + num2;
    if (op === '-') return num1 - num2;
    if (op === '×') return num1 * num2;
    if (op === '÷' && num2 !== 0) return Math.floor(num1 / num2);
    if (op === '^') return Math.pow(num1, num2);

    return num1;
  }

  private factorial(n: number): number {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    if (n > 10) return 3628800; // Cap at 10! to prevent overflow

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
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
