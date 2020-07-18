import { Piece } from './piece';

type Cell = { type: string; player?: string }[];

export class Board {
  height: number;
  width: number;
  grid: string[][];
  pieceTypes: string[];
  currentPiece: Piece | null = null;
  holdPiece: Piece | null = null;
  // nextPieceTypes: string[] = [];
  // level: number = 0;
  // gravityArray: number[] = [];

  constructor({ height = 20, width = 10 } = {}) {
    this.height = height;
    this.width = width;
    this.grid = this.getEmptyGrid();
    this.pieceTypes = Piece.getPieceTypes();
  }

  static cloneFrom(obj): Board {
    const board = new Board(obj);
    board.currentPiece = Piece.cloneFrom(obj.currentPiece);
    board.grid = obj.grid;
    board.pieceTypes = obj.pieceTypes;
    board.holdPiece = Piece.cloneFrom(obj.holdPiece);
    return board;
  }

  update() {
    // TODO
    // if (this.nextPieceTypes.length < 10) {
    //   // Get next 10
    // }
  }

  getEmptyGrid() {
    let grid: string[][] = [];
    for (let row = 0; row < this.height; row++) {
      grid.push([]);
      for (let col = 0; col < this.width; col++) {
        grid[row].push('');
      }
    }
    return grid;
  }

  // Helper function to create a grid from visual representation of a grid
  getGridFromString(str: string, fromTop = true) {
    const lines = str.split('\n');
    let grid: string[][] = [];
    for (let row = 0; row < lines.length; row++) {
      const line = lines[row];
      grid[row] = line
        .padEnd(this.width, ' ')
        .split('')
        .map((s) => s.trim());
    }
    while (grid.length < this.height) {
      const line = ''
        .padEnd(this.width, ' ')
        .split('')
        .map((s) => s.trim());
      if (fromTop) {
        grid.push(line);
      } else {
        grid.unshift(line);
      }
    }
    return grid;
  }

  cloneGrid(previous) {
    let grid: string[][] = [];
    for (let row = 0; row < this.height; row++) {
      grid[row] = previous[row].slice();
      // TODO: check performance
      // grid.push([]);
      // for (let col = 0; col < this.width; col++) {
      //   grid[row].push(previous[row][col]);
      // }
    }
    return grid;
  }

  addPiece(piece: Piece) {
    let once = false;

    // Add the piece to the stack.
    let range: number[] = [];
    let valid = false;
    for (let row = 0; row < piece.data.length; row++) {
      for (let col = 0; col < piece.data[0].length; col++) {
        if (piece.data[row][col] && this.isInsideGrid(row + piece.row, col + piece.col)) {
          this.grid[row + piece.row][col + piece.col] = piece.type;
          // Check which lines get modified
          if (range.indexOf(col + piece.col) === -1) {
            range.push(col + piece.col);
            // This checks if any cell is in the play field. If there
            //  isn't any this is called a lock out and the game ends.
            if (col + piece.col > 1) valid = true;
          }
        }
      }
    }
    // console.log('range', range);
  }

  // TODO: unfinished
  removePiece(piece: Piece) {
    let once = false;

    // Add the piece to the stack.
    let range: number[] = [];
    let valid = false;
    for (let row = 0; row < piece.data.length; row++) {
      for (let col = 0; col < piece.data[0].length; col++) {
        if (piece.data[row][col]) {
          this.grid[row + piece.row][col + piece.col] = '';
          // Check which lines get modified
          if (range.indexOf(col + piece.col) === -1) {
            range.push(col + piece.col);
            // This checks if any cell is in the play field. If there
            //  isn't any this is called a lock out and the game ends.
            if (col + piece.col > 1) valid = true;
          }
        }
      }
    }
    // console.log('range', range);
  }

  getLinesToBeClearedBy(piece: Piece) {
    const startingRows = piece.row;
    const linesToBeCleared: string[] = [];
    for (let row = startingRows; row < startingRows + piece.data.length; row++) {
      let isFull = true;
      let line = '';
      for (let col = 0; col < this.width; col++) {
        if (!this.isInsideGrid(row, col)) {
          // console.log('Piece is out of the grid', piece, row, col);
          // return [];
          continue;
        }
        if (this.grid[row][col] === '' && piece.at(row, col) === '') {
          isFull = false;
          break;
        }
        if (this.grid[row][col] === '') {
          line += ' ';
        } else {
          line += this.grid[row][col];
        }
      }
      if (isFull && line.length > 0) {
        linesToBeCleared.push(line);
      }
    }
    return linesToBeCleared;
  }

  isInsideGrid(row, col) {
    return row >= 0 && row < this.height && col >= 0 && col < this.width;
  }

  clearLines() {
    let shiftCount = 0;
    for (let row = this.height - 1; row >= 0; row--) {
      let isFull = true;
      // Check if this row is full of tiles
      for (let col = 0; col < this.width; col++) {
        if (this.grid[row][col] === '') {
          isFull = false;
        }
        // Move rows down if there are cleared lines
        if (shiftCount > 0) {
          this.grid[row + shiftCount][col] = this.grid[row][col];
        }
      }
      // Clear line
      if (isFull) {
        shiftCount += 1;
        for (let col = 0; col < this.width; col++) {
          this.grid[row][col] = '';
        }
      }
    }
  }

  print() {
    const rows = this.grid.map((line) => line.map((c) => (c.length ? c : ' ')).join(''));
    for (const [i, row] of Object.entries(rows)) {
      console.log(row + '|' + i);
    }
  }
}
