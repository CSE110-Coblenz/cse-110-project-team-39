// GameplayScreenController.test.ts

// Mock Supabase so Jest never evaluates import.meta.env inside supabase.ts
jest.mock('../../lib/supabase', () => ({
  getCurrentUser: jest.fn(),
  getUserProfile: jest.fn().mockResolvedValue(null),
  updateUserProfile: jest.fn().mockResolvedValue(null),
}));

import { GameplayScreenController } from './GameplayScreenController';


describe('GameplayScreenController', () => {
  const createControllerWithMocks = () => {
    // Treat as any so we can poke private/protected fields
    const controller: any = Object.create(GameplayScreenController.prototype);

    const model: any = {
      submitExpression: jest.fn(),
      getGameState: jest.fn(),
      nextRound: jest.fn(),
      getPlayerExpression: jest.fn(),
      evaluateExpression: jest.fn(),
      getCurrentAlien: jest.fn(),
      getPlayerHand: jest.fn(),
      getPlayerScore: jest.fn(),
      getAliensLeft: jest.fn(),
      getPlayerLives: jest.fn(),
      reset: jest.fn(),
      clearExpression: jest.fn(),
      swapNumbers: jest.fn(),
      tryPlaceCard: jest.fn(),
      removeCardFromSlot: jest.fn(),
    };

    const view: any = {
      showResult: jest.fn(),
      updatePlayerResult: jest.fn(),
      renderAlienExpression: jest.fn(),
      renderHand: jest.fn(),
      renderPlayerExpression: jest.fn(),
      updateTopBar: jest.fn(),
      onExit: jest.fn(),
      onFight: jest.fn(),
      onClear: jest.fn(),
      onSwap: jest.fn(),
      onCardClick: jest.fn(),
      onSlotClick: jest.fn(),
      animatePlayerArm: jest.fn(),
      animateSwap: jest.fn(),
      animateCardToSlot: jest.fn(),
      shakeCard: jest.fn(),
      animateCardFromSlotToHand: jest.fn(),
      destroy: jest.fn(),
    };

    const screenManager = {
      switchTo: jest.fn(),
      getScreen: jest.fn(),
    };

    // Bypass TS privacy by going through `any`
    controller.model = model;
    controller.view = view;
    controller.screenManager = screenManager;
    controller.container = {} as any;

    // Outside this helper we can still type it nicely
    return {
      controller: controller as GameplayScreenController,
      model,
      view,
      screenManager,
    };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('updatePlayerResult pulls expression, evaluates, and updates view', () => {
    const { controller, model, view } = createControllerWithMocks();
    const fakeExpression = ['1', '+', '2'];
    const evalResult = 3;

    model.getPlayerExpression.mockReturnValue(fakeExpression);
    model.evaluateExpression.mockReturnValue(evalResult);

    (controller as any).updatePlayerResult();

    expect(model.getPlayerExpression).toHaveBeenCalled();
    expect(model.evaluateExpression).toHaveBeenCalledWith(fakeExpression);
    expect(view.updatePlayerResult).toHaveBeenCalledWith(evalResult);
  });

  test('render pulls state from model and updates view, then updates player result', () => {
    const { controller, model, view } = createControllerWithMocks();

    const alien = { id: 'alien-1' };
    const hand = [{ id: 'card-1' }, { id: 'card-2' }];
    const expression = ['1', '+', '2'];
    const score = 10;
    const aliensLeft = 3;
    const lives = 2;

    model.getCurrentAlien.mockReturnValue(alien);
    model.getPlayerHand.mockReturnValue(hand);
    model.getPlayerExpression.mockReturnValue(expression);
    model.getPlayerScore.mockReturnValue(score);
    model.getAliensLeft.mockReturnValue(aliensLeft);
    model.getPlayerLives.mockReturnValue(lives);
    model.evaluateExpression.mockReturnValue(42);

    (controller as any).render();

    expect(view.renderAlienExpression).toHaveBeenCalledWith(alien);
    expect(view.renderHand).toHaveBeenCalledWith(hand);
    expect(view.renderPlayerExpression).toHaveBeenCalledWith(expression);
    expect(view.updateTopBar).toHaveBeenCalledWith(score, aliensLeft, lives);
    expect(view.updatePlayerResult).toHaveBeenCalledWith(42);
  });

  test('handleFight shows result and switches to result screen when game is complete', async () => {
    const { controller, model, view, screenManager } = createControllerWithMocks();

    model.submitExpression.mockReturnValue({
      won: true,
      playerResult: 12,
      alienResult: 8,
    });
    model.getGameState.mockReturnValue('complete');

    const resultScreen = { setResult: jest.fn() };
    screenManager.getScreen = jest.fn().mockReturnValue(resultScreen);

    const renderSpy = jest.spyOn(controller as any, 'render');

    (controller as any).handleFight();

    expect(model.submitExpression).toHaveBeenCalled();
    expect(view.showResult).toHaveBeenCalledWith(true, 12, 8);

    await jest.advanceTimersByTimeAsync(2200);

    expect(model.getGameState).toHaveBeenCalled();
    expect(resultScreen.setResult).toHaveBeenCalledWith(true);
    expect(screenManager.switchTo).toHaveBeenCalledWith('result');
    expect(renderSpy).not.toHaveBeenCalled();
  });

  test('handleFight shows result and switches to result screen when game is lost', async () => {
    const { controller, model, view, screenManager } = createControllerWithMocks();

    model.submitExpression.mockReturnValue({
      won: false,
      playerResult: 4,
      alienResult: 10,
    });
    model.getGameState.mockReturnValue('lost');

    const resultScreen = { setResult: jest.fn() };
    screenManager.getScreen = jest.fn().mockReturnValue(resultScreen);

    const renderSpy = jest.spyOn(controller as any, 'render');

    (controller as any).handleFight();

    expect(view.showResult).toHaveBeenCalledWith(false, 4, 10);

    await jest.advanceTimersByTimeAsync(2200);

    expect(model.getGameState).toHaveBeenCalled();
    expect(resultScreen.setResult).toHaveBeenCalledWith(false);
    expect(screenManager.switchTo).toHaveBeenCalledWith('result');
    expect(renderSpy).not.toHaveBeenCalled();
  });

  test('handleFight advances to next round and re-renders when game continues', () => {
    const { controller, model, view } = createControllerWithMocks();

    model.submitExpression.mockReturnValue({
      won: true,
      playerResult: 15,
      alienResult: 7,
    });
    model.getGameState.mockReturnValue('playing');

    const renderSpy = jest.spyOn(controller as any, 'render');

    (controller as any).handleFight();

    expect(view.showResult).toHaveBeenCalledWith(true, 15, 7);

    jest.advanceTimersByTime(2200);

    expect(model.getGameState).toHaveBeenCalled();
    expect(model.nextRound).toHaveBeenCalled();
    expect(renderSpy).toHaveBeenCalled();
  });

  test('setWorldNumber updates world and re-initializes world', () => {
    const { controller } = createControllerWithMocks();

    const initializeWorldSpy = jest
      .spyOn(controller as any, 'initializeWorld')
      .mockImplementation(() => {});

    controller.setWorldNumber(3);

    expect((controller as any).worldNumber).toBe(3);
    expect(initializeWorldSpy).toHaveBeenCalled();
  });
});
