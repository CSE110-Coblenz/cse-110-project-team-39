import Konva from 'konva';
import { ProfileViewData } from './ProfileScreenModel';

export class ProfileScreenView {
  private container: Konva.Group;

  private usernameValue: Konva.Text;
  private emailValue: Konva.Text;
  private passwordValue: Konva.Text;
  private scoreValue: Konva.Text;
  private rankValue: Konva.Text;

  private backButton: Konva.Group;

  constructor(parentContainer: Konva.Group) {
    this.container = parentContainer;

    const title = new Konva.Text({
      x: 50,
      y: 40,
      text: 'Profile',
      fontSize: 32,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });
    this.container.add(title);

    let y = 120;
    const lineHeight = 40;

    const usernameLabel = new Konva.Text({
      x: 50,
      y,
      text: 'Username:',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });
    this.usernameValue = new Konva.Text({
      x: 220,
      y,
      text: '',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffff66',
    });
    this.container.add(usernameLabel, this.usernameValue);

    y += lineHeight;
    const emailLabel = new Konva.Text({
      x: 50,
      y,
      text: 'Email:',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });
    this.emailValue = new Konva.Text({
      x: 220,
      y,
      text: '',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffff66',
    });
    this.container.add(emailLabel, this.emailValue);

    y += lineHeight;
    const passwordLabel = new Konva.Text({
      x: 50,
      y,
      text: 'Password:',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });
    this.passwordValue = new Konva.Text({
      x: 220,
      y,
      text: '',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffff66',
    });
    this.container.add(passwordLabel, this.passwordValue);

    y += lineHeight;
    const scoreLabel = new Konva.Text({
      x: 50,
      y,
      text: 'Score:',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });
    this.scoreValue = new Konva.Text({
      x: 220,
      y,
      text: '',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffff66',
    });
    this.container.add(scoreLabel, this.scoreValue);

    y += lineHeight;
    const rankLabel = new Konva.Text({
      x: 50,
      y,
      text: 'Rank:',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });
    this.rankValue = new Konva.Text({
      x: 220,
      y,
      text: '',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffff66',
    });
    this.container.add(rankLabel, this.rankValue);

    // Back button
    this.backButton = new Konva.Group({
      x: 50,
      y: y + 80,
    });

    const backRect = new Konva.Rect({
      width: 160,
      height: 50,
      cornerRadius: 10,
      fill: '#333333',
      stroke: '#ffffff',
      strokeWidth: 2,
    });

    const backText = new Konva.Text({
      x: 0,
      y: 12,
      width: 160,
      align: 'center',
      text: 'Back',
      fontSize: 24,
      fontFamily: 'Jersey 10, Arial',
      fill: '#ffffff',
    });

    this.backButton.add(backRect, backText);
    this.container.add(this.backButton);
  }

  public renderProfile(data: ProfileViewData): void {
    this.usernameValue.text(data.username);
    this.emailValue.text(data.email);
    this.passwordValue.text(data.maskedPassword);
    this.scoreValue.text(data.score.toString());
    this.rankValue.text(
      data.rank !== null ? `#${data.rank}` : 'Unranked'
    );

    this.container.getStage()?.draw();
  }

  public getBackButton(): Konva.Group {
    return this.backButton;
  }
}
