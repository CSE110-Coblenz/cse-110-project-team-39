import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';

export class LaunchTransitionScreenView {
  private layer: Konva.Layer;
  private group: Konva.Group;
  private background: Konva.Rect;
  private spaceship: Konva.Group;
  private messageText: Konva.Text;
  private planet: Konva.Circle;
  private onCompleteCallbacks: Array<() => void> = [];

  constructor(layer: Konva.Layer) {
    this.layer = layer;
    this.group = new Konva.Group();
    this.layer.add(this.group);
  }

  public playAnimation(planetNumber: number): void {
    // Create background
    this.background = new Konva.Rect({
      x: 0,
      y: 0,
      width: DIMENSIONS.width,
      height: DIMENSIONS.height,
      fill: COLORS.background,
      opacity: 0
    });
    this.group.add(this.background);

    // Fade in background
    const fadeInBg = new Konva.Tween({
      node: this.background,
      duration: 0.5,
      opacity: 1
    });

    // Create planet - use world config colors (matching menu screen)
    const planetColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    this.planet = new Konva.Circle({
      x: DIMENSIONS.width / 2,
      y: DIMENSIONS.height / 2,
      radius: 40,
      fill: planetColors[planetNumber - 1] || planetColors[0],
      opacity: 0
    });
    this.group.add(this.planet);

    // Create spaceship
    this.spaceship = this.createSpaceship();
    this.spaceship.position({ x: -100, y: DIMENSIONS.height / 2 });
    this.group.add(this.spaceship);

    // Create message text
    this.messageText = new Konva.Text({
      x: 0,
      y: DIMENSIONS.height / 2 + 120,
      width: DIMENSIONS.width,
      text: `🚀 Launching Mission to Planet ${planetNumber}!`,
      fontSize: 36,
      fontFamily: 'Jersey 10',
      fill: COLORS.text,
      align: 'center',
      opacity: 0
    });
    this.group.add(this.messageText);

    // Animation sequence
    fadeInBg.play();

    // Show planet with quick pulse
    setTimeout(() => {
      const planetFadeIn = new Konva.Tween({
        node: this.planet,
        duration: 0.3,
        opacity: 1
      });
      planetFadeIn.play();

      // Quick pulse animation for planet
      const planetPulse = new Konva.Tween({
        node: this.planet,
        duration: 0.4,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        repeat: 1,
        easing: Konva.Easings.EaseInOut
      });
      planetPulse.play();
    }, 100);

    // Show message
    setTimeout(() => {
      const textFadeIn = new Konva.Tween({
        node: this.messageText,
        duration: 0.3,
        opacity: 1
      });
      textFadeIn.play();
    }, 200);

    // Fly spaceship across screen immediately (no delay)
    setTimeout(() => {
      const spaceshipFly = new Konva.Tween({
        node: this.spaceship,
        duration: 1.5,
        x: DIMENSIONS.width + 100,
        easing: Konva.Easings.EaseInOut
      });
      spaceshipFly.play();
    }, 100);

    // Zoom in planet effect
    setTimeout(() => {
      const planetZoom = new Konva.Tween({
        node: this.planet,
        duration: 0.5,
        scaleX: 15,
        scaleY: 15,
        opacity: 0.3,
        easing: Konva.Easings.EaseIn
      });
      planetZoom.play();

      const textFadeOut = new Konva.Tween({
        node: this.messageText,
        duration: 0.4,
        opacity: 0
      });
      textFadeOut.play();

      // Complete animation after zoom
      setTimeout(() => {
        this.onCompleteCallbacks.forEach(cb => cb());
      }, 600);
    }, 1200);

    this.layer.batchDraw();
  }

  private createSpaceship(): Konva.Group {
    const ship = new Konva.Group();

    // Main body (triangle)
    const body = new Konva.Path({
      data: 'M 0,0 L 30,-15 L 30,15 Z',
      fill: COLORS.primary,
      stroke: COLORS.primaryLight,
      strokeWidth: 2
    });

    // Window
    const window = new Konva.Circle({
      x: 15,
      y: 0,
      radius: 5,
      fill: '#60a5fa'
    });

    // Flame (animated)
    const flame = new Konva.Path({
      data: 'M -10,-8 L -20,-5 L -15,0 L -20,5 L -10,8 Z',
      fill: '#ff6b6b',
      opacity: 0.8
    });

    // Animate flame
    const flameAnim = new Konva.Tween({
      node: flame,
      duration: 0.2,
      scaleX: 0.7,
      opacity: 0.5,
      yoyo: true,
      repeat: -1
    });
    flameAnim.play();

    ship.add(flame);
    ship.add(body);
    ship.add(window);

    return ship;
  }

  public onComplete(callback: () => void): void {
    this.onCompleteCallbacks.push(callback);
  }

  public destroy(): void {
    this.group.destroy();
  }
}
