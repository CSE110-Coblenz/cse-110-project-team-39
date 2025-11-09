export class GamePlayScreenModel {
  score = 0;
  isRunning = false;

  start() { this.isRunning = true; this.score = 0; }
  stop() { this.isRunning = false; }
  addScore(v = 1) { this.score += v; }
}
