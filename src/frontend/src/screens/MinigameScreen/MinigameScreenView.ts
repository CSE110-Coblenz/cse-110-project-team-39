import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';
import { Card, MinigameExpressionSlot } from '../../types';
import { MinigameState } from './MinigameScreenModel';

export class MinigameScreenView {
  private layer: Konva.Layer;
  private group: Konva.Group;

  // UI Elements
  private backgroundGroup!: Konva.Group;
  private starsGroup!: Konva.Group;
  private exitButton!: Konva.Group;
  private targetLabel!: Konva.Text;
  private targetNumberText!: Konva.Text;
  private scoreText!: Konva.Text;
  private roundText!: Konva.Text;

  // Spaceship and fuel
  private spaceshipGroup!: Konva.Group;
  private flame!: Konva.Path;
  private fuelGaugeGroup!: Konva.Group;
  private fuelFill!: Konva.Rect;
  private fuelLabel!: Konva.Text;

  // Expression area
  private expressionSlots!: Konva.Group[];
  private resultText!: Konva.Text;
  private swapButton1!: Konva.Group;
  private swapButton2!: Konva.Group;

  // Card area
  private handCardsGroup!: Konva.Group;
  private cardVisuals: Map<string, Konva.Group> = new Map();

  // Buttons
  private submitButton!: Konva.Group;
  private submitButtonBg!: Konva.Rect;
  private submitButtonText!: Konva.Text;
  private clearButton!: Konva.Group;
  private clearButtonBg!: Konva.Rect;
  private nextButton!: Konva.Group;
  private nextButtonBg!: Konva.Rect;

  // Feedback area
  private feedbackGroup!: Konva.Group;

  // Hover tweens
  private buttonTweens: Map<Konva.Node, Konva.Tween> = new Map();

  // Animation tracking for cleanup
  private runningTweens: Konva.Tween[] = [];

  // Ship color
  private shipColor: string;

  // Callbacks
  private onExitCallback?: () => void;
  private onCardClickCallback?: (card: Card) => void;
  private onSlotClickCallback?: (slotIndex: number) => void;
  private onSubmitCallback?: () => void;
  private onClearCallback?: () => void;
  private onNextCallback?: () => void;
  private onSwapCallback?: (index1: number, index2: number) => void;

  constructor(layer: Konva.Layer, shipColor?: string) {
    this.layer = layer;
    this.shipColor = shipColor || COLORS.primary;
    this.group = new Konva.Group();
    this.layer.add(this.group);
    this.createUI();
  }

  private createUI(): void {
    this.createBackground();
    this.createSpaceship();
    this.createTopBar();
    this.createTargetDisplay();
    this.createExpressionArea();
    this.createButtons();
    this.createCardArea();
    this.createFeedbackArea();
  }

  // === HELPER METHODS ===

  private createButton(
    x: number, y: number, text: string,
    w: number, h: number, fontSize: number, color: string
  ): { group: Konva.Group; bg: Konva.Rect; text: Konva.Text } {
    const group = new Konva.Group({ x, y });
    const bg = new Konva.Rect({
      x: w / 2, y: h / 2, width: w, height: h, offsetX: w / 2, offsetY: h / 2,
      fill: color, cornerRadius: h / 2, stroke: '#444', strokeWidth: 3,
      shadowColor: '#000', shadowBlur: 10, shadowOpacity: 0.4, shadowOffsetY: 4,
    });
    const textEl = new Konva.Text({
      width: w, y: h / 2 - fontSize / 2, text, fontSize,
      fontFamily: 'Jersey 10', fill: '#fff', align: 'center', listening: false,
    });
    group.add(bg, textEl);
    return { group, bg, text: textEl };
  }

