// Card types
export type CardType = 'number' | 'operation';

export interface Card {
  id: string;
  type: CardType;
  value: string | number;
}

// Expression slot
export interface ExpressionSlot {
  index: number;
  card: Card | null;
}

// Alien data
export interface Alien {
  id: number;
  expression: Card[];
  result: number;
}

// Game state
export type GameState = 'playing' | 'won' | 'lost' | 'complete';
