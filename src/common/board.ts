import { Piece } from './piece';

type Cell = { type: string; player?: string }[];

export class Board {
  height: number;
  width: number;
  grid: string[][];
  pieceTypes: string[];
  nextPieceTypes: string[];
  current: {
    piece: Piece;
    player: string;
  }[];

  constructor({ height = 22, width = 10 } = {}) {
    this.height = height;
    this.width = width;
    this.grid = this.getEmptyGrid();
    this.pieceTypes = Piece.getPieceTypes();
    this.nextPieceTypes = [];
    this.current = [];
  }

  update() {
    // TODO
    if (this.nextPieceTypes.length < 10) {
      // Get next 10
    }
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

  getGridFromString(str: string) {
    const lines = str.split('\n');
    let grid: string[][] = [];
    for (let row = 0; row < lines.length; row++) {
      const line = lines[row];
      grid[row] = line
        .padEnd(this.width, ' ')
        .split('')
        .map((s) => s.trim());
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

  spawnNewPieceForPlayer(player: string) {
    const nextPieceType = this.nextPieceTypes.shift();
    if (!nextPieceType) return false;

    const piece = new Piece(nextPieceType);
    this.current.push({ piece, player });

    const pieceHeight = piece.data.length;
    const pieceWidth = piece.data[0].length;
    for (let row = 0; row < pieceHeight; row++) {
      const gridColOffset = Math.floor(this.width / 2 - Math.floor(pieceWidth / 2));
      for (let col = 0; col < pieceWidth; col++) {
        // Piece data has nothing here
        if (piece.data[row][col].length === 0) continue;

        const newCol = col + gridColOffset;
        if (this.grid[row][newCol].length === 0 || this.canPlaceAt(row, newCol, player)) {
          this.addPieceAt(row, newCol, { type: piece.type, player });
        } else {
          return false;
        }
      }
    }
    return true;
  }

  addPiece(piece: Piece) {
    let once = false;

    // Add the piece to the stack.
    let range: number[] = [];
    let valid = false;
    for (let row = 0; row < piece.data.length; row++) {
      for (let col = 0; col < piece.data[0].length; col++) {
        if (piece.data[row][col]) {
          this.grid[row + piece.row][col + piece.col] = piece.data[row][col];
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

  toString() {
    return (
      this.grid.map((line) => line.map((c) => (c.length ? c : ' ')).join('')).join('|\n') + '|'
    );
  }

  // Check if this position has current pieces
  canPlaceAt(row, col, player): boolean {
    if (!player) return false;
    if (this.grid[row][col] === '') return false;

    const cell = this.decodeCell(this.grid[row][col]);

    // TODO: check performance
    return cell.some((c) => c.player !== player);
  }

  addPieceAt(row, col, { type, player }: { type: string; player?: string }) {
    if (this.grid[row][col].length !== 0) {
      this.grid[row][col] += '|';
    }
    this.grid[row][col] += this.encodeCell([{ type, player }]);
  }

  decodeCell(s: string): Cell {
    const entries = s.split('|');
    const result: Cell = [];
    for (const e of entries) {
      const [type, player] = e.split(',');
      result.push({ type, player });
    }
    return result;
  }

  encodeCell(cell: Cell): string {
    return cell
      .map((entry) => {
        if (entry.player) return `${entry.type},${entry.player}`;
        else return entry.type;
      })
      .join('|');
  }
}
