import { expect } from 'chai';
import 'mocha';
import { Board } from '../src/common/board';
import { Piece } from '../src/common/piece';

describe('Piece', () => {
  let board: Board;
  let piece: Piece;

  beforeEach(() => {
    board = new Board();
    piece = new Piece('I');
  });

  it('should inital values', () => {
    expect(piece.type).exist;
  });

  it('should rotate clockwise', () => {
    piece.row += 5;
    // piece.col 3;
    piece.rotateOnBoard(90, board);
    expect(piece.posIndex).eq(1);
    piece.rotateOnBoard(90, board);
    expect(piece.posIndex).eq(2);
    piece.rotateOnBoard(90, board);
    expect(piece.posIndex).eq(3);
    piece.rotateOnBoard(90, board);
    expect(piece.posIndex).eq(0);
    // console.log(piece.print());
    board.addPiece(piece);
    // console.log(piece.print());
    // console.log(board.print());
  });

  it('should rotate counterclockwise', () => {
    piece = new Piece('I');
    piece.row += 10;
    piece.rotateOnBoard(-90, board);
    expect(piece.posIndex).eq(3);
    piece.rotateOnBoard(-90, board);
    expect(piece.posIndex).eq(2);
    piece.rotateOnBoard(-90, board);
    expect(piece.posIndex).eq(1);
    piece.rotateOnBoard(-90, board);
    // board.addPiece(piece);
    // board.print();
    expect(piece.posIndex).eq(0);
    // board.addPiece(piece);
  });

  it('should shift down', () => {
    piece = new Piece('O');
    const row = piece.row;
    piece.shiftDownOnBoard(board);
    board.addPiece(piece);
    // console.log(board.print());
    expect(piece.row).eq(row + 1);
  });

  it('should hard drop down', () => {
    piece = new Piece('O');
    const row = piece.row;
    piece.hardDropOnBoard(board);
    board.addPiece(piece);
    // console.log(board.print());
    expect(piece.row).eq(18);
  });

  describe('L kick tests', () => {
    beforeEach(() => {
      board = new Board();
      piece = new Piece('L');
    });

    it('position 0 case 1', () => {
      [piece.row, piece.col] = [0, 0];
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[0][1]).eq('L');
      expect(board.grid[1][1]).eq('L');
      expect(board.grid[2][1]).eq('L');
      expect(board.grid[2][2]).eq('L');
    });

    it('position 0 case 4', () => {
      [piece.row, piece.col] = [board.grid.length - 3, 1];
      board.grid = board.getGridFromString(
        `..        
.         
.   .     
.  ..     `,
        false
      );
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[board.grid.length - 2][1]).eq('L');
      expect(board.grid[board.grid.length - 1][1]).eq('L');
      expect(board.grid[board.grid.length - 1][1]).eq('L');
      expect(board.grid[board.grid.length - 1][2]).eq('L');
    });

    it('position 0 case 5', () => {
      [piece.row, piece.col] = [0, 1];
      board.grid = board.getGridFromString(
        `..        
.         
. ...     
. ...     
.  ..     
..........`
      );
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[2][1]).eq('L');
      expect(board.grid[3][1]).eq('L');
      expect(board.grid[4][1]).eq('L');
      expect(board.grid[4][2]).eq('L');
      // console.log(board.print());
    });
  });

  describe('T kick tests', () => {
    beforeEach(() => {
      board = new Board();
      piece = new Piece('T');
    });

    it('position 3 case 2 & position 0 case 4', () => {
      [piece.row, piece.col] = [0, 2];
      piece.position = 3;
      board.grid = board.getGridFromString(
        ` .  .     
..  .     
.   .     
. ...     
.  ..     
. ...     
..........`
      );
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[1][2]).eq('T');
      expect(board.grid[2][1]).eq('T');
      expect(board.grid[2][2]).eq('T');
      expect(board.grid[2][3]).eq('T');
      board.removePiece(piece);
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[3][1]).eq('T');
      expect(board.grid[4][1]).eq('T');
      expect(board.grid[4][2]).eq('T');
      expect(board.grid[5][1]).eq('T');
      // console.log(board.print());
    });
  });
});
