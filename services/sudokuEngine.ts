import { Difficulty, SudokuBoard } from "../types";

/**
 * Client-side Sudoku Generator.
 */

const BLANK = null;

function isValid(board: SudokuBoard, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check col
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

function solveSudoku(board: SudokuBoard): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        // Try digits 1-9
        // Randomize order to get random solutions
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export const generateSudoku = (difficulty: Difficulty): { problem: SudokuBoard, solution: SudokuBoard } => {
  // 1. Create empty board
  const board: SudokuBoard = Array.from({ length: 9 }, () => Array(9).fill(BLANK));

  // 2. Fill diagonal 3x3 matrices
  for (let i = 0; i < 9; i = i + 3) {
    fillBox(board, i, i);
  }

  // 3. Solve the rest to get a complete valid board
  solveSudoku(board);

  // Deep copy for solution
  const solution = board.map(row => [...row]);

  // 4. Remove digits based on difficulty
  let attempts = 0;
  let hintsToKeep = 45; // Default

  switch(difficulty) {
    case Difficulty.VERY_EASY: hintsToKeep = 45; break;
    case Difficulty.EASY: hintsToKeep = 38; break;
    case Difficulty.NORMAL: hintsToKeep = 32; break;
    case Difficulty.HARD: hintsToKeep = 26; break;
    case Difficulty.VERY_HARD: hintsToKeep = 21; break;
  }

  let cellsToRemove = 81 - hintsToKeep;
  
  while (cellsToRemove > 0 && attempts < 200) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (board[row][col] !== BLANK) {
      board[row][col] = BLANK;
      cellsToRemove--;
    }
    attempts++;
  }

  return { problem: board, solution: solution };
};

function fillBox(board: SudokuBoard, row: number, col: number) {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isValidInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
}

function isValidInBox(board: SudokuBoard, rowStart: number, colStart: number, num: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}