  private setHover(node: Konva.Node, enabled: boolean): void {
    node.off('mouseenter mouseleave');
    this.buttonTweens.get(node)?.destroy();
    this.buttonTweens.delete(node);
    if (!enabled) { node.scale({ x: 1, y: 1 }); return; }

    node.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';
      this.buttonTweens.get(node)?.destroy();
      const t = new Konva.Tween({ node, duration: 0.16, scaleX: 1.1, scaleY: 1.1, shadowBlur: 15 });
      this.buttonTweens.set(node, t);
      t.play();
    });
    node.on('mouseleave', () => {
      document.body.style.cursor = 'default';
      this.buttonTweens.get(node)?.destroy();
      const t = new Konva.Tween({ node, duration: 0.16, scaleX: 1, scaleY: 1, shadowBlur: 10 });
      this.buttonTweens.set(node, t);
      t.play();
    });
  }

  private setButtonEnabled(
    group: Konva.Group, bg: Konva.Rect, text: Konva.Text,
    enabled: boolean, color: string, stroke: string
  ): void {
    bg.fill(enabled ? color : '#666');
    bg.stroke(enabled ? stroke : '#444');
    text.fill(enabled ? '#000' : '#999');
    group.listening(enabled);
    this.setHover(bg, enabled);
  }

  private createSpaceBg(w: number, h: number, ox: number, oy: number): Konva.Rect {
    return new Konva.Rect({
      x: -ox, y: -oy, width: w, height: h,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: h },
      fillLinearGradientColorStops: [0, '#0a0a2e', 0.4, '#1a1a4e', 0.7, '#0f0f3d', 1, '#0a0a1f'],
      listening: false,
    });
  }

  private createBackground(): void {
    this.backgroundGroup = new Konva.Group();
    this.backgroundGroup.listening(false);
    this.group.add(this.backgroundGroup);

    const bgWidth = DIMENSIONS.width * 1.5;
    const bgHeight = DIMENSIONS.height * 1.5;
    const offsetX = (bgWidth - DIMENSIONS.width) / 2;
    const offsetY = (bgHeight - DIMENSIONS.height) / 2;

    this.backgroundGroup.add(this.createSpaceBg(bgWidth, bgHeight, offsetX, offsetY));

    // Stars layer - static stars only (no animations for performance)
    this.starsGroup = new Konva.Group();
    this.starsGroup.listening(false);
    this.backgroundGroup.add(this.starsGroup);

    // Generate random stars (reduced for performance)
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * DIMENSIONS.width;
      const y = Math.random() * DIMENSIONS.height;
      const radius = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.7 + 0.3;

      const star = new Konva.Circle({
        x,
        y,
        radius,
        fill: '#ffffff',
        opacity,
        listening: false,
      });
      this.starsGroup.add(star);
    }
  }

  private createSpaceship(): void {
    this.spaceshipGroup = new Konva.Group({ x: 80, y: 350 });
    this.spaceshipGroup.listening(false); // Performance: no hit detection needed
    this.group.add(this.spaceshipGroup);

    // Ship glow effect
    const glow = new Konva.Ellipse({
      x: 0,
      y: 10,
      radiusX: 40,
      radiusY: 25,
      fill: this.shipColor,
      opacity: 0.2,
      listening: false,
    });
    this.spaceshipGroup.add(glow);

    // Engine flame (SVG path - behind the body, animated continuously)
    this.flame = new Konva.Path({
      name: 'flame',
      data: 'M -8,35 L -5,55 L 0,45 L 5,55 L 8,35 Z',
      fill: '#ff6b6b',
      opacity: 0.8,
      listening: false,
    });
    this.spaceshipGroup.add(this.flame);

    // Ship body (SVG path triangle pointing up)
    const body = new Konva.Path({
      data: 'M 0,-40 L 20,30 L -20,30 Z',
      fill: this.shipColor,
      stroke: '#ffffff',
      strokeWidth: 2,
      listening: false,
    });
    this.spaceshipGroup.add(body);

    // Ship window
    const window = new Konva.Circle({
      x: 0,
      y: -5,
      radius: 8,
      fill: '#60a5fa',
      stroke: '#ffffff',
      strokeWidth: 2,
      listening: false,
    });
    this.spaceshipGroup.add(window);

    // Fuel gauge
    this.createFuelGauge();
  }

  private createFuelGauge(): void {
    this.fuelGaugeGroup = new Konva.Group({ x: 60, y: -30 });
    this.spaceshipGroup.add(this.fuelGaugeGroup);

    // Gauge background
    const gaugeBg = new Konva.Rect({
      x: 0,
      y: 0,
      width: 25,
      height: 120,
      fill: '#1a1a2e',
      stroke: '#444',
      strokeWidth: 2,
      cornerRadius: 5,
    });
    this.fuelGaugeGroup.add(gaugeBg);

    // Fuel fill (starts empty)
    this.fuelFill = new Konva.Rect({
      x: 3,
      y: 117,
      width: 19,
      height: 0,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: -120 },
      fillLinearGradientColorStops: [0, '#ff6b6b', 0.5, '#fbbf24', 1, '#4ade80'],
      cornerRadius: 3,
    });
    this.fuelGaugeGroup.add(this.fuelFill);

    // Max score label at top
    const maxLabel = new Konva.Text({
      x: -5,
      y: -15,
      width: 35,
      text: '300',
      fontSize: 12,
      fontFamily: 'Jersey 10',
      fill: COLORS.textSecondary,
      align: 'center',
      listening: false,
    });
    this.fuelGaugeGroup.add(maxLabel);

    // Fuel label
    this.fuelLabel = new Konva.Text({
      x: -5,
      y: 125,
      width: 35,
      text: 'FUEL',
      fontSize: 12,
      fontFamily: 'Jersey 10',
      fill: COLORS.textSecondary,
      align: 'center',
    });
    this.fuelGaugeGroup.add(this.fuelLabel);

    // Gauge markers
    for (let i = 0; i <= 4; i++) {
      const y = 117 - (i * 114) / 4;
      const marker = new Konva.Line({
        points: [25, y, 30, y],
        stroke: '#666',
        strokeWidth: 1,
      });
      this.fuelGaugeGroup.add(marker);
    }
  }

  public updateFuelGauge(score: number, maxScore: number): void {
    // Clamp score to 0 minimum for display
    const clampedScore = Math.max(0, score);
    const fillHeight = Math.min(114, (clampedScore / maxScore) * 114);
    this.fuelFill.to({
      height: fillHeight,
      y: 117 - fillHeight,
      duration: 0.5,
      easing: Konva.Easings.EaseOut,
    });
  }

  private createTopBar(): void {
    // Exit button
    this.exitButton = new Konva.Group({ x: 15, y: 15 });
    const exitBg = new Konva.Rect({
      x: 80,
      y: 30,
      width: 160,
      height: 60,
      offsetX: 80,
      offsetY: 30,
      fill: COLORS.primary,
      cornerRadius: 30,
    });
    const exitText = new Konva.Text({
      x: 0,
      y: 15,
      width: 160,
      text: 'Exit',
      fontSize: 24,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
      listening: false,
    });
    this.exitButton.add(exitBg, exitText);
    this.exitButton.on('click tap', () => this.onExitCallback?.());
    this.setHover(exitBg, true);
    this.group.add(this.exitButton);

    // Score display
    this.scoreText = new Konva.Text({
      x: DIMENSIONS.width - 200,
      y: 30,
      width: 180,
      text: 'Score: 0',
      fontSize: 28,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'right',
    });
    this.group.add(this.scoreText);

    // Round display
    this.roundText = new Konva.Text({
      x: DIMENSIONS.width - 200,
      y: 60,
      width: 180,
      text: 'Round: 1/5',
      fontSize: 22,
      fontFamily: 'Jersey 10',
      fill: COLORS.textSecondary,
      align: 'right',
    });
    this.group.add(this.roundText);
  }

  private createTargetDisplay(): void {
    const centerX = DIMENSIONS.width / 2 + 50; // Offset for spaceship

    // Target label
    this.targetLabel = new Konva.Text({
      x: centerX - 150,
      y: 100,
      width: 300,
      text: 'TARGET',
      fontSize: 32,
      fontFamily: 'Jersey 10',
      fill: COLORS.textSecondary,
      align: 'center',
    });
    this.group.add(this.targetLabel);

    // Target number (large) with glow effect
    const targetGlow = new Konva.Text({
      x: centerX - 150,
      y: 140,
      width: 300,
      text: '24',
      fontSize: 80,
      fontFamily: 'Jersey 10',
      fill: COLORS.success,
      align: 'center',
      shadowColor: COLORS.success,
      shadowBlur: 20,
      shadowOpacity: 0.5,
    });
    this.group.add(targetGlow);

    this.targetNumberText = new Konva.Text({
      x: centerX - 150,
      y: 140,
      width: 300,
      text: '24',
      fontSize: 80,
      fontFamily: 'Jersey 10',
      fill: COLORS.success,
      align: 'center',
    });
    this.group.add(this.targetNumberText);
  }

  private createExpressionArea(): void {
    const centerX = DIMENSIONS.width / 2 + 50;
    const slotY = 280;
    const slotWidth = 80;
    const slotGap = 20;

    const totalWidth = 5 * slotWidth + 4 * slotGap;
    const startX = centerX - totalWidth / 2;

    this.expressionSlots = [];

    for (let i = 0; i < 5; i++) {
      const x = startX + i * (slotWidth + slotGap);
      const slotType = i % 2 === 0 ? 'number' : 'operation';
      const slot = this.createExpressionSlot(x, slotY, i, slotType);
      this.expressionSlots.push(slot);
      this.group.add(slot);
    }

    // Swap buttons between number slots
    this.swapButton1 = this.createSwapButton(startX + slotWidth + slotGap / 2, slotY - 35, 0, 2);
    this.group.add(this.swapButton1);

    this.swapButton2 = this.createSwapButton(startX + 3 * (slotWidth + slotGap) + slotGap / 2, slotY - 35, 2, 4);
    this.group.add(this.swapButton2);

    // Result display
    this.resultText = new Konva.Text({
      x: startX + totalWidth + 30,
      y: slotY + 25,
      text: '= ?',
      fontSize: 40,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
    });
    this.group.add(this.resultText);
  }

  private createSwapButton(x: number, y: number, index1: number, index2: number): Konva.Group {
    const btn = new Konva.Group({ x, y });

    const bg = new Konva.Rect({
      x: 40,
      y: 12,
      width: 80,
      height: 24,
      offsetX: 40,
      offsetY: 12,
      fill: '#666',
      cornerRadius: 12,
    });

    const text = new Konva.Text({
      width: 80,
      y: 3,
      text: '⇄ Swap',
      fontSize: 14,
      fontFamily: 'Jersey 10',
      fill: '#999',
      align: 'center',
      listening: false,
    });

    btn.add(bg, text);
    btn.setAttr('bg', bg);
    btn.setAttr('text', text);
    btn.setAttr('index1', index1);
    btn.setAttr('index2', index2);
    btn.on('click tap', () => this.onSwapCallback?.(index1, index2));
    btn.listening(false);

    return btn;
  }

  private updateSwapButton(btn: Konva.Group, enabled: boolean): void {
    const bg = btn.getAttr('bg');
    const text = btn.getAttr('text');

    if (enabled) {
      bg.fill('#4ade80');
      text.fill('#000');
      btn.listening(true);
      btn.opacity(1);
      this.setHover(bg, true);
    } else {
      bg.fill('#666');
      text.fill('#999');
      btn.listening(false);
      btn.opacity(0.5);
      this.setHover(bg, false);
    }
  }

  private createExpressionSlot(
    x: number,
    y: number,
    index: number,
    slotType: 'number' | 'operation'
  ): Konva.Group {
    const slot = new Konva.Group({ x, y });

    const slotColor = slotType === 'operation' ? '#ff9800' : '#2a2a3a';

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      fill: slotColor,
      stroke: COLORS.primary,
      strokeWidth: 2,
      cornerRadius: 8,
      shadowColor: slotType === 'operation' ? '#ff9800' : COLORS.primary,
      shadowBlur: 5,
      shadowOpacity: 0.3,
    });

    bg.setAttr('slotIndex', index);
    bg.setAttr('slotType', slotType);
    bg.setAttr('isEmpty', true);

    slot.add(bg);
    slot.setAttr('slotBg', bg);
    slot.setAttr('slotType', slotType);
    return slot;
  }

  private createButtons(): void {
    const centerX = DIMENSIONS.width / 2 + 50;

    // Submit button
    const submit = this.createButton(centerX - 90, 400, 'SUBMIT', 180, 60, 28, '#666');
    this.submitButton = submit.group;
    this.submitButtonBg = submit.bg;
    this.submitButtonText = submit.text;
    this.submitButtonText.fill('#999');
    this.submitButton.on('click tap', () => this.onSubmitCallback?.());
    this.submitButton.listening(false);
    this.group.add(this.submitButton);

    // Clear button
    const clear = this.createButton(centerX - 70, 470, 'Clear', 140, 40, 20, '#666');
    this.clearButton = clear.group;
    this.clearButtonBg = clear.bg;
    clear.text.fill('#999');
    this.clearButton.setAttr('text', clear.text);
    this.clearButton.on('click tap', () => this.onClearCallback?.());
    this.clearButton.listening(false);
    this.group.add(this.clearButton);

    // Next puzzle button (hidden initially)
    const next = this.createButton(centerX - 100, 400, 'NEXT PUZZLE', 200, 60, 28, COLORS.info);
    this.nextButton = next.group;
    this.nextButtonBg = next.bg;
    this.nextButtonBg.stroke('#3b82f6');
    this.nextButton.visible(false);
    this.nextButton.on('click tap', () => this.onNextCallback?.());
    this.setHover(this.nextButtonBg, true);
    this.group.add(this.nextButton);
  }

  private createCardArea(): void {
    const centerX = DIMENSIONS.width / 2 + 50;

    // Card area labels
    const numLabel = new Konva.Text({
      x: centerX - 350,
      y: DIMENSIONS.height - 50,
      width: 280,
      text: 'Number Cards',
      fontSize: 20,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
    });
    this.group.add(numLabel);

    const opLabel = new Konva.Text({
      x: centerX + 70,
      y: DIMENSIONS.height - 50,
      width: 280,
      text: 'Operation Cards',
      fontSize: 20,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
    });
    this.group.add(opLabel);

    this.handCardsGroup = new Konva.Group();
    this.group.add(this.handCardsGroup);
  }

  private createFeedbackArea(): void {
    this.feedbackGroup = new Konva.Group({ visible: false });
    this.group.add(this.feedbackGroup);
  }

  private createCardVisual(card: Card, x: number, y: number): Konva.Group {
    const cardGroup = new Konva.Group({ x, y });

    const bg = new Konva.Rect({
      x: 35,
      y: 35,
      width: 70,
      height: 70,
      offsetX: 35,
      offsetY: 35,
      fill: card.type === 'number' ? '#9575cd' : '#ff9800',
      stroke: '#fff',
      strokeWidth: 2,
      cornerRadius: 8,
      shadowColor: card.type === 'number' ? '#9575cd' : '#ff9800',
      shadowBlur: 8,
      shadowOpacity: 0.5,
    });

    const text = new Konva.Text({
      width: 70,
      height: 70,
      text: String(card.value),
      fontSize: 32,
      fontFamily: 'Jersey 10',
      fill: '#fff',
      align: 'center',
      verticalAlign: 'middle',
      listening: false,
    });

    cardGroup.add(bg, text);
    cardGroup.setAttr('cardData', card);
    cardGroup.setAttr('originalX', x);
    cardGroup.setAttr('originalY', y);

    cardGroup.on('click tap', () => {
      this.onCardClickCallback?.(card);
    });

    this.setHover(bg, true);

    return cardGroup;
  }

  public render(state: MinigameState): void {
    // Update target
    this.targetNumberText.text(String(state.targetNumber));
    // Update glow text too (it's behind the main text)
    const targetGlow = this.group.findOne((node: Konva.Node) =>
      node instanceof Konva.Text && node.shadowBlur() === 20
    ) as Konva.Text;
    if (targetGlow) {
      targetGlow.text(String(state.targetNumber));
    }

    // Update score
    this.scoreText.text(`Score: ${state.score}`);

    // Update round
    this.roundText.text(`Round: ${state.currentRound}/${state.totalRounds}`);

    // Update fuel gauge (max score is rounds * 100)
    const maxScore = state.totalRounds * 100;
    this.updateFuelGauge(state.score, maxScore);

    // Update result preview
    if (state.expressionSlots.every(slot => slot.card !== null)) {
      const result = this.calculatePreview(state.expressionSlots);
      this.resultText.text(`= ${result}`);
    } else {
      this.resultText.text('= ?');
    }

    // Render expression slots
    this.renderExpressionSlots(state.expressionSlots);

    // Render hand
    this.renderHand(state.playerHand);

    // Update swap button states
    const slot0Has = state.expressionSlots[0].card !== null;
    const slot2Has = state.expressionSlots[2].card !== null;
    const slot4Has = state.expressionSlots[4].card !== null;

    this.updateSwapButton(this.swapButton1, slot0Has || slot2Has);
    this.updateSwapButton(this.swapButton2, slot2Has || slot4Has);

    // Update button states
    const allFilled = state.expressionSlots.every(slot => slot.card !== null);
    const hasCards = state.expressionSlots.some(slot => slot.card !== null);

    if (state.gameState === 'playing') {
      this.updateSubmitButton(allFilled);
      this.updateClearButton(hasCards);
      this.submitButton.visible(true);
      this.clearButton.visible(true);
      this.nextButton.visible(false);
    } else if (state.gameState === 'submitted') {
      this.submitButton.visible(false);
      this.clearButton.visible(false);
      this.nextButton.visible(true);
    }

    this.layer.batchDraw();
  }

  private calculatePreview(slots: MinigameExpressionSlot[]): number {
    const num1 = slots[0].card!.value as number;
    const op1 = slots[1].card!.value as string;
    const num2 = slots[2].card!.value as number;
    const op2 = slots[3].card!.value as string;
    const num3 = slots[4].card!.value as number;

    const isHighPrecedence = (op: string): boolean => ['×', '÷', '*', '/', '^'].includes(op);
    const applyOp = (a: number, op: string, b: number): number => {
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '×':
        case '*': return a * b;
        case '÷':
        case '/': return b !== 0 ? a / b : NaN;
        case '^': return Math.pow(a, b);
        default: return a;
      }
    };

    const op1High = isHighPrecedence(op1);
    const op2High = isHighPrecedence(op2);

    if (op1High && !op2High) {
      return applyOp(applyOp(num1, op1, num2), op2, num3);
    } else if (!op1High && op2High) {
      return applyOp(num1, op1, applyOp(num2, op2, num3));
    } else {
      return applyOp(applyOp(num1, op1, num2), op2, num3);
    }
  }

  private renderExpressionSlots(slots: MinigameExpressionSlot[]): void {
    slots.forEach((slot, i) => {
      const slotGroup = this.expressionSlots[i];
      const slotBg = slotGroup.getAttr('slotBg');

      // Clear old card content
      const children = slotGroup.getChildren().slice(1);
      children.forEach(child => child.destroy());

      if (slot.card) {
        const cardInSlot = new Konva.Group({ listening: true });

        const text = new Konva.Text({
          x: 0,
          y: 20,
          width: 80,
          height: 40,
          text: String(slot.card.value),
          fontSize: 28,
          fontFamily: 'Jersey 10',
          fill: COLORS.text,
          align: 'center',
          verticalAlign: 'middle',
        });

        cardInSlot.add(text);
        cardInSlot.setAttr('cardData', slot.card);

        cardInSlot.on('click tap', () => {
          this.onSlotClickCallback?.(i);
        });

        slotGroup.add(cardInSlot);
        slotBg.setAttr('isEmpty', false);

        // Hide card from hand
        const cardVisual = this.cardVisuals.get(slot.card.id);
        if (cardVisual) {
          cardVisual.visible(false);
        }
      } else {
        slotBg.setAttr('isEmpty', true);
      }
    });
  }

  private renderHand(cards: Card[]): void {
    const bottomY = DIMENSIONS.height - 150;
    const numberCards = cards.filter(c => c.type === 'number');
    const opCards = cards.filter(c => c.type === 'operation');
    const newCardIds = new Set(cards.map(c => c.id));

    // Remove cards no longer in hand
    this.cardVisuals.forEach((visual, cardId) => {
      if (!newCardIds.has(cardId)) {
        visual.destroy();
        this.cardVisuals.delete(cardId);
      }
    });

    const centerX = DIMENSIONS.width / 2 + 50;
    const spacing = 85;

    const positionCards = (cardList: Card[], startX: number) => {
      cardList.forEach((card, i) => {
        const x = startX + i * spacing;
        let v = this.cardVisuals.get(card.id);
        if (v) {
          const t = new Konva.Tween({ node: v, x, y: bottomY, duration: 0.15, easing: Konva.Easings.EaseInOut });
          this.runningTweens.push(t);
          t.play();
          v.setAttr('originalX', x);
          v.setAttr('originalY', bottomY);
          v.visible(true);
        } else {
          v = this.createCardVisual(card, x, bottomY);
          this.cardVisuals.set(card.id, v);
          this.handCardsGroup.add(v);
        }
      });
    };

    positionCards(numberCards, centerX - 350 + (280 - (numberCards.length - 1) * spacing - 70) / 2);
    positionCards(opCards, centerX + 70 + (280 - (opCards.length - 1) * spacing - 70) / 2);
  }

  private updateSubmitButton(enabled: boolean): void {
    this.setButtonEnabled(
      this.submitButton, this.submitButtonBg, this.submitButtonText,
      enabled, COLORS.success, '#2d7a4a'
    );
  }

  private updateClearButton(enabled: boolean): void {
    const clearText = this.clearButton.getAttr('text') as Konva.Text;
    this.setButtonEnabled(
      this.clearButton, this.clearButtonBg, clearText,
      enabled, '#e63946', '#a4161a'
    );
  }

  public showResult(
    result: number,
    target: number,
    scoreEarned: number,
    isExact: boolean,
    roundWon: boolean = false
  ): void {
    this.feedbackGroup.destroyChildren();
    this.feedbackGroup.visible(true);

    const centerX = DIMENSIONS.width / 2 + 50;
    const y = 520;
    const statusIcon = roundWon ? '✓' : '✗';
    const statusColor = roundWon ? COLORS.success : '#ff6b6b';

    const addText = (txt: string, yOff: number, size: number, color: string) => {
      const t = new Konva.Text({
        x: centerX - 200, y: y + yOff, width: 400, text: txt, fontSize: size,
        fontFamily: 'Jersey 10', fill: color, align: 'center', opacity: 0,
      });
      this.feedbackGroup.add(t);
      t.to({ opacity: 1, duration: 0.3 });
    };

    const message = isExact ? `PERFECT! ${result} = ${target}` : `Your answer: ${result} (Target: ${target})`;
    const pointsText = roundWon ? `+${scoreEarned} points` : `-${100 - scoreEarned} points`;

    addText(message, 0, isExact ? 36 : 28, isExact ? COLORS.success : COLORS.warning);
    addText(`${pointsText} ${statusIcon}`, 45, 28, statusColor);
    addText(roundWon ? 'Round Won!' : 'Round Lost', 80, 24, statusColor);

    // Animate flame on any score
    this.animateFlameOnce();

    // Extra effect for perfect score or round win
    if (isExact) {
      this.showPerfectEffect(centerX, y - 30);
      this.pulseSpaceship();
    } else if (roundWon) {
      this.pulseSpaceship();
    }

    this.layer.batchDraw();
  }

  private showPerfectEffect(x: number, y: number): void {
    // Create sparkle particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const sparkle = new Konva.Star({
        x: x,
        y: y,
        numPoints: 4,
        innerRadius: 2,
        outerRadius: 6,
        fill: '#fbbf24',
        opacity: 1,
      });
      this.feedbackGroup.add(sparkle);

      // Animate outward
      sparkle.to({
        x: x + Math.cos(angle) * 80,
        y: y + Math.sin(angle) * 80,
        opacity: 0,
        duration: 0.8,
        onFinish: () => sparkle.destroy(),
      });
    }
  }

  private pulseSpaceship(): void {
    this.spaceshipGroup.to({
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 0.2,
      onFinish: () => {
        this.spaceshipGroup.to({
          scaleX: 1,
          scaleY: 1,
          duration: 0.2,
        });
      },
    });
  }

  private animateFlameOnce(): void {
    this.flame.to({
      scaleY: 1.5,
      opacity: 1,
      duration: 0.15,
      onFinish: () => {
        this.flame.to({
          scaleY: 1,
          opacity: 0.8,
          duration: 0.15,
        });
      },
    });
  }

  public showGameComplete(totalScore: number, won: boolean = true): void {
    // Clear previous feedback
    this.feedbackGroup.destroyChildren();
    this.feedbackGroup.visible(true);

    const centerX = DIMENSIONS.width / 2 + 50;
    const y = 380;

    // Complete message - different for win vs lose
    const titleText = won ? 'MISSION SUCCESS!' : 'MISSION FAILED';
    const titleColor = won ? COLORS.success : '#ff6b6b';

    const completeText = new Konva.Text({
      x: centerX - 200,
      y: y,
      width: 400,
      text: titleText,
      fontSize: 40,
      fontFamily: 'Jersey 10',
      fill: titleColor,
      align: 'center',
      shadowColor: titleColor,
      shadowBlur: 15,
    });

    // Score change message (use absolute value for display)
    const scoreChangeText = won
      ? `+${totalScore} score, +25 tokens`
      : `${totalScore} score`;

    const scoreText = new Konva.Text({
      x: centerX - 200,
      y: y + 60,
      width: 400,
      text: scoreChangeText,
      fontSize: 36,
      fontFamily: 'Jersey 10',
      fill: won ? COLORS.success : '#ff6b6b',
      align: 'center',
    });

    // Hide buttons
    this.nextButton.visible(false);
    this.submitButton.visible(false);
    this.clearButton.visible(false);

    // Exit hint
    const hintText = new Konva.Text({
      x: centerX - 200,
      y: y + 120,
      width: 400,
      text: 'Click Exit to return to menu',
      fontSize: 24,
      fontFamily: 'Jersey 10',
      fill: COLORS.textSecondary,
      align: 'center',
    });

    this.feedbackGroup.add(completeText, scoreText, hintText);

    // Final spaceship celebration (only on win)
    if (won) {
      this.pulseSpaceship();
    }

    this.layer.batchDraw();
  }

  public hideFeedback(): void {
    this.feedbackGroup.visible(false);
    this.feedbackGroup.destroyChildren();
    this.layer.batchDraw();
  }

  public showLoadingScreen(onComplete: () => void): void {
    const loadingGroup = new Konva.Group();
    const bgWidth = DIMENSIONS.width * 1.5;
    const bgHeight = DIMENSIONS.height * 1.5;
    const offsetX = (bgWidth - DIMENSIONS.width) / 2;
    const offsetY = (bgHeight - DIMENSIONS.height) / 2;

    loadingGroup.add(this.createSpaceBg(bgWidth, bgHeight, offsetX, offsetY));

    // "Loading Minigame" text
    const loadingText = new Konva.Text({
      x: 0,
      y: DIMENSIONS.height / 2 - 50,
      width: DIMENSIONS.width,
      text: 'Loading Minigame...',
      fontSize: 48,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center',
      listening: false,
    });
    loadingGroup.add(loadingText);

    // Create flying ship
    const ship = this.createLoadingShip();
    ship.position({ x: -100, y: DIMENSIONS.height / 2 + 50 });
    loadingGroup.add(ship);

    this.group.add(loadingGroup);
    this.layer.batchDraw();

    // Animate ship flying across
    ship.to({
      x: DIMENSIONS.width + 100,
      duration: 1.5,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        loadingGroup.destroy();
        this.layer.batchDraw();
        onComplete();
      },
    });
  }

  private createLoadingShip(): Konva.Group {
    const ship = new Konva.Group();

    // Flame (behind body)
    const flame = new Konva.Path({
      data: 'M -10,-8 L -25,-5 L -18,0 L -25,5 L -10,8 Z',
      fill: '#ff6b6b',
      opacity: 0.8,
      listening: false,
    });
    ship.add(flame);

    // Animate flame
    const animateFlame = () => {
      flame.to({
        scaleX: 0.7,
        opacity: 0.5,
        duration: 0.15,
        onFinish: () => {
          flame.to({
            scaleX: 1,
            opacity: 0.8,
            duration: 0.15,
            onFinish: animateFlame,
          });
        },
      });
    };
    animateFlame();

    // Body (triangle pointing right)
    const body = new Konva.Path({
      data: 'M 0,0 L 40,-20 L 40,20 Z',
      fill: this.shipColor,
      stroke: '#ffffff',
      strokeWidth: 2,
      listening: false,
    });
    ship.add(body);

    // Window
    const window = new Konva.Circle({
      x: 20,
      y: 0,
      radius: 6,
      fill: '#60a5fa',
      stroke: '#ffffff',
      strokeWidth: 1,
      listening: false,
    });
    ship.add(window);

    return ship;
  }

  public animateCardToSlot(cardId: string, targetSlotIndex: number, onComplete?: () => void): void {
    const cardVisual = this.cardVisuals.get(cardId);
    if (!cardVisual) {
      onComplete?.();
      return;
    }

    const targetSlot = this.expressionSlots[targetSlotIndex];
    const targetPos = targetSlot.position();

    const tween = new Konva.Tween({
      node: cardVisual,
      x: targetPos.x + 5,
      y: targetPos.y + 5,
      duration: 0.12,
      easing: Konva.Easings.EaseOut,
      onFinish: () => {
        onComplete?.();
      },
    });
    tween.play();
  }

  public animateCardFromSlotToHand(slotIndex: number, onComplete?: () => void): void {
    const slotGroup = this.expressionSlots[slotIndex];
    const cardInSlot = slotGroup.getChildren().slice(1)[0];

    if (!cardInSlot) {
      onComplete?.();
      return;
    }

    const cardData = (cardInSlot as Konva.Group).getAttr('cardData');
    if (!cardData) {
      onComplete?.();
      return;
    }

    const cardVisual = this.cardVisuals.get(cardData.id);
    if (!cardVisual) {
      onComplete?.();
      return;
    }

    const slotPos = slotGroup.position();
    cardVisual.position({ x: slotPos.x + 5, y: slotPos.y + 5 });
    cardVisual.visible(true);
    this.layer.batchDraw();

    const originalX = cardVisual.getAttr('originalX');
    const originalY = cardVisual.getAttr('originalY');

    const tween = new Konva.Tween({
      node: cardVisual,
      x: originalX,
      y: originalY,
      duration: 0.12,
      easing: Konva.Easings.EaseOut,
      onFinish: () => {
        onComplete?.();
      },
    });
    tween.play();
  }

  public animateSwap(index1: number, index2: number, onComplete?: () => void): void {
    const slot1 = this.expressionSlots[index1];
    const slot2 = this.expressionSlots[index2];
    const pos1 = slot1.position();
    const pos2 = slot2.position();

    const getCardVisual = (slot: Konva.Group) => {
      const card = slot.getChildren().slice(1)[0];
      const data = card ? (card as Konva.Group).getAttr('cardData') : null;
      return data ? this.cardVisuals.get(data.id) : undefined;
    };

    const card1Visual = getCardVisual(slot1);
    const card2Visual = getCardVisual(slot2);
    const total = (card1Visual ? 1 : 0) + (card2Visual ? 1 : 0);
    if (total === 0) { onComplete?.(); return; }

    let done = 0;
    const finish = () => { if (++done >= total) onComplete?.(); };

    const animateTo = (v: Konva.Group | undefined, from: { x: number; y: number }, to: { x: number; y: number }) => {
      if (!v) return;
      v.visible(true);
      v.position({ x: from.x + 5, y: from.y + 5 });
      v.to({ x: to.x + 5, y: to.y + 5, duration: 0.15, easing: Konva.Easings.EaseInOut, onFinish: finish });
    };

    animateTo(card1Visual, pos1, pos2);
    animateTo(card2Visual, pos2, pos1);
  }

  public shakeCard(cardId: string): void {
    const cardVisual = this.cardVisuals.get(cardId);
    if (!cardVisual) return;

    const originalX = cardVisual.getAttr('originalX');
    const shakeAmount = 10;

    const shake1 = new Konva.Tween({
      node: cardVisual,
      x: originalX - shakeAmount,
      duration: 0.05,
      onFinish: () => {
        const shake2 = new Konva.Tween({
          node: cardVisual,
          x: originalX + shakeAmount,
          duration: 0.05,
          onFinish: () => {
            const shake3 = new Konva.Tween({
              node: cardVisual,
              x: originalX,
              duration: 0.05,
            });
            shake3.play();
          },
        });
        shake2.play();
      },
    });
    shake1.play();
  }

  // Event handlers
  public onExit(callback: () => void): void {
    this.onExitCallback = callback;
  }

  public onCardClick(callback: (card: Card) => void): void {
    this.onCardClickCallback = callback;
  }

  public onSlotClick(callback: (slotIndex: number) => void): void {
    this.onSlotClickCallback = callback;
  }

  public onSubmit(callback: () => void): void {
    this.onSubmitCallback = callback;
  }

  public onClear(callback: () => void): void {
    this.onClearCallback = callback;
  }

  public onNext(callback: () => void): void {
    this.onNextCallback = callback;
  }

  public onSwap(callback: (index1: number, index2: number) => void): void {
    this.onSwapCallback = callback;
  }

  public destroy(): void {
    // Destroy all running tweens
    this.runningTweens.forEach(tween => {
      try {
        tween.destroy();
      } catch {
        // Tween may already be destroyed
      }
    });
    this.runningTweens = [];

    // Clear button tweens
    this.buttonTweens.forEach(tween => {
      try {
        tween.destroy();
      } catch {
        // Tween may already be destroyed
      }
    });
    this.buttonTweens.clear();

    // Clear card visuals
    this.cardVisuals.clear();

    // Destroy the group
    this.group.destroy();
  }
}
