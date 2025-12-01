import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';
import { Card, Alien, ExpressionSlot } from '../../types';
import { WorldConfig } from '../../config/worldConfig';

export class GamePlayScreenView {
  private layer: Konva.Layer;
  private group: Konva.Group;
  private config: WorldConfig;

  // UI Elements
  private background!: Konva.Rect;
  private exitButton!: Konva.Group;
  private scoreText!: Konva.Text;
  private aliensLeftText!: Konva.Text;
  private livesGroup!: Konva.Group;

  // Player area
  private playerCharacter!: Konva.Group;
  private playerExpressionSlots!: Konva.Group[];
  private playerResultText!: Konva.Text;
  private swapButton!: Konva.Group;

  // Alien area
  private alienCharacter!: Konva.Group;
  private alienExpressionSlots!: Konva.Group[];
  private alienResultText!: Konva.Text;

  // Card area
  private handCardsGroup!: Konva.Group;
  private cardVisuals: Map<string, Konva.Group> = new Map();

  // Buttons
  private fightButton!: Konva.Group;
  private fightButtonBg!: Konva.Rect;
  private fightButtonText!: Konva.Text;
  private clearButton!: Konva.Group;
  private clearButtonBg!: Konva.Rect;

  // Button tweens for hover effects
  private buttonTweens: Map<Konva.Node, Konva.Tween> = new Map();

  // Callbacks
  private onExitCallback?: () => void;
  private onFightCallback?: () => void;
  private onClearCallback?: () => void;
  private onSwapCallback?: () => void;
  private onCardClickCallback?: (card: Card) => void;
  private onSlotClickCallback?: (slotIndex: number) => void;

  constructor(layer: Konva.Layer, config: WorldConfig) {
    this.layer = layer;
    this.config = config;
    this.group = new Konva.Group();
    this.layer.add(this.group);
    this.createUI();
  }

  private createUI(): void {
    this.createBackground();
    this.createTopBar();
    this.createCardArea(); // Planet surface first (bottom layer)
    this.createPlayerArea(); // Player on top of planet
    this.createAlienArea(); // Alien on top of planet
    this.createButtons();
  }

  private createBackground(): void {
    this.background = new Konva.Rect({
      x: 0,
      y: 0,
      width: DIMENSIONS.width,
      height: DIMENSIONS.height,
      fill: 'transparent'
    });
    this.group.add(this.background);
  }

  private createTopBar(): void {
    // Exit Game button (moved farther left)
    this.exitButton = new Konva.Group({ x: 15, y: 15 });
    const exitBg = new Konva.Rect({
      x: 80,
      y: 30,
      width: 160,
      height: 60,
      offsetX: 80,
      offsetY: 30,
      fill: COLORS.primary,
      cornerRadius: 30
    });
    const exitText = new Konva.Text({
      x: 0,
      y: 15,
      width: 160,
      text: 'Exit Game',
      fontSize: 24,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
      listening: false
    });
    this.exitButton.add(exitBg, exitText);
    this.exitButton.on('click tap', () => this.onExitCallback?.());
    this.addButtonHover(exitBg, true);
    this.group.add(this.exitButton);
    this.exitButton.moveToTop();

    // Title (with !)
    const title = new Konva.Text({
      x: DIMENSIONS.width / 2 - 250,
      y: 40,
      width: 500,
      text: 'Defeat the Aliens to save the planet!',
      fontSize: 28,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center'
    });
    this.group.add(title);
    title.moveToTop();

    // Score and aliens left (moved farther right)
    this.scoreText = new Konva.Text({
      x: DIMENSIONS.width - 240,
      y: 30,
      width: 230,
      text: 'Total Points: 0',
      fontSize: 22,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'right'
    });
    this.aliensLeftText = new Konva.Text({
      x: DIMENSIONS.width - 240,
      y: 55,
      width: 230,
      text: 'Aliens Left: 3',
      fontSize: 22,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'right'
    });
    this.group.add(this.scoreText, this.aliensLeftText);
    this.scoreText.moveToTop();
    this.aliensLeftText.moveToTop();
  }

