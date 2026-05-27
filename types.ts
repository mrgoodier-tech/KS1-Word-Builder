export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum TurnPhase {
  MISSING_LETTER = 'MISSING_LETTER',
  TYPING = 'TYPING',
  SUCCESS = 'SUCCESS'
}

export interface WordConfig {
  fullWord: string;
  missingIndex: number;
  missingChar: string;
  options: string[];
}

export interface GameSession {
  score: number;
  totalAnswered: number;
  availableWords: string[];
}