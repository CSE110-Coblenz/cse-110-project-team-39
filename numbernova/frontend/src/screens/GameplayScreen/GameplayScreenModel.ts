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
    // Aliens will be generated on-demand when needed, not upfront
    // This allows us to generate them AFTER player cards are dealt
    this.aliens = [];
  }

  private generateAlienWithTarget(id: number, targetResult: number): Alien {
    const expression: Card[] = [];

    // Pick a random operation from available ops
    const op = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];

    let num1: number;
    let num2: number;
    let result: number;

    // Try to generate an expression that equals or is close to targetResult
    if (op === '!') {
      // Factorial - find number whose factorial is closest to target
      let bestNum = this.config.numberRange.min;
      let bestDiff = Infinity;

      for (let n = this.config.numberRange.min; n <= this.config.numberRange.max; n++) {
        const factResult = this.factorial(n);
        const diff = Math.abs(factResult - targetResult);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestNum = n;
        }
      }

      num1 = bestNum;
      num2 = 0;
      result = this.factorial(num1);
    } else if (op === '^') {
      // Exponent - try combinations
      let bestNum1 = 2;
      let bestNum2 = 2;
      let bestDiff = Infinity;

      for (let base = this.config.numberRange.min; base <= this.config.numberRange.max; base++) {
        for (let exp = this.config.numberRange.min; exp <= this.config.numberRange.max; exp++) {
          const expResult = Math.pow(base, exp);
          const diff = Math.abs(expResult - targetResult);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestNum1 = base;
            bestNum2 = exp;
          }
        }
      }

      num1 = bestNum1;
      num2 = bestNum2;
      result = Math.pow(num1, num2);
    } else {
      // Binary operations - work backwards from target with randomness
      if (op === '+') {
        // a + b = target, pick a randomly, solve for b
        // Add some variation so we don't always get the same split
        const maxNum1 = Math.min(targetResult, this.config.numberRange.max);
        num1 = Math.floor(Math.random() * (maxNum1 - this.config.numberRange.min + 1)) + this.config.numberRange.min;
        num2 = Math.max(this.config.numberRange.min, Math.min(this.config.numberRange.max, targetResult - num1));
        result = num1 + num2;
      } else if (op === '-') {
        // a - b = target, pick b randomly, solve for a
        // Vary b to get different expressions for same target
        const maxNum2 = Math.min(targetResult + this.config.numberRange.max, this.config.numberRange.max);
        num2 = Math.floor(Math.random() * (maxNum2 - this.config.numberRange.min + 1)) + this.config.numberRange.min;
        num1 = Math.max(this.config.numberRange.min, Math.min(this.config.numberRange.max, targetResult + num2));
        result = Math.max(0, num1 - num2);
      } else if (op === '×') {
        // a × b = target, find factors close to target and pick randomly from good options
        const goodPairs: Array<{a: number, b: number, result: number}> = [];

        for (let a = this.config.numberRange.min; a <= this.config.numberRange.max; a++) {
          for (let b = this.config.numberRange.min; b <= this.config.numberRange.max; b++) {
            const prod = a * b;
            const diff = Math.abs(prod - targetResult);
            // Accept pairs within 30% of target
            if (diff <= targetResult * 0.3) {
              goodPairs.push({a, b, result: prod});
            }
          }
        }

        if (goodPairs.length > 0) {
          // Pick a random good pair
          const chosen = goodPairs[Math.floor(Math.random() * goodPairs.length)];
          num1 = chosen.a;
          num2 = chosen.b;
          result = chosen.result;
        } else {
          // Fallback: just pick best
          let bestNum1 = this.config.numberRange.min;
          let bestNum2 = this.config.numberRange.min;
          let bestDiff = Infinity;

          for (let a = this.config.numberRange.min; a <= this.config.numberRange.max; a++) {
            for (let b = this.config.numberRange.min; b <= this.config.numberRange.max; b++) {
              const prod = a * b;
              const diff = Math.abs(prod - targetResult);
              if (diff < bestDiff) {
                bestDiff = diff;
                bestNum1 = a;
                bestNum2 = b;
              }
            }
          }
          num1 = bestNum1;
          num2 = bestNum2;
          result = num1 * num2;
        }
      } else if (op === '÷') {
        // a ÷ b = target, vary the divisor for different expressions
        // Pick b randomly from valid divisors
        const validDivisors = [];
        for (let b = Math.max(1, this.config.numberRange.min); b <= this.config.numberRange.max; b++) {
          const a = targetResult * b;
          if (a >= this.config.numberRange.min && a <= this.config.numberRange.max) {
            validDivisors.push(b);
          }
        }

        if (validDivisors.length > 0) {
          num2 = validDivisors[Math.floor(Math.random() * validDivisors.length)];
          num1 = targetResult * num2;
        } else {
          // Fallback
          num2 = Math.max(1, Math.floor(Math.random() * (this.config.numberRange.max - this.config.numberRange.min + 1)) + this.config.numberRange.min);
          num1 = Math.max(this.config.numberRange.min, Math.min(this.config.numberRange.max, targetResult * num2));
        }
        result = parseFloat((num1 / num2).toFixed(1));
      } else {
        // Fallback
        num1 = this.config.numberRange.min;
        num2 = this.config.numberRange.min;
        result = num1;
      }
    }

    expression.push({ id: `alien-${id}-0`, type: 'number', value: num1 });
    expression.push({ id: `alien-${id}-1`, type: 'operation', value: op });
    expression.push({ id: `alien-${id}-2`, type: 'number', value: num2 });

    return { id, expression, result };
  }

  private randomNumber(): number {
    return Math.floor(
      Math.random() * (this.config.numberRange.max - this.config.numberRange.min + 1) +
      this.config.numberRange.min
    );
  }

  private calculateMinMaxResults(numbers: number[], operations: string[]): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;

    for (const op of operations) {
      if (op === '!') {
        // Factorial - unary
        for (const num of numbers) {
          const result = this.factorial(num);
          min = Math.min(min, result);
          max = Math.max(max, result);
        }
      } else {
        // Binary operations
        for (let i = 0; i < numbers.length; i++) {
          for (let j = 0; j < numbers.length; j++) {
            if (i === j) continue;

            let result = 0;
            if (op === '+') result = numbers[i] + numbers[j];
            else if (op === '-') result = numbers[i] - numbers[j];
            else if (op === '×') result = numbers[i] * numbers[j];
            else if (op === '÷' && numbers[j] !== 0) result = parseFloat((numbers[i] / numbers[j]).toFixed(1));
            else if (op === '^') result = Math.pow(numbers[i], numbers[j]);

            min = Math.min(min, result);
            max = Math.max(max, result);
          }
        }
      }
    }

    return { min, max };
  }

  private dealNewHand(): void {
    this.playerHand = [];

    // We'll generate the alien AFTER dealing player cards

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

    // Calculate min and max possible results with these cards
    const { min, max } = this.calculateMinMaxResults(numbers, [firstOp, secondOp]);

    // Generate alien with result between min and max
    // Add randomness while still scaling difficulty
    // Early rounds: alien at 30-60% of range (easier to beat)
    // Later rounds: alien at 50-80% of range (harder to beat)
    const baseRangeFactor = 0.3 + (progressFactor * 0.5); // 0.3 to 0.8
    const randomVariation = (Math.random() - 0.5) * 0.3; // ±15%
    const rangeFactor = Math.max(0.2, Math.min(0.9, baseRangeFactor + randomVariation));

    const alienResult = Math.floor(min + (max - min) * rangeFactor);

    // Ensure alien result is at least min+1 (so player can lose if they choose poorly)
    // Also ensure it's less than max (so player can win)
    const finalAlienResult = Math.max(min + 1, Math.min(max - 1, alienResult));

    // Generate the alien for this round based on the cards we dealt
    if (this.currentAlienIndex >= this.aliens.length) {
      // Need to generate this alien
      const alien = this.generateAlienWithTarget(this.currentAlienIndex, finalAlienResult);
      this.aliens.push(alien);
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
    if (op === '÷' && num2 !== 0) return parseFloat((num1 / num2).toFixed(1));
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
    this.aliens = []; // Clear aliens - they'll regenerate as needed
    this.clearExpression();
    this.dealNewHand();
  }
}