  private createPlayerArea(): void {
    const centerX = 300;
    const centerY = 455; // Moved up 15 pixels

    // Expression slots: [Number] [Operation] [Number]
    this.playerExpressionSlots = [];
    const slotStartX = centerX - 140;
    const slotY = 180; // Moved down from 150 to be closer to player

    // Left number slot (index 0)
    const leftSlot = this.createExpressionSlot(slotStartX, slotY, 0, 'number');
    this.playerExpressionSlots.push(leftSlot);
    this.group.add(leftSlot);
    leftSlot.moveToTop();

    // Operation slot (index 1)
    const opSlot = this.createExpressionSlot(slotStartX + 95, slotY, 1, 'operation');
    this.playerExpressionSlots.push(opSlot);
    this.group.add(opSlot);
    opSlot.moveToTop();

    // Right number slot (index 2)
    const rightSlot = this.createExpressionSlot(slotStartX + 190, slotY, 2, 'number');
    this.playerExpressionSlots.push(rightSlot);
    this.group.add(rightSlot);
    rightSlot.moveToTop();

    // Swap button between number slots
    this.swapButton = this.createSwapButton(slotStartX + 95, slotY - 40);
    this.group.add(this.swapButton);
    this.swapButton.moveToTop();

    // Player character (stick figure - blue) with arm - bigger
    this.playerCharacter = this.createCharacter(centerX, centerY, this.config.colors.player, 'player');
    this.group.add(this.playerCharacter);
    this.playerCharacter.moveToTop();

    // Lives (hearts) to the left side of player - moved up and left
    this.livesGroup = new Konva.Group({ x: centerX - 140, y: centerY + 10 });
    this.group.add(this.livesGroup);
    this.livesGroup.moveToTop();

    // Player result text (hidden - removed for gameplay)
    this.playerResultText = new Konva.Text({
      x: centerX - 100,
      y: centerY + 80,
      width: 200,
      text: '',
      fontSize: 28,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
      visible: false
    });
    this.group.add(this.playerResultText);
  }

  private createAlienArea(): void {
    const centerX = 900;
    const centerY = 455; // Moved up 15 pixels

    // Expression slots: [Number] [Operation] [Number]
    this.alienExpressionSlots = [];
    const slotStartX = centerX - 140;
    const slotY = 180; // Moved down from 150 to be closer to alien

    // Left number slot
    const leftSlot = this.createExpressionSlot(slotStartX, slotY, -1, 'number', true);
    this.alienExpressionSlots.push(leftSlot);
    this.group.add(leftSlot);
    leftSlot.moveToTop();

    // Operation slot
    const opSlot = this.createExpressionSlot(slotStartX + 95, slotY, -1, 'operation', true);
    this.alienExpressionSlots.push(opSlot);
    this.group.add(opSlot);
    opSlot.moveToTop();

    // Right number slot
    const rightSlot = this.createExpressionSlot(slotStartX + 190, slotY, -1, 'number', true);
    this.alienExpressionSlots.push(rightSlot);
    this.group.add(rightSlot);
    rightSlot.moveToTop();

    // Alien character (stick figure - green) with arm
    this.alienCharacter = this.createCharacter(centerX, centerY, '#2d8659', 'alien'); // Darker green
    this.group.add(this.alienCharacter);
    this.alienCharacter.moveToTop();

    // Alien result text (hidden - removed for gameplay)
    this.alienResultText = new Konva.Text({
      x: centerX - 100,
      y: centerY + 80,
      width: 200,
      text: '',
      fontSize: 28,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
      visible: false
    });
    this.group.add(this.alienResultText);
  }

