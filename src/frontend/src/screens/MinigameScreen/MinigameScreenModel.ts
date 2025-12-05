import { Card, MinigameExpressionSlot } from '../../types';

export interface MinigameConfig {
  numberRange: { min: number; max: number };
  targetRange: { min: number; max: number };
  operations: string[];
  roundCount: number;
}

export interface MinigameState {
  targetNumber: number;
  currentRound: number;
  totalRounds: number;
  score: number;
  playerHand: Card[];
  expressionSlots: MinigameExpressionSlot[];
  gameState: 'playing' | 'submitted' | 'complete';
  lastResult: number | null;
  lastScoreEarned: number | null;
}

const DEFAULT_CONFIG: MinigameConfig = {
  numberRange: { min: 1, max: 10 },
  targetRange: { min: 1, max: 100 },
  operations: ['+', '-', '×', '÷'],
  roundCount: 3,
};

const WIN_THRESHOLD = 50;

export class MinigameScreenModel {
  private config: MinigameConfig;
  private targetNumber = 0;
  private currentRound = 1;
  private score = 0;
  private roundsWon = 0;
  private playerHand: Card[] = [];
  private expressionSlots: MinigameExpressionSlot[] = [];
  private gameState: 'playing' | 'submitted' | 'complete' = 'playing';
  private lastResult: number | null = null;
  private lastScoreEarned: number | null = null;

  constructor(config?: Partial<MinigameConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeSlots();
    this.dealNewPuzzle();
  }

  private initializeSlots(): void {
    this.expressionSlots = [
      { index: 0, slotType: 'number', card: null },
      { index: 1, slotType: 'operation', card: null },
      { index: 2, slotType: 'number', card: null },
      { index: 3, slotType: 'operation', card: null },
      { index: 4, slotType: 'number', card: null },
    ];
  }

