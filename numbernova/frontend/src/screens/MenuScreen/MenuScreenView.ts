import Konva from 'konva';
import { COLORS, DIMENSIONS, FONTS } from '../../constants';
import { KonvaInput } from '../../components/KonvaInput';

type VoidFn = () => void;

export class MenuScreenView {
  private layer: Konva.Layer;
  private bg: Konva.Rect;
  private shooting: Konva.Line | null = null;
  private menuGroup: Konva.Group;
  private title: Konva.Text;
  private subtitle: Konva.Text;

  private logoutBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private leaderboardBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private shopBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private playerIconBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };

  private planetButtons: {
    group: Konva.Group;
    circle: Konva.Circle;
    text: Konva.Text;
    conceptButton: Konva.Group;
  }[] = [];

  private twinkleAnim?: Konva.Animation;
  private pulse?: Konva.Tween;
  private planetTweens: Map<number, Konva.Tween> = new Map();
  private buttonTweens: Map<Konva.Rect, Konva.Tween> = new Map();

  private logoutHandlers: VoidFn[] = [];
  private leaderboardHandlers: VoidFn[] = [];
  private shopHandlers: VoidFn[] = [];
  private playerIconHandlers: VoidFn[] = [];

  private tutorialGroup: Konva.Group | null = null;
  private tutorialTextNode: Konva.Text | null = null;
  private tutorialOkButton: Konva.Group | null = null;

  private planetHandlers: ((planetIndex: number) => void)[] = [];

  onLogout(cb: VoidFn) { this.logoutHandlers.push(cb); }
  onLeaderboard(cb: VoidFn) { this.leaderboardHandlers.push(cb); }
  onShop(cb: VoidFn) { this.shopHandlers.push(cb); }
  onPlayerIcon(cb: VoidFn) { this.playerIconHandlers.push(cb); }
  onPlanetClick(cb: (planetIndex: number) => void) { this.planetHandlers.push(cb); }

  private emitLogout() { for (const cb of this.logoutHandlers) cb(); }
  private emitLeaderboard() { for (const cb of this.leaderboardHandlers) cb(); }
  private emitShop() { for (const cb of this.shopHandlers) cb(); }
  private emitPlayerIcon() { for (const cb of this.playerIconHandlers) cb(); }
  private emitPlanetClick(planetIndex: number) { for (const cb of this.planetHandlers) cb(planetIndex); }

  constructor(layer: Konva.Layer) {
    this.layer = layer;

    this.bg = new Konva.Rect({
      x: -170,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      fill: 'transparent'
    });

    this.createTutorialOverlay();

    this.menuGroup = new Konva.Group();

    this.title = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 90,
      text: 'Welcome To Main Menu!',
      fontSize: 68,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center'
    });
    this.title.offsetX(this.title.width() / 2);

    this.subtitle = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 160,
      text: 'Select a level to start playing!',
      fontSize: 28,
      fontFamily: 'Jersey 10',
      fill: '#b0b0b0',
      align: 'center'
    });
    this.subtitle.offsetX(this.subtitle.width() / 2);

    this.logoutBtn = this.makeButton(80, 40, 'LOG OUT', 120, 40);

    const buttonSpacing = 10;
    const buttonWidth = 50;
    const buttonHeight = 50;
    const rightMargin = 40;

    const playerIconX = DIMENSIONS.width - rightMargin - buttonWidth / 2;
    const shopX = playerIconX - buttonWidth - buttonSpacing;
    const leaderboardX = shopX - buttonWidth - buttonSpacing;

    this.leaderboardBtn = this.makeIconButton(leaderboardX, 40, '🏆', buttonWidth, buttonHeight);
    this.shopBtn = this.makeIconButton(shopX, 40, '🛒', buttonWidth, buttonHeight);
    this.playerIconBtn = this.makeIconButton(playerIconX, 40, '👤', buttonWidth, buttonHeight);

    this.createPlanets();

    this.layer.add(this.bg);

    this.menuGroup.add(this.title);
    this.menuGroup.add(this.subtitle);
    this.menuGroup.add(this.logoutBtn.group);
    this.menuGroup.add(this.leaderboardBtn.group);
    this.menuGroup.add(this.shopBtn.group);
    this.menuGroup.add(this.playerIconBtn.group);

    this.planetButtons.forEach(planet => {
      this.menuGroup.add(planet.group);
    });

    this.layer.add(this.menuGroup);

    this.bindButton(this.logoutBtn, () => this.emitLogout());
    this.bindIconButton(this.leaderboardBtn, () => this.emitLeaderboard());
    this.bindIconButton(this.shopBtn, () => this.emitShop());
    this.bindIconButton(this.playerIconBtn, () => this.emitPlayerIcon());

    this.bindPlanetEvents();
    this.layer.batchDraw();
  }

  private createPlanets(): void {
    const planetColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const planetIcons = ['🪐', '🌍', '🛸', '🚀', '⭐'];
    const planetConcepts = [
      'Level 1 covers: basic addition & subtraction.',
      'Level 2 covers: intermediate addition & subtraction.',
      'Level 3 covers: basic multiplication & division.',
      'Level 4 covers: intermediate multiplication & division.',
      'Level 5 covers: Factorials & Exponentials. THIS IS A BONUS ROUND!'
    ];

    const centerX = DIMENSIONS.width / 2;
    const startY = 420;
    const planetSpacing = 220;

    for (let i = 0; i < 5; i++) {
      const planetX = centerX + (i - 2) * planetSpacing;
      const planet = this.createPlanet(
        planetX,
        startY,
        planetColors[i],
        planetIcons[i],
        i,
        planetConcepts[i]
      );
      this.planetButtons.push(planet);
    }
  }

  private createPlanet(
    x: number,
    y: number,
    color: string,
    icon: string,
    index: number,
    conceptDescription: string
  ) {
    const group = new Konva.Group();

    const circle = new Konva.Circle({
      x,
      y,
      radius: 100,
      fill: color,
      shadowColor: color,
      shadowBlur: 20,
      shadowOpacity: 0.8,
      listening: true
    });

    const emojiInPlanet = new Konva.Text({
      x,
      y: y - 10,
      text: icon,
      fontSize: 30,
      align: 'center',
      listening: true
    });
    emojiInPlanet.offsetX(emojiInPlanet.width() / 2);

    const label = new Konva.Text({
      x,
      y: y + 45,
      text: `Level ${index + 1}`,
      fontSize: 20,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center',
      listening: false
    });
    label.offsetX(label.width() / 2);

    const conceptButtonGroup = new Konva.Group();

    const conceptButtonWidth = 170;
    const conceptButtonHeight = 40;

    const conceptRect = new Konva.Rect({
      x: x - conceptButtonWidth / 2,
      y: y + 80,
      width: conceptButtonWidth,
      height: conceptButtonHeight,
      cornerRadius: 12,
      fill: '#222831',
      shadowColor: '#000',
      shadowBlur: 12,
      shadowOpacity: 0.4,
      listening: true
    });

    const conceptTextNode = new Konva.Text({
      x,
      y: y + 80 + 10,
      text: 'View Concepts',
      fontSize: 18,
      fontFamily: 'Jersey 10',
      fill: '#ffffff',
      align: 'center',
      listening: false
    });
    conceptTextNode.offsetX(conceptTextNode.width() / 2);

    conceptButtonGroup.add(conceptRect);
    conceptButtonGroup.add(conceptTextNode);

    conceptButtonGroup.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';
    });

    conceptButtonGroup.on('mouseleave', () => {
      document.body.style.cursor = 'default';
    });

    conceptButtonGroup.on('click', () => {
      this.showTutorial(conceptDescription);
    });

    group.add(circle);
    group.add(emojiInPlanet);
    group.add(label);
    group.add(conceptButtonGroup);

    return { group, circle, text: emojiInPlanet, conceptButton: conceptButtonGroup };
  }

  private bindPlanetEvents(): void {
    this.planetButtons.forEach((planet, index) => {
      const enter = () => {
        document.body.style.cursor = 'pointer';
        this.bumpPlanet(planet, index, true);
      };

      const leave = () => {
        document.body.style.cursor = 'default';
        this.bumpPlanet(planet, index, false);
      };

      const click = () => {
        console.log(`Planet ${index + 1} clicked!`);
        this.emitPlanetClick(index);
      };

      planet.circle.on('mouseenter', enter);
      planet.text.on('mouseenter', enter);
      planet.circle.on('mouseleave', leave);
      planet.text.on('mouseleave', leave);
      planet.circle.on('click', click);
      planet.text.on('click', click);
    });
  }

  private bumpPlanet(
    planet: { circle: Konva.Circle },
    index: number,
    hover: boolean
  ) {
    const existingTween = this.planetTweens.get(index);
    if (existingTween) {
      existingTween.destroy();
    }

    const tween = new Konva.Tween({
      node: planet.circle,
      duration: 0.2,
      scaleX: hover ? 1.15 : 1,
      scaleY: hover ? 1.15 : 1,
      shadowBlur: hover ? 25 : 15
    });

    this.planetTweens.set(index, tween);
    tween.play();
  }

  private makeButton(
    cx: number,
    y: number,
    label: string,
    width: number = 240,
    height: number = 56
  ) {
    const group = new Konva.Group();
    const rect = new Konva.Rect({
      x: cx,
      y: y + height / 2,
      width,
      height,
      offsetX: width / 2,
      offsetY: height / 2,
      cornerRadius: 12,
      fill: COLORS?.primary ?? '#7b61ff',
      shadowColor: '#000',
      shadowBlur: 16,
      shadowOpacity: 0.3,
      listening: true
    });
    const text = new Konva.Text({
      x: cx,
      y: y + height / 2 - 10,
      text: label,
      fontSize: width === 120 ? 18 : 20,
      fontFamily: 'Jersey 10',
      fill: '#fff',
      listening: true
    });
    text.offsetX(text.width() / 2);

    group.add(rect);
    group.add(text);

    return { group, rect, text };
  }

  private makeIconButton(
    cx: number,
    y: number,
    icon: string,
    width: number = 50,
    height: number = 50
  ) {
    const group = new Konva.Group();
    const rect = new Konva.Rect({
      x: cx,
      y: y + height / 2,
      width,
      height,
      offsetX: width / 2,
      offsetY: height / 2,
      cornerRadius: width / 2,
      fill: COLORS?.primary ?? '#7b61ff',
      shadowColor: '#000',
      shadowBlur: 12,
      shadowOpacity: 0.3,
      listening: true
    });
    const emojisInTopIconButtons = new Konva.Text({
      x: cx,
      y: y + height / 2 - 12,
      text: icon,
      fontSize: 25,
      fontFamily: 'Jersey 10',
      fill: '#fff',
      listening: true,
      align: 'center'
    });
    emojisInTopIconButtons.offsetX(emojisInTopIconButtons.width() / 2);

    group.add(rect);
    group.add(emojisInTopIconButtons);

    return { group, rect, text: emojisInTopIconButtons };
  }

  private bindButton(
    btn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text },
    click: VoidFn
  ) {
    const enter = () => {
      document.body.style.cursor = 'pointer';
      this.bump(btn, true);
    };
    const leave = () => {
      document.body.style.cursor = 'default';
      this.bump(btn, false);
    };
    const down = () => {
      btn.rect.scale({ x: 0.98, y: 0.98 });
      this.layer.batchDraw();
    };
    const up = () => {
      btn.rect.scale({ x: 1, y: 1 });
      this.layer.batchDraw();
    };
    const handler = () => click();

    btn.rect.on('mouseenter', enter);
    btn.text.on('mouseenter', enter);
    btn.rect.on('mouseleave', leave);
    btn.text.on('mouseleave', leave);
    btn.rect.on('mousedown', down);
    btn.rect.on('mouseup', up);
    btn.text.on('mousedown', down);
    btn.text.on('mouseup', up);
    btn.rect.on('click', handler);
    btn.text.on('click', handler);
  }

  private bindIconButton(
    btn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text },
    click: VoidFn
  ) {
    const enter = () => {
      document.body.style.cursor = 'pointer';
      this.bumpIcon(btn, true);
    };
    const leave = () => {
      document.body.style.cursor = 'default';
      this.bumpIcon(btn, false);
    };
    const down = () => {
      btn.rect.scale({ x: 0.98, y: 0.98 });
      this.layer.batchDraw();
    };
    const up = () => {
      btn.rect.scale({ x: 1, y: 1 });
      this.layer.batchDraw();
    };
    const handler = () => click();

    btn.rect.on('mouseenter', enter);
    btn.text.on('mouseenter', enter);
    btn.rect.on('mouseleave', leave);
    btn.text.on('mouseleave', leave);
    btn.rect.on('mousedown', down);
    btn.rect.on('mouseup', up);
    btn.text.on('mousedown', down);
    btn.text.on('mouseup', up);
    btn.rect.on('click', handler);
    btn.text.on('click', handler);
  }

  private bump(btn: { rect: Konva.Rect }, hover: boolean) {
    const existingTween = this.buttonTweens.get(btn.rect);
    if (existingTween) {
      existingTween.destroy();
    }

    const tween = new Konva.Tween({
      node: btn.rect,
      duration: 0.16,
      scaleX: hover ? 1.05 : 1,
      scaleY: hover ? 1.05 : 1,
      shadowBlur: hover ? 20 : 16
    });

    this.buttonTweens.set(btn.rect, tween);
    tween.play();
  }

  private bumpIcon(btn: { rect: Konva.Rect }, hover: boolean) {
    const existingTween = this.buttonTweens.get(btn.rect);
    if (existingTween) {
      existingTween.destroy();
    }

    const tween = new Konva.Tween({
      node: btn.rect,
      duration: 0.16,
      scaleX: hover ? 1.2 : 1,
      scaleY: hover ? 1.2 : 1,
      shadowBlur: hover ? 24 : 12
    });

    this.buttonTweens.set(btn.rect, tween);
    tween.play();
  }

  private createTutorialOverlay(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const overlayGroup = new Konva.Group({
      visible: false,
      listening: true
    });

    const backdrop = new Konva.Rect({
      x: -170,
      y: 0,
      width,
      height,
      fill: 'rgba(0,0,0,0.7)'
    });

    const boxWidth = Math.min(700, width - 80);
    const boxHeight = Math.min(400, height - 160);
    const boxX = (DIMENSIONS.width - boxWidth) / 2;
    const boxY = (DIMENSIONS.height - boxHeight) / 2;

    const box = new Konva.Rect({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      cornerRadius: 20,
      fill: '#000000',
      stroke: '#ffffff',
      strokeWidth: 2
    });

    const text = new Konva.Text({
      x: boxX + 24,
      y: boxY + 24,
      width: boxWidth - 48,
      height: boxHeight - 120,
      text: '',
      fontSize: 20,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
      align: 'left'
    });

    const okButtonWidth = 120;
    const okButtonHeight = 48;
    const okButtonX = boxX + boxWidth - okButtonWidth - 24;
    const okButtonY = boxY + boxHeight - okButtonHeight - 24;

    const okButtonGroup = new Konva.Group({
      x: okButtonX,
      y: okButtonY
    });

    const okRect = new Konva.Rect({
      width: okButtonWidth,
      height: okButtonHeight,
      cornerRadius: 12,
      fill: '#ffffff',
      stroke: '#ffffff',
      strokeWidth: 2
    });

    const okText = new Konva.Text({
      x: 0,
      y: 10,
      width: okButtonWidth,
      align: 'center',
      text: 'OK',
      fontSize: 22,
      fontFamily: 'Jersey 10, Arial',
      fill: '#000000'
    });

    okButtonGroup.add(okRect, okText);

    const hoverScale = 1.08;

    const onEnter = () => {
      document.body.style.cursor = 'pointer';
      okButtonGroup.scale({ x: hoverScale, y: hoverScale });
      this.layer.batchDraw();
    };

    const onLeave = () => {
      document.body.style.cursor = 'default';
      okButtonGroup.scale({ x: 1, y: 1 });
      this.layer.batchDraw();
    };

    okRect.on('mouseenter', onEnter);
    okText.on('mouseenter', onEnter);
    okRect.on('mouseleave', onLeave);
    okText.on('mouseleave', onLeave);

    overlayGroup.add(backdrop, box, text, okButtonGroup);

    this.layer.add(overlayGroup);

    this.tutorialGroup = overlayGroup;
    this.tutorialTextNode = text;
    this.tutorialOkButton = okButtonGroup;
  }

  public showTutorial(text: string): void {
    if (this.tutorialGroup && this.tutorialTextNode) {
      this.tutorialTextNode.text(text);
      this.tutorialGroup.visible(true);
      this.tutorialGroup.moveToTop();
      this.layer.getStage()?.draw();
    }
  }

  public hideTutorial(): void {
    if (this.tutorialGroup) {
      this.tutorialGroup.visible(false);
      this.layer.getStage()?.draw();
    }
  }

  public getTutorialOkButton(): Konva.Group | null {
    return this.tutorialOkButton;
  }

  destroy() {
    this.twinkleAnim?.stop();
    this.menuGroup.destroy();
    this.bg.destroy();
    this.layer.batchDraw();
  }
}
