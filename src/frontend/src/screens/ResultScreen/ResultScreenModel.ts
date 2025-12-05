export class ResultScreenModel {
  private won: boolean = false;

  constructor(won: boolean = false) {
    this.won = won;
  }

  public isWon(): boolean {
    return this.won;
  }

  public setWon(won: boolean): void {
    this.won = won;
  }

  public getTitle(): string {
    return this.won ? 'VICTORY! 🎉' : 'YOU LOSE!';
  }

  public getMessage(): string {
    return this.won
      ? 'You defeated all the aliens!'
      : 'The aliens were too strong!';
  }

  public getTitleColor(): string {
    return this.won ? '#4ecdc4' : '#ff6b6b';
  }
}
