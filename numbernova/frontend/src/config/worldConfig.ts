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
  numberRange: { min: 1, max: 8 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 5,
    max: 16
  },
  colors: {
    planet: '#ff6b6b',
    player: '#60a5fa',
    alien: '#4ae290'
  }
};

// World 2: Higher number addition and subtraction
export const WORLD_2_CONFIG: WorldConfig = {
  worldNumber: 2,
  planetName: 'Planet Arithmos',
  alienCount: 10,
  operations: ['+', '-'],
  numberRange: { min: 6, max: 12 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 12,
    max: 24
  },
  colors: {
    planet: '#4ecdc4',
    player: '#60a5fa',
    alien: '#e2c44a'
  }
};

// World 3: Low number multiplication and division
export const WORLD_3_CONFIG: WorldConfig = {
  worldNumber: 3,
  planetName: 'Planet Multiplica',
  alienCount: 10,
  operations: ['×', '÷'],
  numberRange: { min: 1, max: 8 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 8,
    max: 32
  },
  colors: {
    planet: '#45b7d1',
    player: '#60a5fa',
    alien: '#e2c44a'
  }
};

// World 4: Higher number multiplication and division
export const WORLD_4_CONFIG: WorldConfig = {
  worldNumber: 4,
  planetName: 'Planet Dividus',
  alienCount: 10,
  operations: ['×', '÷'],
  numberRange: { min: 6, max: 12 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 36,
    max: 144
  },
  colors: {
    planet: '#96ceb4',
    player: '#60a5fa',
    alien: '#e2c44a'
  }
};

// World 5: Super bonus - Factorials and Exponents
export const WORLD_5_CONFIG: WorldConfig = {
  worldNumber: 5,
  planetName: 'Planet Terra (Earth)',
  alienCount: 10,
  operations: ['!', '^'],
  numberRange: { min: 2, max: 6 },
  expressionSlots: 3,
  numberCardsPerRound: 3,
  operationCardsPerRound: 2,
  playerLives: 3,
  alienDifficulty: {
    min: 24,
    max: 720
  },
  colors: {
    planet: '#feca57',
    player: '#60a5fa',
    alien: '#e2c44a'
  }
};

// Export world configs by number
export const WORLD_CONFIGS: { [key: number]: WorldConfig } = {
  1: WORLD_1_CONFIG,
  2: WORLD_2_CONFIG,
  3: WORLD_3_CONFIG,
  4: WORLD_4_CONFIG,
  5: WORLD_5_CONFIG
};
