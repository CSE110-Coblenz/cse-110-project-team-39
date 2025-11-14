// Configuration for each world/planet
export interface WorldConfig {
  worldNumber: number;
  planetName: string;
  alienCount: number;
  operations: string[];
  numberRange: { min: number; max: number };
  expressionSlots: number;
  numberCardsPerRound: number;
  operationCardsPerRound: number;
  playerLives: number;
  alienDifficulty: {
    min: number; // Min result for alien expression
    max: number; // Max result for alien expression
  };
  colors: {
    planet: string;
    player: string;
    alien: string;
  };
}

// World 1: Addition and Subtraction only
export const WORLD_1_CONFIG: WorldConfig = {
  worldNumber: 1,
  planetName: 'Planet Nexus',
  alienCount: 10,
  operations: ['+', '-'],
  numberRange: { min: 0, max: 10 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 5,
    max: 20
  },
  colors: {
    planet: '#ff6b6b',
    player: '#60a5fa',
    alien: '#4ae290'
  }
};

// World 2: Add multiplication and division
export const WORLD_2_CONFIG: WorldConfig = {
  worldNumber: 2,
  planetName: 'Planet Arithmos',
  alienCount: 3,
  operations: ['+', '-', '×', '÷'],
  numberRange: { min: 0, max: 15 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 15,
    max: 40
  },
  colors: {
    planet: '#4ecdc4',
    player: '#60a5fa',
    alien: '#e2c44a'
  }
};

// Export world configs by number
export const WORLD_CONFIGS: { [key: number]: WorldConfig } = {
  1: WORLD_1_CONFIG,
  2: WORLD_2_CONFIG
};