  public dealNewPuzzle(): void {
    this.initializeSlots();
    this.lastResult = null;
    this.lastScoreEarned = null;
    this.gameState = 'playing';

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      attempts++;

      const num1 = this.randomInt(this.config.numberRange.min, this.config.numberRange.max);
      const num2 = this.randomInt(this.config.numberRange.min, this.config.numberRange.max);
      const num3 = this.randomInt(this.config.numberRange.min, this.config.numberRange.max);
      const op1 = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];
      const op2 = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];

      const target = this.evaluateWithPEMDAS(num1, op1, num2, op2, num3);

      // Skip invalid results (NaN, Infinity, out of range, or non-integers)
      if (
        !Number.isFinite(target) ||
        target < this.config.targetRange.min ||
        target > this.config.targetRange.max ||
        !Number.isInteger(target)
      ) {
        continue;
      }

      // Valid puzzle found
      this.targetNumber = target;
      this.playerHand = this.shuffle([
        this.createCard('number', num1),
        this.createCard('number', num2),
        this.createCard('number', num3),
        this.createCard('operation', op1),
        this.createCard('operation', op2),
      ]);
      return;
    }

    // Fallback: simple addition puzzle if nothing found
    const num1 = this.randomInt(1, 5);
    const num2 = this.randomInt(1, 5);
    const num3 = this.randomInt(1, 5);
    this.targetNumber = num1 + num2 + num3;
    this.playerHand = this.shuffle([
      this.createCard('number', num1),
      this.createCard('number', num2),
      this.createCard('number', num3),
      this.createCard('operation', '+'),
      this.createCard('operation', '+'),
    ]);
  }

  private createCard(type: 'number' | 'operation', value: number | string): Card {
    return {
      id: `${type}-${value}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      value,
    };
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  public tryPlaceCard(card: Card): { success: boolean; targetSlot?: number } {
    // Find the first empty slot that matches the card type
    const targetSlot = this.expressionSlots.find(
      slot => slot.card === null && slot.slotType === card.type
    );

    if (!targetSlot) {
      return { success: false };
    }

    // Remove card from hand
    const handIndex = this.playerHand.findIndex(c => c.id === card.id);
    if (handIndex === -1) {
      return { success: false };
    }

    this.playerHand.splice(handIndex, 1);
    targetSlot.card = card;

    return { success: true, targetSlot: targetSlot.index };
  }

  public removeCardFromSlot(slotIndex: number): Card | null {
    const slot = this.expressionSlots[slotIndex];
    if (!slot || !slot.card) {
      return null;
    }

    const card = slot.card;
    slot.card = null;
    this.playerHand.push(card);
    return card;
  }

  public clearExpression(): void {
    for (const slot of this.expressionSlots) {
      if (slot.card) {
        this.playerHand.push(slot.card);
        slot.card = null;
      }
    }
  }

  public swapNumbers(index1: number, index2: number): boolean {
    const slot1 = this.expressionSlots[index1];
    const slot2 = this.expressionSlots[index2];

    // Only swap number slots
    if (slot1.slotType !== 'number' || slot2.slotType !== 'number') {
      return false;
    }

    // At least one slot must have a card
    if (!slot1.card && !slot2.card) {
      return false;
    }

    const temp = slot1.card;
    slot1.card = slot2.card;
    slot2.card = temp;
    return true;
  }

  public canSwapNumbers(index1: number, index2: number): boolean {
    const slot1 = this.expressionSlots[index1];
    const slot2 = this.expressionSlots[index2];

    if (slot1.slotType !== 'number' || slot2.slotType !== 'number') {
      return false;
    }

    // Can swap if at least one slot has a card
    return slot1.card !== null || slot2.card !== null;
  }

  public isExpressionComplete(): boolean {
    return this.expressionSlots.every(slot => slot.card !== null);
  }

  public evaluateExpression(): number | null {
    if (!this.isExpressionComplete()) {
      return null;
    }

    const num1 = this.expressionSlots[0].card!.value as number;
    const op1 = this.expressionSlots[1].card!.value as string;
    const num2 = this.expressionSlots[2].card!.value as number;
    const op2 = this.expressionSlots[3].card!.value as string;
    const num3 = this.expressionSlots[4].card!.value as number;

    return this.evaluateWithPEMDAS(num1, op1, num2, op2, num3);
  }

  private evaluateWithPEMDAS(
    num1: number,
    op1: string,
    num2: number,
    op2: string,
    num3: number
  ): number {
    const isHighPrecedence = (op: string): boolean => ['×', '÷', '*', '/', '^'].includes(op);

    const op1High = isHighPrecedence(op1);
    const op2High = isHighPrecedence(op2);

    if (op1High && !op2High) {
      // op1 first: (num1 op1 num2) op2 num3
      const intermediate = this.applyOperation(num1, op1, num2);
      return this.applyOperation(intermediate, op2, num3);
    } else if (!op1High && op2High) {
      // op2 first: num1 op1 (num2 op2 num3)
      const intermediate = this.applyOperation(num2, op2, num3);
      return this.applyOperation(num1, op1, intermediate);
    } else {
      // Same precedence: left to right
      const intermediate = this.applyOperation(num1, op1, num2);
      return this.applyOperation(intermediate, op2, num3);
    }
  }

  private applyOperation(a: number, op: string, b: number): number {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b !== 0 ? a / b : NaN;
      case '^':
        return Math.pow(a, b);
      default:
        return a;
    }
  }

  public calculateScore(result: number): number {
    const diff = Math.abs(this.targetNumber - result);
    return Math.round(100 * Math.exp(-diff / 10));
  }

  public submitExpression(): { result: number; scoreEarned: number; isExact: boolean; roundWon: boolean } | null {
    const result = this.evaluateExpression();
    if (result === null) {
      return null;
    }

    const scoreEarned = this.calculateScore(result);
    const roundWon = scoreEarned >= WIN_THRESHOLD;

    // New scoring logic: win round adds points, lose round subtracts penalty
    if (roundWon) {
      this.score += scoreEarned;
      this.roundsWon++;
    } else {
      this.score -= (100 - scoreEarned);
    }

    this.lastResult = result;
    this.lastScoreEarned = scoreEarned;
    this.gameState = 'submitted';

    return {
      result,
      scoreEarned,
      isExact: result === this.targetNumber,
      roundWon,
    };
  }

  public nextRound(): boolean {
    if (this.currentRound >= this.config.roundCount) {
      this.gameState = 'complete';
      return false;
    }

    this.currentRound++;
    this.dealNewPuzzle();
    return true;
  }

  public getState(): MinigameState {
    return {
      targetNumber: this.targetNumber,
      currentRound: this.currentRound,
      totalRounds: this.config.roundCount,
      score: this.score,
      playerHand: [...this.playerHand],
      expressionSlots: this.expressionSlots.map(slot => ({ ...slot })),
      gameState: this.gameState,
      lastResult: this.lastResult,
      lastScoreEarned: this.lastScoreEarned,
    };
  }

  public getTargetNumber(): number {
    return this.targetNumber;
  }

  public getTotalScore(): number {
    return this.score;
  }

  public isLastRound(): boolean {
    return this.currentRound >= this.config.roundCount;
  }

  public didWinGame(): boolean {
    return this.score > 0;
  }

  public getRoundsWon(): number {
    return this.roundsWon;
  }

  public resetGame(): void {
    this.currentRound = 1;
    this.score = 0;
    this.roundsWon = 0;
    this.gameState = 'playing';
    this.dealNewPuzzle();
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
