import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';

type VoidFn = () => void;

export class MenuScreenView {
  private layer: Konva.Layer;
  private bg: Konva.Rect;
  private starGroupBack: Konva.Group;
  private starGroupFront: Konva.Group;
  private shooting: Konva.Line | null = null;
  private menuGroup: Konva.Group;
  private title: Konva.Text;

  private playBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private invBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private logoutBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  
  // ADDED: Top right buttons
  private leaderboardBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private shopBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };
  private playerIconBtn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text };

  private twinkleAnim?: Konva.Animation;
  private driftAnim?: Konva.Animation;
  private shootingAnim?: Konva.Animation;
  private floatTitle?: Konva.Tween;
  private pulse?: Konva.Tween;

  private playHandlers: VoidFn[] = [];
  private inventoryHandlers: VoidFn[] = [];
  private logoutHandlers: VoidFn[] = [];
  
  // ADDED: Event handlers for new buttons
  private leaderboardHandlers: VoidFn[] = [];
  private shopHandlers: VoidFn[] = [];
  private playerIconHandlers: VoidFn[] = [];

  onPlay(cb: VoidFn) { this.playHandlers.push(cb); }
  onInventory(cb: VoidFn) { this.inventoryHandlers.push(cb); }
  onLogout(cb: VoidFn) { this.logoutHandlers.push(cb); }
  
  // ADDED: Event handlers for new buttons
  onLeaderboard(cb: VoidFn) { this.leaderboardHandlers.push(cb); }
  onShop(cb: VoidFn) { this.shopHandlers.push(cb); }
  onPlayerIcon(cb: VoidFn) { this.playerIconHandlers.push(cb); }

  private emitPlay() { for (const cb of this.playHandlers) cb(); }
  private emitInventory() { for (const cb of this.inventoryHandlers) cb(); }
  private emitLogout() { for (const cb of this.logoutHandlers) cb(); }
  
  // ADDED: Emit methods for new buttons
  private emitLeaderboard() { for (const cb of this.leaderboardHandlers) cb(); }
  private emitShop() { for (const cb of this.shopHandlers) cb(); }
  private emitPlayerIcon() { for (const cb of this.playerIconHandlers) cb(); }

  constructor(layer: Konva.Layer) {
    this.layer = layer;

    this.bg = new Konva.Rect({
      x: 0, y: 0, width: DIMENSIONS.width, height: DIMENSIONS.height,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: DIMENSIONS.width, y: DIMENSIONS.height },
      fillLinearGradientColorStops: [0, '#060616', 0.5, '#0a0a24', 1, '#0e1033']
    });

    this.starGroupBack = new Konva.Group();
    this.starGroupFront = new Konva.Group();
    this.spawnStars(this.starGroupBack, 140, 0.25, 1.2);
    this.spawnStars(this.starGroupFront, 90, 0.5, 2);

    this.menuGroup = new Konva.Group();

    this.title = new Konva.Text({
      x: DIMENSIONS.width / 2,
      y: 90,
      text: 'MAIN MENU — WELCOME!',
      fontSize: 36,
      fontFamily: 'Arial',
      fill: '#ffffff',
      align: 'center'
    });
    this.title.offsetX(this.title.width() / 2);

    // Top left: Logout button
    this.logoutBtn = this.makeButton(80, 40, 'LOG OUT', 120, 40);
    
    // ADDED: Top right buttons - Leaderboard | Shop | Player Icon
    const buttonSpacing = 10;
    const buttonWidth = 50;
    const buttonHeight = 50;
    const rightMargin = 40;
    
    // Calculate positions from right to left
    const playerIconX = DIMENSIONS.width - rightMargin - buttonWidth / 2;
    const shopX = playerIconX - buttonWidth - buttonSpacing;
    const leaderboardX = shopX - buttonWidth - buttonSpacing;
    
    this.leaderboardBtn = this.makeIconButton(leaderboardX, 40, '🏆', buttonWidth, buttonHeight);
    this.shopBtn = this.makeIconButton(shopX, 40, '🛒', buttonWidth, buttonHeight);
    this.playerIconBtn = this.makeIconButton(playerIconX, 40, '👤', buttonWidth, buttonHeight);

    this.playBtn = this.makeButton(DIMENSIONS.width / 2, 200, 'PLAY');
    this.invBtn = this.makeButton(DIMENSIONS.width / 2, 275, 'INVENTORY');

    this.layer.add(this.bg);
    this.layer.add(this.starGroupBack);
    this.layer.add(this.starGroupFront);

    this.menuGroup.add(this.title);
    this.menuGroup.add(this.logoutBtn.group);
    
    // ADDED: Top right buttons to menu group
    this.menuGroup.add(this.leaderboardBtn.group);
    this.menuGroup.add(this.shopBtn.group);
    this.menuGroup.add(this.playerIconBtn.group);
    
    this.menuGroup.add(this.playBtn.group);
    this.menuGroup.add(this.invBtn.group);
    this.layer.add(this.menuGroup);

    // Bind button events
    this.bindButton(this.logoutBtn, () => this.emitLogout());
    this.bindButton(this.leaderboardBtn, () => this.emitLeaderboard()); // ADDED
    this.bindButton(this.shopBtn, () => this.emitShop()); // ADDED
    this.bindButton(this.playerIconBtn, () => this.emitPlayerIcon()); // ADDED
    this.bindButton(this.playBtn, () => this.emitPlay());
    this.bindButton(this.invBtn, () => this.emitInventory());

    this.startAnimations();
    this.layer.draw();
  }

  // Existing button creation method
  private makeButton(cx: number, y: number, label: string, width: number = 240, height: number = 56) {
    const group = new Konva.Group();
    const rect = new Konva.Rect({
      x: cx - width / 2, 
      y, 
      width: width, 
      height: height, 
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
      fontSize: width === 120 ? 14 : 20,
      fontFamily: 'Arial', 
      fill: '#fff', 
      listening: true
    });
    text.offsetX(text.width() / 2);
    
    group.add(rect);
    group.add(text);
    
    return { group, rect, text };
  }

  // ADDED: Method for creating icon buttons (circular)
  private makeIconButton(cx: number, y: number, icon: string, width: number = 50, height: number = 50) {
    const group = new Konva.Group();
    const rect = new Konva.Rect({
      x: cx - width / 2, 
      y, 
      width: width, 
      height: height, 
      cornerRadius: width / 2, // Circular buttons
      fill: COLORS?.primary ?? '#7b61ff',
      shadowColor: '#000', 
      shadowBlur: 12, 
      shadowOpacity: 0.3, 
      listening: true
    });
    const text = new Konva.Text({
      x: cx, 
      y: y + height / 2 - 12,
      text: icon, 
      fontSize: 20,
      fontFamily: 'Arial', 
      fill: '#fff', 
      listening: true,
      align: 'center'
    });
    text.offsetX(text.width() / 2);
    
    group.add(rect);
    group.add(text);
    
    return { group, rect, text };
  }

  private bindButton(btn: { group: Konva.Group; rect: Konva.Rect; text: Konva.Text }, click: VoidFn) {
    const enter = () => { document.body.style.cursor = 'pointer'; this.bump(btn, true); };
    const leave = () => { document.body.style.cursor = 'default'; this.bump(btn, false); };
    const down = () => { btn.rect.scale({ x: 0.98, y: 0.98 }); this.layer.batchDraw(); };
    const up = () => { btn.rect.scale({ x: 1, y: 1 }); this.layer.batchDraw(); };
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
    this.pulse?.destroy();
    this.pulse = new Konva.Tween({
      node: btn.rect,
      duration: 0.16,
      scaleX: hover ? 1.05 : 1,
      scaleY: hover ? 1.05 : 1,
      shadowBlur: hover ? 20 : 16,
    });
    this.pulse.play();
  }

  private spawnStars(group: Konva.Group, count: number, opacityBase: number, maxRadius: number) {
    for (let i = 0; i < count; i++) {
      const s = new Konva.Circle({
        x: Math.random() * DIMENSIONS.width,
        y: Math.random() * DIMENSIONS.height,
        radius: Math.random() * maxRadius + 0.4,
        fill: '#ffffff',
        opacity: opacityBase + Math.random() * 0.4,
        listening: false
      });
      group.add(s);
    }
  }

  private startAnimations() {
    this.floatTitle = new Konva.Tween({
      node: this.title,
      duration: 2.4,
      y: this.title.y() + 7,
      yoyo: true,
      repeat: Infinity,
      easing: Konva.Easings.SineEaseInOut
    });
    this.floatTitle.play();

    this.twinkleAnim = new Konva.Animation((frame) => {
      if (!frame) return;
      const t = frame.time / 1000;
      this.starGroupBack.getChildren().each((node, i) => {
        const r = 0.15 * Math.sin(t * 1.2 + i) + 0.85;
        node.opacity(r * 0.5);
      });
      this.starGroupFront.getChildren().each((node, i) => {
        const r = 0.25 * Math.sin(t * 1.8 + i * 0.37) + 0.75;
        node.opacity(r);
      });
    }, this.layer);
    this.twinkleAnim.start();

    this.driftAnim = new Konva.Animation((frame) => {
      if (!frame) return;
      this.starGroupBack.x((this.starGroupBack.x() - 0.03) % 100);
      this.starGroupFront.x((this.starGroupFront.x() - 0.06) % 100);
    }, this.layer);
    this.driftAnim.start();

    this.startShootingStar();
  }

  private startShootingStar() {
    let cooldown = 0;
    this.shootingAnim = new Konva.Animation((frame) => {
      if (!frame) return;
      if (!this.shooting && cooldown <= 0) {
        const y = 40 + Math.random() * (DIMENSIONS.height * 0.6);
        const x = -120;
        const len = 140 + Math.random() * 120;
        this.shooting = new Konva.Line({
          points: [x, y, x + len, y + len * 0.25],
          stroke: 'rgba(255,255,255,0.8)',
          strokeWidth: 2,
          shadowBlur: 18,
          shadowColor: '#fff',
          listening: false
        });
        this.layer.add(this.shooting);
        cooldown = 3000 + Math.random() * 4000;
      }
      if (this.shooting) {
        this.shooting.points(this.shooting.points().map((v, idx) => v + (idx % 2 === 0 ? 3.2 : 0.8)));
        if (this.shooting.points()[0] > DIMENSIONS.width + 80) {
          this.shooting.destroy();
          this.shooting = null;
        }
      } else {
        cooldown -= frame.timeDiff;
      }
    }, this.layer);
    this.shootingAnim.start();
  }

  destroy() {
    this.floatTitle?.destroy();
    this.twinkleAnim?.stop();
    this.driftAnim?.stop();
    this.shootingAnim?.stop();
    this.menuGroup.destroy();
    this.starGroupFront.destroy();
    this.starGroupBack.destroy();
    this.bg.destroy();
    this.layer.batchDraw();
  }
}