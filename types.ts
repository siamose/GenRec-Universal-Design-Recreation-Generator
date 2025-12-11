export enum ContentType {
  COLORING = 'COLORING',
  SUDOKU = 'SUDOKU',
  MATH = 'MATH',
}

export enum Difficulty {
  VERY_EASY = 1,
  EASY = 2,
  NORMAL = 3,
  HARD = 4,
  VERY_HARD = 5,
}

export interface AppState {
  contentType: ContentType;
  difficulty: Difficulty;
  theme: string;
  pageCount: number;
  includeAnswers: boolean;
  isGenerating: boolean;
  generatedContent: GeneratedContent | null;
}

export type MathProblem = {
  question: string;
  answer: string;
};

export type SudokuBoard = (number | null)[][];

export type PageData = string | MathProblem[] | SudokuBoard | null;

export interface GeneratedPage {
  problem: PageData;
  solution: PageData;
}

export interface GeneratedContent {
  type: ContentType;
  includeAnswers: boolean;
  pages: GeneratedPage[];
  createdAt: Date;
}

export interface GenerationParams {
  type: ContentType;
  difficulty: Difficulty;
  theme: string;
  count: number;
}