  private createExpressionSlot(
    x: number,
    y: number,
    index: number,
    slotType: 'number' | 'operation',
    isAlien: boolean = false
  ): Konva.Group {
    const slot = new Konva.Group({ x, y });

    // Different colors for number vs operation slots
    const slotColor = slotType === 'operation' ? '#ff9800' : '#2a2a3a';

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      fill: slotColor,
      stroke: COLORS.primary,
      strokeWidth: 2,
      cornerRadius: 8
    });

    bg.setAttr('slotIndex', index);
    bg.setAttr('slotType', slotType);
    bg.setAttr('isEmpty', true);

    // Don't make slots clickable - only the cards in them are clickable

    slot.add(bg);
    slot.setAttr('slotBg', bg);
    slot.setAttr('slotType', slotType);
    return slot;
  }

  private createSwapButton(x: number, y: number): Konva.Group {
    const btn = new Konva.Group({ x, y });

    const bg = new Konva.Rect({
      x: 40,
      y: 15,
      width: 80,
      height: 30,
      offsetX: 40,
      offsetY: 15,
      fill: '#4ade80',
      cornerRadius: 15
    });

    const text = new Konva.Text({
      width: 80,
      y: 5,
      text: '⇄ Swap',
      fontSize: 16,
      fontFamily: 'Jersey 10',
      fill: '#000',
      align: 'center',
      listening: false
    });

    btn.add(bg, text);
    btn.setAttr('bg', bg);
    btn.setAttr('text', text);
    btn.on('click tap', () => this.onSwapCallback?.());

    return btn;
  }

  private updateSwapButton(hasNumbers: boolean): void {
    const bg = this.swapButton.getAttr('bg');
    const text = this.swapButton.getAttr('text');

    if (hasNumbers) {
      bg.fill('#4ade80');
      text.fill('#000');
      this.swapButton.listening(true);
      this.swapButton.opacity(1);
      this.addButtonHover(bg, true);
    } else {
      bg.fill('#666');
      text.fill('#999');
      this.swapButton.listening(false);
      this.swapButton.opacity(1);
      this.removeButtonHover(bg);
    }
  }

  private updateFightButton(allSlotsFilled: boolean): void {
    if (allSlotsFilled) {
      this.fightButtonBg.fill('#4ade80');
      this.fightButtonBg.stroke('#2d7a4a');
      this.fightButtonText.fill('#000');
      this.fightButton.listening(true);
      this.fightButton.opacity(1);
      this.addButtonHover(this.fightButtonBg, true);
    } else {
      this.fightButtonBg.fill('#666');
      this.fightButtonBg.stroke('#444');
      this.fightButtonText.fill('#999');
      this.fightButton.listening(false);
      this.fightButton.opacity(1);
      this.removeButtonHover(this.fightButtonBg);
    }
  }

  private updateClearButton(hasCards: boolean): void {
    if (hasCards) {
      this.clearButtonBg.fill('#e63946');
      this.clearButtonBg.stroke('#a4161a');
      this.clearButton.listening(true);
      this.clearButton.opacity(1);
      this.addButtonHover(this.clearButtonBg, true);
    } else {
      this.clearButtonBg.fill('#666');
      this.clearButtonBg.stroke('#444');
      this.clearButton.listening(false);
      this.clearButton.opacity(1);
      this.removeButtonHover(this.clearButtonBg);
    }
  }

  private createCharacter(x: number, y: number, color: string, role: 'player' | 'alien'): Konva.Group {
    const char = new Konva.Group({ x, y });

    // Shadow under character
    const shadow = new Konva.Ellipse({
      x: 0,
      y: 105, // Adjusted for taller body (150/2 + 52/2 + small offset)
      radiusX: 50,
      radiusY: 18,
      fill: '#000',
      opacity: 0.25
    });

    // Head (circle) - lighter for alien, 30% bigger, moved down 6px to overlap body
    const headColor = role === 'alien' ? '#3fa573' : '#e0e0e0'; // Lighter green for alien head
    const head = new Konva.Circle({
      x: 0,
      y: -98, // Moved down from -104 by 6 pixels
      radius: 49,
      fill: headColor
    });

    // Body (rectangle) - 30% bigger, taller from bottom, 15% skinnier, slightly rounded
    const body = new Konva.Rect({
      x: -44, // Adjusted for 15% skinnier (88 width instead of 104)
      y: -52,
      width: 88, // 15% skinnier
      height: 150, // Increased from 130
      fill: color,
      cornerRadius: 4 // Tiny border radius for smoothness
    });

    // Arm - 30% bigger, more square, from shoulder area, slightly rounded
    // Player arm points up-right (45°), alien arm points up-left (135°)
    const armLength = 91; // 30% bigger
    const armWidth = 26; // 30% bigger
    const armStartY = -39; // From shoulder area (higher up in body)
    const armStartX = role === 'player' ? 30 : -30; // Adjusted for skinnier body

    // Use rectangle rotated for square look
    const arm = new Konva.Rect({
      x: armStartX,
      y: armStartY,
      width: armWidth,
      height: armLength,
      fill: color,
      cornerRadius: 3, // Tiny border radius for smoothness
      offsetX: armWidth / 2,
      offsetY: 0,
      rotation: role === 'player' ? -45 : 45 // Negative for player (up-right), positive for alien (up-left)
    });

    char.add(shadow, head, body, arm); // Shadow at bottom, head before body for smooth overlap, arm on top
    char.setAttr('arm', arm); // Store reference to arm for animation
    char.setAttr('role', role);
    return char;
  }

  public animatePlayerArm(): void {
    const arm = this.playerCharacter.getAttr('arm');
    if (!arm) return;

    // Animate from -45° to -60° and back
    const originalRotation = -45;
    const raisedRotation = -60;

    arm.to({
      rotation: raisedRotation,
      duration: 0.1,
      easing: Konva.Easings.EaseOut,
      onFinish: () => {
        arm.to({
          rotation: originalRotation,
          duration: 0.1,
          easing: Konva.Easings.EaseIn
        });
      }
    });
  }

  private createCardArea(): void {
    // Planet surface - very large circle for gentle curve
    const planetRadius = 3000; // Much larger radius for very gentle curve
    const planetCenterY = DIMENSIONS.height + planetRadius - 300; // Position so top curve is visible
    const planetCenterX = DIMENSIONS.width / 2; // Keep planet centered in game area

    const planetSurface = new Konva.Circle({
      x: planetCenterX,
      y: planetCenterY,
      radius: planetRadius,
      fill: this.config.colors.planet,
      strokeWidth: 0
    });
    this.group.add(planetSurface);

    // Function to darken a color slightly
    const darkenColor = (color: string, percent: number) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
    };

    // Generate random craters with variable sizes, no overlapping
    const numCraters = 6 + Math.floor(Math.random() * 10); // 6-15 craters
    const craters: { x: number; y: number; r: number }[] = [];

    // Generate non-overlapping craters
    let attempts = 0;
    // Extend crater range beyond screen edges to ensure full coverage
    const craterMinX = -150;
    const craterMaxX = DIMENSIONS.width + 150;
    while (craters.length < numCraters && attempts < 100) {
      attempts++;
      const radius = 16 + Math.random() * 54; // 16-70px
      const x = craterMinX + Math.random() * (craterMaxX - craterMinX); // Allow craters to extend beyond edges

      // Calculate planet surface height at this x position
      const dx = x - planetCenterX;
      const underSqrt = planetRadius * planetRadius - dx * dx;

      if (underSqrt < 0) {
        // This x position is outside planet radius, skip
        continue;
      }

      const planetSurfaceY = planetCenterY - Math.sqrt(underSqrt);
      // Generate y position relative to the surface at this x
      const y = planetSurfaceY + Math.random() * 200; // 0-200px below surface

      // Check if crater overlaps with existing craters
      let overlaps = false;
      for (const existing of craters) {
        const dist = Math.sqrt((x - existing.x) ** 2 + (y - existing.y) ** 2);
        if (dist < radius + existing.r + 10) { // Add 10px buffer
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        craters.push({ x, y, r: radius });
      }
    }

    // Draw craters with radial gradient for depth and varying tones
    craters.forEach(crater => {
      // Slightly varying tone for each crater (±3%)
      const toneVariation = -3 + Math.random() * 6;
      const craterDarkness = 5 + toneVariation;

      // Create a group with clipping to only show the part on/below planet surface
      const craterGroup = new Konva.Group({
        clipFunc: (ctx) => {
          // Clip to show only parts at or below the planet surface
          ctx.beginPath();

          // Create clipping region for this specific crater area
          const clipStartX = Math.max(-200, crater.x - crater.r - 5);
          const clipEndX = Math.min(DIMENSIONS.width + 200, crater.x + crater.r + 5);

          // Sample points along the planet surface curve (optimized with larger step)
          const clipPoints: { x: number; y: number }[] = [];
          for (let sx = clipStartX; sx <= clipEndX; sx += 4) {
            const dx = sx - planetCenterX;
            const underSqrt = planetRadius * planetRadius - dx * dx;
            if (underSqrt >= 0) {
              const sy = planetCenterY - Math.sqrt(underSqrt);
              clipPoints.push({ x: sx, y: sy });
            }
          }

          // Draw the clipping path: start from surface, go down, then back
          if (clipPoints.length > 0) {
            ctx.moveTo(clipPoints[0].x, clipPoints[0].y);
            for (let j = 1; j < clipPoints.length; j++) {
              ctx.lineTo(clipPoints[j].x, clipPoints[j].y);
            }
            // Complete the clip region by going down and back
            ctx.lineTo(clipPoints[clipPoints.length - 1].x, DIMENSIONS.height + 100);
            ctx.lineTo(clipPoints[0].x, DIMENSIONS.height + 100);
            ctx.closePath();
          }
        }
      });

      // Create radial gradient for depth - darker center with soft edges
      const craterCircle = new Konva.Circle({
        x: crater.x,
        y: crater.y,
        radius: crater.r,
        fillRadialGradientStartPoint: { x: crater.r * 0.15, y: crater.r * 0.2 }, // Slightly below center for depth
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientEndRadius: crater.r * 1.4, // Extend gradient beyond edge for softer transition
        fillRadialGradientColorStops: [
          0, darkenColor(this.config.colors.planet, 25 + toneVariation), // Very dark at center
          0.3, darkenColor(this.config.colors.planet, 15 + toneVariation), // Dark
          0.6, darkenColor(this.config.colors.planet, 8 + toneVariation), // Medium
          0.85, darkenColor(this.config.colors.planet, 3 + toneVariation), // Light
          0.95, darkenColor(this.config.colors.planet, 0.5 + toneVariation), // Very soft edge
          1, this.config.colors.planet // Blend into planet surface at edge
        ]
      });

      craterGroup.add(craterCircle);

      // Cache the crater to avoid recalculating clipFunc every frame
      // Calculate bounds to cover the clipped region
      const clipStartX = Math.max(-200, crater.x - crater.r - 5);
      const clipEndX = Math.min(DIMENSIONS.width + 200, crater.x + crater.r + 5);
      const cacheWidth = clipEndX - clipStartX;
      const cacheHeight = DIMENSIONS.height + 100 - crater.y + crater.r;

      craterGroup.cache({
        x: clipStartX,
        y: crater.y - crater.r - 10,
        width: cacheWidth,
        height: cacheHeight
      });

      this.group.add(craterGroup);
    });

    // Calculate label positions to match the card boxes - farther apart
    const boxWidth = 280;
    const centerX = DIMENSIONS.width / 2;
    const gap = 200; // Increased from 50

    const numberBoxX = centerX - gap / 2 - boxWidth;
    const opBoxX = centerX + gap / 2;

    // Number Cards label
    const numLabel = new Konva.Text({
      x: numberBoxX,
      y: DIMENSIONS.height - 40,
      width: boxWidth,
      text: 'Number Cards',
      fontSize: 20,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center'
    });
    this.group.add(numLabel);
    numLabel.moveToTop();

    // Operation Cards label
    const opLabel = new Konva.Text({
      x: opBoxX,
      y: DIMENSIONS.height - 40,
      width: boxWidth,
      text: 'Operation Cards',
      fontSize: 20,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center'
    });
    this.group.add(opLabel);
    opLabel.moveToTop();

    this.handCardsGroup = new Konva.Group();
    this.group.add(this.handCardsGroup);
    this.handCardsGroup.moveToTop();
  }

  private createButtons(): void {
    const centerX = DIMENSIONS.width / 2;

    // Fight button (bigger) - positioned lower with shadow and outline
    this.fightButton = new Konva.Group({ x: centerX - 90, y: DIMENSIONS.height - 230 });
    this.fightButtonBg = new Konva.Rect({
      x: 90,
      y: 30,
      width: 180,
      height: 60,
      offsetX: 90,
      offsetY: 30,
      fill: '#4ade80',
      cornerRadius: 30,
      stroke: '#2d7a4a',
      strokeWidth: 3,
      shadowColor: '#000',
      shadowBlur: 10,
      shadowOpacity: 0.4,
      shadowOffsetX: 0,
      shadowOffsetY: 4
    });
    this.fightButtonText = new Konva.Text({
      width: 180,
      y: 12,
      text: 'FIGHT!',
      fontSize: 28,
      fontFamily: 'Jersey 10',
      fill: '#000',
      align: 'center',
      listening: false
    });
    this.fightButton.add(this.fightButtonBg, this.fightButtonText);
    this.fightButton.on('click tap', () => this.onFightCallback?.());
    this.group.add(this.fightButton);
    this.fightButton.moveToTop();

    // Clear button (same size) - positioned lower with shadow and outline - more red
    this.clearButton = new Konva.Group({ x: centerX - 70, y: DIMENSIONS.height - 160 });
    this.clearButtonBg = new Konva.Rect({
      x: 70,
      y: 20,
      width: 140,
      height: 40,
      offsetX: 70,
      offsetY: 20,
      fill: '#e63946',
      cornerRadius: 20,
      stroke: '#a4161a',
      strokeWidth: 3,
      shadowColor: '#000',
      shadowBlur: 10,
      shadowOpacity: 0.4,
      shadowOffsetX: 0,
      shadowOffsetY: 4
    });
    const clearText = new Konva.Text({
      width: 140,
      y: 8,
      text: 'Clear',
      fontSize: 20,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
      listening: false
    });
    this.clearButton.add(this.clearButtonBg, clearText);
    this.clearButton.setAttr('bg', this.clearButtonBg);
    this.clearButton.on('click tap', () => this.onClearCallback?.());
    this.group.add(this.clearButton);
    this.clearButton.moveToTop();
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
      cornerRadius: 5
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
      listening: false
    });

    cardGroup.add(bg, text);
    cardGroup.setAttr('cardData', card);
    cardGroup.setAttr('originalX', x);
    cardGroup.setAttr('originalY', y);

    // Click to place card
    cardGroup.on('click tap', () => {
      this.onCardClickCallback?.(card);
    });

    // Add hover effect
    this.addButtonHover(bg, true);

    return cardGroup;
  }

  public animateCardToSlot(cardId: string, targetSlotIndex: number, onComplete?: () => void): void {
    const cardVisual = this.cardVisuals.get(cardId);
    if (!cardVisual) {
      onComplete?.();
      return;
    }

    const targetSlot = this.playerExpressionSlots[targetSlotIndex];
    const targetPos = targetSlot.position();

    // Use Tween for smoother animation - Konva handles redraws automatically
    const tween = new Konva.Tween({
      node: cardVisual,
      x: targetPos.x + 5,
      y: targetPos.y + 5,
      duration: 0.12,
      easing: Konva.Easings.EaseOut,
      onFinish: () => {
        onComplete?.();
      }
    });
    tween.play();
  }

  public animateCardFromSlotToHand(slotIndex: number, onComplete?: () => void): void {
    const slotGroup = this.playerExpressionSlots[slotIndex];
    const cardInSlot = slotGroup.getChildren().slice(1)[0]; // Get the card group (skip bg)

    if (!cardInSlot) {
      onComplete?.();
      return;
    }

    // Get the card visual in hand (it's hidden)
  const cardData = (cardInSlot as any).getAttr('cardData');

    if (!cardData) {
      onComplete?.();
      return;
    }

    const cardVisual = this.cardVisuals.get(cardData.id);
    if (!cardVisual) {
      onComplete?.();
      return;
    }

    // Make card visual visible at slot position
    const slotPos = slotGroup.position();
    cardVisual.position({ x: slotPos.x + 5, y: slotPos.y + 5 });
    cardVisual.visible(true);
    this.layer.batchDraw();

    // Animate back to original hand position
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
      }
    });
    tween.play();
  }

  public shakeCard(cardId: string): void {
    const cardVisual = this.cardVisuals.get(cardId);
    if (!cardVisual) return;

    const originalX = cardVisual.getAttr('originalX');

    // Shake animation with Tween for smoothness
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
              duration: 0.05
            });
            shake3.play();
          }
        });
        shake2.play();
      }
    });
    shake1.play();
  }

  public renderHand(cards: Card[]): void {
    const bottomY = DIMENSIONS.height - 140; // Higher above labels
    const numberCards = cards.filter(c => c.type === 'number');
    const opCards = cards.filter(c => c.type === 'operation');

    // Track which cards we're keeping
    const newCardIds = new Set(cards.map(c => c.id));

    // Remove cards that are no longer in hand
    const cardsToRemove: string[] = [];
    this.cardVisuals.forEach((visual, cardId) => {
      if (!newCardIds.has(cardId)) {
        visual.destroy();
        cardsToRemove.push(cardId);
      }
    });
    cardsToRemove.forEach(id => this.cardVisuals.delete(id));

    // Create equal-width boxes for symmetry
    const boxWidth = 280; // Same width for both sections
    const spacing = 85; // Space between cards
    const centerX = DIMENSIONS.width / 2;
    const gap = 200; // Gap between the two boxes (matches createCardArea)

    // Number box on left: centered at centerX - gap/2 - boxWidth/2
    const numberBoxX = centerX - gap / 2 - boxWidth;
    // Operation box on right: centered at centerX + gap/2
    const opBoxX = centerX + gap / 2;

    // Render/update number cards (centered within their box)
    const numCardsWidth = (numberCards.length - 1) * spacing + 70; // Total width of cards
    const numStartX = numberBoxX + (boxWidth - numCardsWidth) / 2; // Center cards in box

    numberCards.forEach((card, i) => {
      const targetX = numStartX + i * spacing;
      const targetY = bottomY + 20;

      let visual = this.cardVisuals.get(card.id);
      if (visual) {
        // Card already exists - animate to new position with Tween
        const tween = new Konva.Tween({
          node: visual,
          x: targetX,
          y: targetY,
          duration: 0.15,
          easing: Konva.Easings.EaseInOut
        });
        tween.play();
        visual.setAttr('originalX', targetX);
        visual.setAttr('originalY', targetY);
      } else {
        // New card - create it
        visual = this.createCardVisual(card, targetX, targetY);
        this.cardVisuals.set(card.id, visual);
        this.handCardsGroup.add(visual);
      }
    });

    // Render/update operation cards (centered within their box)
    const opCardsWidth = (opCards.length - 1) * spacing + 70; // Total width of cards
    const opStartX = opBoxX + (boxWidth - opCardsWidth) / 2; // Center cards in box

    opCards.forEach((card, i) => {
      const targetX = opStartX + i * spacing;
      const targetY = bottomY + 20;

      let visual = this.cardVisuals.get(card.id);
      if (visual) {
        // Card already exists - animate to new position with Tween
        const tween = new Konva.Tween({
          node: visual,
          x: targetX,
          y: targetY,
          duration: 0.15,
          easing: Konva.Easings.EaseInOut
        });
        tween.play();
        visual.setAttr('originalX', targetX);
        visual.setAttr('originalY', targetY);
      } else {
        // New card - create it
        visual = this.createCardVisual(card, targetX, targetY);
        this.cardVisuals.set(card.id, visual);
        this.handCardsGroup.add(visual);
      }
    });

    this.layer.batchDraw();
  }

  public animateSwap(onComplete?: () => void): void {
    const leftSlot = this.playerExpressionSlots[0];
    const rightSlot = this.playerExpressionSlots[2];

    const leftPos = leftSlot.position();
    const rightPos = rightSlot.position();

    // Get the card data from slots
    const leftCardInSlot = leftSlot.getChildren().slice(1)[0];
    const rightCardInSlot = rightSlot.getChildren().slice(1)[0];

    const leftCardData = leftCardInSlot ? (leftCardInSlot as any).getAttr('cardData') : undefined;
    const rightCardData = rightCardInSlot ? (rightCardInSlot as any).getAttr('cardData') : undefined;

    // Get the hidden card visuals
    const leftCardVisual = leftCardData ? this.cardVisuals.get(leftCardData.id) : null;
    const rightCardVisual = rightCardData ? this.cardVisuals.get(rightCardData.id) : null;

    let animationsFinished = 0;
    const totalAnimations = (leftCardVisual ? 1 : 0) + (rightCardVisual ? 1 : 0);

    if (totalAnimations === 0) {
      onComplete?.();
      return;
    }

    const finishAnimation = () => {
      animationsFinished++;
      if (animationsFinished >= totalAnimations) {
        onComplete?.();
      }
    };

    // Animate card visuals swapping positions with Tween for smoothness
    if (leftCardVisual && rightCardVisual) {
      // Both cards present - swap them
      const leftTween = new Konva.Tween({
        node: leftCardVisual,
        x: rightPos.x + 5,
        y: rightPos.y + 5,
        duration: 0.12,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          finishAnimation();
        }
      });

      const rightTween = new Konva.Tween({
        node: rightCardVisual,
        x: leftPos.x + 5,
        y: leftPos.y + 5,
        duration: 0.12,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          finishAnimation();
        }
      });

      leftTween.play();
      rightTween.play();
    } else if (leftCardVisual) {
      // Only left card - move to right
      const tween = new Konva.Tween({
        node: leftCardVisual,
        x: rightPos.x + 5,
        y: rightPos.y + 5,
        duration: 0.12,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          finishAnimation();
        }
      });
      tween.play();
    } else if (rightCardVisual) {
      // Only right card - move to left
      const tween = new Konva.Tween({
        node: rightCardVisual,
        x: leftPos.x + 5,
        y: leftPos.y + 5,
        duration: 0.12,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          finishAnimation();
        }
      });
      tween.play();
    }
  }

  public renderPlayerExpression(slots: ExpressionSlot[]): void {
    slots.forEach((slot, i) => {
      const slotGroup = this.playerExpressionSlots[i];
      const slotBg = slotGroup.getAttr('slotBg');

      // Clear old card if any
      const children = slotGroup.getChildren().slice(1); // Skip background
      children.forEach(child => child.destroy());

      if (slot.card) {
        // Create clickable card in slot
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
          verticalAlign: 'middle'
        });

        cardInSlot.add(text);
        cardInSlot.setAttr('cardData', slot.card); // Store card data for animation

        // Click card in slot to return it to hand
        cardInSlot.on('click tap', () => {
          this.onSlotClickCallback?.(i);
        });

        slotGroup.add(cardInSlot);
        slotBg.setAttr('isEmpty', false);

        // Hide the card visual from hand
        const cardVisual = this.cardVisuals.get(slot.card.id);
        if (cardVisual) {
          cardVisual.visible(false);
        }
      } else {
        slotBg.setAttr('isEmpty', true);
      }
    });

    // Update swap button state (only enable if at least one number is placed)
    const hasAtLeastOneNumber = slots[0].card !== null || slots[2].card !== null;
    this.updateSwapButton(hasAtLeastOneNumber);

    // Update clear button state (only enable if at least one card is placed)
    const hasAtLeastOneCard = slots[0].card !== null || slots[1].card !== null || slots[2].card !== null;
    this.updateClearButton(hasAtLeastOneCard);

    // Update fight button state
    // For factorial: need left number + operation
    // For other operations: need all 3 slots filled
    const operation = slots[1].card;
    const isFactorial = operation && operation.value === '!';
    let canFight = false;

    if (isFactorial) {
      // Factorial only needs left number and operation
      canFight = slots[0].card !== null && operation !== null;
    } else {
      // All other operations need all 3 slots
      canFight = slots[0].card !== null && operation !== null && slots[2].card !== null;
    }

    this.updateFightButton(canFight);

    this.layer.batchDraw();
  }

  public renderAlienExpression(alien: Alien | null): void {
    if (!alien) return;

    const cards = alien.expression;

    // Clear all alien slots first
    this.alienExpressionSlots.forEach(slotGroup => {
      const children = slotGroup.getChildren().slice(1);
      children.forEach(child => child.destroy());
    });

    // Place cards in order: number, operation, number
    // For factorial, skip the second number (it's always 0)
    const isFactorial = cards[1]?.value === '!';
    const cardsToRender = isFactorial ? cards.slice(0, 2) : cards;

    let slotIndex = 0;
    cardsToRender.forEach((card) => {
      if (slotIndex >= this.alienExpressionSlots.length) return;

      const slotGroup = this.alienExpressionSlots[slotIndex];

      const text = new Konva.Text({
        x: 0,
        y: 20,
        width: 80,
        height: 40,
        text: String(card.value),
        fontSize: 28,
        fontFamily: 'Jersey 10',
        fill: COLORS.text,
        align: 'center',
        verticalAlign: 'middle'
      });
      slotGroup.add(text);
      slotIndex++;
    });

    // Don't show result - player should calculate it
    this.layer.batchDraw();
  }

  public updateTopBar(score: number, aliensLeft: number, lives: number): void {
    this.scoreText.text(`Total Points: ${score}`);
    this.aliensLeftText.text(`Aliens Left: ${aliensLeft}`);

    // Update lives
    this.livesGroup.destroyChildren();
    for (let i = 0; i < lives; i++) {
      const heart = new Konva.Text({
        x: i * 30,
        y: 0,
        text: '♥',
        fontSize: 24,
        fill: '#ff6b6b'
      });
      this.livesGroup.add(heart);
    }

    this.layer.batchDraw();
  }

  public updatePlayerResult(result: number): void {
    // Hidden - player should calculate themselves
    // this.playerResultText.text(`= ${result}`);
    // this.layer.batchDraw();
  }

  public showResult(won: boolean, playerResult: number, alienResult: number): void {
    const message = won
      ? `You Win! ${playerResult} > ${alienResult}`
      : `You Lose! ${playerResult} ≤ ${alienResult}`;

    const resultText = new Konva.Text({
      x: DIMENSIONS.width / 2 - 200,
      y: DIMENSIONS.height / 2 - 40,
      width: 400,
      height: 80,
      text: message,
      fontSize: 36,
      fontFamily: 'Jersey 10',
      fill: won ? '#4ade80' : '#ff6b6b',
      align: 'center',
      verticalAlign: 'middle',
      shadowColor: '#000',
      shadowBlur: 10
    });

    this.group.add(resultText);
    this.layer.batchDraw();

    setTimeout(() => {
      resultText.destroy();
      this.layer.batchDraw();
    }, 2000);
  }

  // Event handlers
  public onExit(callback: () => void): void {
    this.onExitCallback = callback;
  }

  public onFight(callback: () => void): void {
    this.onFightCallback = callback;
  }

  public onClear(callback: () => void): void {
    this.onClearCallback = callback;
  }

  public onSwap(callback: () => void): void {
    this.onSwapCallback = callback;
  }

  public onCardClick(callback: (card: Card) => void): void {
    this.onCardClickCallback = callback;
  }

  public onSlotClick(callback: (slotIndex: number) => void): void {
    this.onSlotClickCallback = callback;
  }

  private addButtonHover(node: Konva.Node, isButton: boolean): void {
    // Remove existing hover listeners if any
    node.off('mouseenter');
    node.off('mouseleave');

    node.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';

      // Destroy existing tween for this node if any
      const existingTween = this.buttonTweens.get(node);
      if (existingTween) {
        existingTween.destroy();
      }

      const tween = new Konva.Tween({
        node: node,
        duration: 0.16,
        scaleX: 1.1,
        scaleY: 1.1,
        shadowBlur: isButton ? 15 : 5
      });

      this.buttonTweens.set(node, tween);
      tween.play();
    });

    node.on('mouseleave', () => {
      document.body.style.cursor = 'default';

      // Destroy existing tween for this node if any
      const existingTween = this.buttonTweens.get(node);
      if (existingTween) {
        existingTween.destroy();
      }

      const tween = new Konva.Tween({
        node: node,
        duration: 0.16,
        scaleX: 1,
        scaleY: 1,
        shadowBlur: isButton ? 10 : 0
      });

      this.buttonTweens.set(node, tween);
      tween.play();
    });
  }

  private removeButtonHover(node: Konva.Node): void {
    // Remove hover listeners
    node.off('mouseenter');
    node.off('mouseleave');

    // Destroy any existing tween
    const existingTween = this.buttonTweens.get(node);
    if (existingTween) {
      existingTween.destroy();
      this.buttonTweens.delete(node);
    }

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
  }

  public destroy(): void {
    this.group.destroy();
  }
}
