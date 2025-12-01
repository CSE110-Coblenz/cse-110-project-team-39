export interface MinigameConfig {
  minValue: number;
  maxValue: number;
  targetMin: number;
  targetMax: number;
}

export interface MinigameState {
  minValue: number;
  maxValue: number;
  targetMin: number;
  targetMax: number;
  startValue: number;
  currentValue: number;
  isInGreenZone: boolean;
}

export class MinigameScreenModel {
  private config: MinigameConfig;
  private startValue = 0;
  private currentValue = 0;

  constructor(config?: Partial<MinigameConfig>) {
    this.config = {
      minValue: 0,
      maxValue: 20,
      targetMin: 8,
      targetMax: 12,
      ...config,
    };

    this.startRound();
  }

  public startRound(startValue?: number): void {
    const { minValue, maxValue, targetMin, targetMax } = this.config;

    if (typeof startValue === 'number') {
      this.startValue = this.clamp(startValue, minValue, maxValue);
    } else {
      const pickLeft = Math.random() < 0.5;

      if (pickLeft) {
        this.startValue = this.randomInt(minValue, targetMin - 1);
      } else {
        this.startValue = this.randomInt(targetMax + 1, maxValue);
      }
    }

    this.currentValue = this.startValue;
  }

  public updateCurrentValue(value: number): void {
    this.currentValue = this.clamp(value, this.config.minValue, this.config.maxValue);
  }

  public isInGreenZone(): boolean {
    const { targetMin, targetMax } = this.config;
    return this.currentValue >= targetMin && this.currentValue <= targetMax;
  }

  public getState(): MinigameState {
    const { minValue, maxValue, targetMin, targetMax } = this.config;

    return {
      minValue,
      maxValue,
      targetMin,
      targetMax,
      startValue: this.startValue,
      currentValue: this.currentValue,
      isInGreenZone: this.isInGreenZone(),
    };
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  private randomInt(min: number, max: number): number {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
  }
}
