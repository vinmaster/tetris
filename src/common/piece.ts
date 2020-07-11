import { Utility } from './utility';
import { Board } from './board';
import { CONSTANTS } from './constants';

/*
Rotation docs:
http://tech.migge.io/2017/02/07/tetris-rotations/
https://tetris.fandom.com/wiki/SRS
https://strategywiki.org/wiki/Tetris/Rotation_systems
https://www.youtube.com/watch?v=yIpk5TJ_uaI
https://www.youtube.com/watch?v=Atlr5vvdchY
*/

export class Piece {
  type: string;
  data: string[][];
  positions: string[][][];
  posIndex: number;
  row: number;
  col: number;
  kickData: number[][][];

  constructor(type: string) {
    this.type = type;
    this.data = [];
    this.positions = [];
    this.posIndex = 0;
    this.col = 0;
    this.row = 0;
    this.kickData = [];
    this.setProperties(type);
    this.position = 0;
  }

  setProperties(type) {
    switch (type) {
      case 'I':
        this.positions = CONSTANTS.POSITIONS_I;
        this.kickData = CONSTANTS.KICK_DATA_I;
        [this.col, this.row] = [2, -1];
        break;
      case 'J':
        this.positions = CONSTANTS.POSITIONS_J;
        this.kickData = CONSTANTS.KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'L':
        this.positions = CONSTANTS.POSITIONS_L;
        this.kickData = CONSTANTS.KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'O':
        this.positions = CONSTANTS.POSITIONS_O;
        this.kickData = CONSTANTS.KICK_DATA_O;
        [this.col, this.row] = [4, 0];
        break;
      case 'S':
        this.positions = CONSTANTS.POSITIONS_S;
        this.kickData = CONSTANTS.KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'T':
        this.positions = CONSTANTS.POSITIONS_T;
        this.kickData = CONSTANTS.KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'Z':
        this.positions = CONSTANTS.POSITIONS_Z;
        this.kickData = CONSTANTS.KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      default:
        throw new Error('Invalid type: ' + type);
    }
  }

  get position() {
    return this.posIndex;
  }

  set position(newPos: number) {
    if (this.positions.length === 0) return;
    this.posIndex = newPos;
    this.data = this.positions[this.posIndex];
  }

  shiftDownOnBoard(board: Board) {
    if (this.isValidMoveOnBoard(0, 1, this.data, board)) {
      // TODO: add gravity
      // const gravity = gravityArray[level];
      // this.y += gravity;
      this.row += 1;
    }
  }

  hardDropOnBoard(board: Board) {
    this.row += this.getDropDistanceOnBoard(20, board);
  }

  // Find maximum distance allowed
  getDropDistanceOnBoard(distance: number, board: Board) {
    let i;
    for (i = 1; i <= distance; i++) {
      if (!this.isValidMoveOnBoard(0, i, this.data, board)) return i - 1;
    }
    return i - 1;
  }

  getRotatedData(direction: 90 | -90) {
    const posDir = direction === 90 ? 1 : -1;
    return this.positions[Utility.modulo(this.position + posDir, 4)];
  }

  rotateOnBoard(direction: 90 | -90, board: Board) {
    let isRotated = false;
    const rotated = this.getRotatedData(direction);
    const posDir = direction === 90 ? 1 : -1;
    const newPos = Utility.modulo(this.position + posDir, 4);

    for (let i = 0, len = this.kickData[0].length; i < len; i++) {
      const [cx, cy] = this.kickData[this.position][i];
      if (this.isValidMoveOnBoard(this.col + cx, Math.floor(this.row + cy), rotated, board)) {
        this.col += cx;
        this.row += cy;
        this.position = newPos;
        isRotated = true;
        break;
      }
    }

    return isRotated;
  }

  isValidMoveOnBoard(cx, cy, data, board: Board): boolean {
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (
          data[row][col] &&
          (cy + row < 0 ||
            cx + col < 0 ||
            cy + row >= board.height ||
            cx + col >= board.width ||
            board.grid[cy + row] === undefined ||
            board.grid[cy + row][cx + col].length > 0)
        ) {
          return false;
        }
      }
    }
    // this.lockDelay = 0;
    return true;
  }

  toString() {
    return (
      this.data.map((line) => line.map((c) => (c.length ? c : ' ')).join('')).join('|\n') + '|'
    );
  }

  static getPieceTypes() {
    return ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  }

  // static spawnPiece() {
  //   const min = 1;
  //   const max = 7;
  //   const rnd = Math.floor(Math.random() * (max - min)) + min;
  //   const key = Object.keys(Pieces.TYPES)[rnd];
  //   return Pieces.TYPES[key];
  // }
}
