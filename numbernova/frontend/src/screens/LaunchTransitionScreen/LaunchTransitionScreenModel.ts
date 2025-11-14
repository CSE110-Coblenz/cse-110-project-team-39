export class LaunchTransitionScreenModel {
  private planetNumber: number;

  constructor(planetNumber: number = 1) {
    this.planetNumber = planetNumber;
  }

  public getPlanetNumber(): number {
    return this.planetNumber;
  }

  public setPlanetNumber(num: number): void {
    this.planetNumber = num;
  }
}
