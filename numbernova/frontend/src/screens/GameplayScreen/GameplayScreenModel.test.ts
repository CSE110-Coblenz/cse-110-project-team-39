import { GamePlayScreenModel } from './GameplayScreenModel';
import { WorldConfig } from '../../config/worldConfig';
import { Card, ExpressionSlot } from '../../types';

const baseConfig: WorldConfig = {
  playerLives: 3,
  alienCount: 3,
  operations: ['+', '-', '×', '÷'],
  numberRange: { min: 1, max: 9 },
} as any;

const factorialConfig: WorldConfig = {
  playerLives: 3,
  alienCount: 3,
  operations: ['!'],
  numberRange: { min: 1, max: 5 },
} as any;

const makeSlots = (left: number, op?: string, right?: number): ExpressionSlot[] => {
  const slots: ExpressionSlot[] = [
    {
      index: 0,
      card: { id: 'left', type: 'number', value: left } as Card,
    },
    {
      index: 1,
      card: op
        ? ({ id: 'op', type: 'operation', value: op } as Card)
        : null,
    },
    {
      index: 2,
      card:
        right !== undefined
          ? ({ id: 'right', type: 'number', value: right } as Card)
          : null,
    },
  ];
  return slots;
};

describe('GamePlayScreenModel', () => {
  test('constructor initializes lives, state, expression slots, and hand', () => {
    const model = new GamePlayScreenModel(baseConfig);

    expect(model.getPlayerLives()).toBe(baseConfig.playerLives);
    expect(model.getPlayerScore()).toBe(0);
    expect(model.getGameState()).toBe('playing');

    const expr = model.getPlayerExpression();
    expect(expr).toHaveLength(3);
    expect(expr[0].index).toBe(0);
    expect(expr[1].index).toBe(1);
    expect(expr[2].index).toBe(2);
    expect(expr.every(s => s.card === null)).toBe(true);

    const hand = model.getPlayerHand();
    expect(hand.length).toBe(5);
    expect(hand.filter(c => c.type === 'number').length).toBe(3);
    expect(hand.filter(c => c.type === 'operation').length).toBe(2);

    const alien = model.getCurrentAlien();
    expect(alien).not.toBeNull();
  });

  test('tryPlaceCard puts number in first number slot then right slot', () => {
    const model = new GamePlayScreenModel(baseConfig);

    const initialHand = model.getPlayerHand().slice();
    const firstNumber = initialHand.find(c => c.type === 'number')!;
    const handLenBefore = model.getPlayerHand().length;

    const res1 = model.tryPlaceCard(firstNumber);
    expect(res1.success).toBe(true);
    expect(res1.targetSlot).toBe(0);

    const exprAfterFirst = model.getPlayerExpression();
    expect(exprAfterFirst[0].card).toBe(firstNumber);
    expect(model.getPlayerHand().length).toBe(handLenBefore - 1);

    const secondNumber = model.getPlayerHand().find(c => c.type === 'number')!;
    const res2 = model.tryPlaceCard(secondNumber);
    expect(res2.success).toBe(true);
    expect(res2.targetSlot).toBe(2);

    const exprAfterSecond = model.getPlayerExpression();
    expect(exprAfterSecond[2].card).toBe(secondNumber);
  });

  test('tryPlaceCard respects factorial: only left number slot is allowed', () => {
    const model = new GamePlayScreenModel(factorialConfig);

    const number = model.getPlayerHand().find(c => c.type === 'number')!;
    const opCard = model.getPlayerHand().find(c => c.type === 'operation')!;

    model.tryPlaceCard(number);
    model.tryPlaceCard(opCard);

    const secondNumber = model.getPlayerHand().find(c => c.type === 'number' && c.id !== number.id)!;
    const res = model.tryPlaceCard(secondNumber);

    expect(res.success).toBe(false);

    const expr = model.getPlayerExpression();
    expect(expr[0].card).toBe(number);
    expect(expr[1].card).toBe(opCard);
    expect(expr[2].card).toBeNull();
  });

  test('removeCardFromSlot returns card to hand and clears slot', () => {
    const model = new GamePlayScreenModel(baseConfig);
    const number = model.getPlayerHand().find(c => c.type === 'number')!;
    model.tryPlaceCard(number);

    const handLenBefore = model.getPlayerHand().length;
    model.removeCardFromSlot(0);

    const expr = model.getPlayerExpression();
    expect(expr[0].card).toBeNull();
    expect(model.getPlayerHand().length).toBe(handLenBefore + 1);
  });

  test('swapNumbers swaps cards in slots 0 and 2', () => {
    const model = new GamePlayScreenModel(baseConfig);

    const numbers = model.getPlayerHand().filter(c => c.type === 'number').slice(0, 2);
    model.tryPlaceCard(numbers[0]);
    model.tryPlaceCard(numbers[1]);

    const exprBefore = model.getPlayerExpression();
    const leftBefore = exprBefore[0].card;
    const rightBefore = exprBefore[2].card;

    model.swapNumbers();

    const exprAfter = model.getPlayerExpression();
    expect(exprAfter[0].card).toBe(rightBefore);
    expect(exprAfter[2].card).toBe(leftBefore);
  });

  test('clearExpression moves all cards back to hand', () => {
    const model = new GamePlayScreenModel(baseConfig);

    const numbers = model.getPlayerHand().filter(c => c.type === 'number').slice(0, 2);
    const op = model.getPlayerHand().find(c => c.type === 'operation')!;
    model.tryPlaceCard(numbers[0]);
    model.tryPlaceCard(op);
    model.tryPlaceCard(numbers[1]);

    const handLenBefore = model.getPlayerHand().length;

    model.clearExpression();

    const expr = model.getPlayerExpression();
    expect(expr.every(s => s.card === null)).toBe(true);
    expect(model.getPlayerHand().length).toBe(handLenBefore + 3);
  });

  test('evaluateExpression handles basic operations and factorial', () => {
    const model = new GamePlayScreenModel(baseConfig);

    expect(model.evaluateExpression(makeSlots(3))).toBe(3);
    expect(model.evaluateExpression(makeSlots(3, '+', 4))).toBe(7);
    expect(model.evaluateExpression(makeSlots(5, '-', 2))).toBe(3);
    expect(model.evaluateExpression(makeSlots(3, '×', 4))).toBe(12);
    expect(model.evaluateExpression(makeSlots(5, '÷', 2))).toBe(2.5);
    expect(model.evaluateExpression(makeSlots(2, '^', 3))).toBe(8);
  });

  test('evaluateExpression handles factorial and division by zero edge cases', () => {
    const model = new GamePlayScreenModel(factorialConfig);

    expect(model.evaluateExpression(makeSlots(5, '!'))).toBe(120);
    expect(model.evaluateExpression(makeSlots(3, '÷', 0))).toBe(3);
  });

  test('submitExpression win updates score, advances index, and can complete game', () => {
    const config: WorldConfig = {
      ...baseConfig,
      alienCount: 1,
    } as any;

    const model = new GamePlayScreenModel(config);

    (model as any).playerExpression = makeSlots(10, '+', 0);

    jest.spyOn(model, 'getCurrentAlien').mockReturnValue({
      id: 0,
      result: 5,
      expression: [],
    } as any);

    const result = model.submitExpression();

    expect(result.won).toBe(true);
    expect(result.playerResult).toBe(10);
    expect(result.alienResult).toBe(5);
    expect(model.getPlayerScore()).toBe(100);
    expect(model.getGameState()).toBe('complete');
  });

  test('submitExpression loss decrements lives and can set lost state', () => {
    const config: WorldConfig = {
      ...baseConfig,
      playerLives: 1,
      alienCount: 3,
    } as any;

    const model = new GamePlayScreenModel(config);

    (model as any).playerExpression = makeSlots(2, '+', 0);

    jest.spyOn(model, 'getCurrentAlien').mockReturnValue({
      id: 0,
      result: 10,
      expression: [],
    } as any);

    const result = model.submitExpression();

    expect(result.won).toBe(false);
    expect(model.getPlayerLives()).toBe(0);
    expect(model.getGameState()).toBe('lost');
    expect(model.getPlayerScore()).toBe(0);
  });

  test('nextRound clears expression and deals new hand', () => {
    const model = new GamePlayScreenModel(baseConfig);
    const handBefore = model.getPlayerHand().slice();

    const number = model.getPlayerHand().find(c => c.type === 'number')!;
    model.tryPlaceCard(number);

    model.nextRound();

    const expr = model.getPlayerExpression();
    expect(expr.every(s => s.card === null)).toBe(true);

    const handAfter = model.getPlayerHand();
    expect(handAfter.length).toBeGreaterThan(0);
    expect(handAfter).not.toEqual(handBefore);
  });

  test('reset restores initial state', () => {
    const model = new GamePlayScreenModel(baseConfig);

    (model as any).playerScore = 300;
    (model as any).playerLives = 1;
    (model as any).currentAlienIndex = 2;
    (model as any).gameState = 'lost';

    model.reset();

    expect(model.getPlayerScore()).toBe(0);
    expect(model.getPlayerLives()).toBe(baseConfig.playerLives);
    expect(model.getGameState()).toBe('playing');
    expect(model.getAliensLeft()).toBe(baseConfig.alienCount);
    expect(model.getPlayerHand().length).toBeGreaterThan(0);
    expect(model.getPlayerExpression().every(s => s.card === null)).toBe(true);
  });
});
