import { expect } from 'chai';
import 'mocha';
import { Board } from '../src/common/board';
import { Piece } from '../src/common/piece';

describe.only('Piece', () => {
  let board: Board;
  let piece: Piece;

  beforeEach(() => {
    board = new Board();
    piece = new Piece('I');
  });

  it('should inital values', () => {
    expect(piece.type).exist;
  });

  it('should rotate', () => {
    // piece.row += 5;
    // piece.col 3;
    piece.rotateOnBoard(90, board);
    expect(piece.pos).eq(1);
    piece.rotateOnBoard(90, board);
    expect(piece.pos).eq(2);
    piece.rotateOnBoard(90, board);
    expect(piece.pos).eq(3);
    piece.rotateOnBoard(90, board);
    expect(piece.pos).eq(0);
    // console.log(piece.toString());
    board.addPiece(piece);
    // console.log(piece.toString());
    // console.log(board.toString());
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
      expect(board.grid[0][1]).eq('0');
      expect(board.grid[1][1]).eq('0');
      expect(board.grid[2][1]).eq('0');
      expect(board.grid[2][2]).eq('0');
    });

    it('position 0 case 4', () => {
      [piece.row, piece.col] = [18, 1];
      board.grid = board.getGridFromString(
        `          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
..        
.         
.   .     
.  ..     `
      );
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[18][1]).eq('0');
      expect(board.grid[19][1]).eq('0');
      expect(board.grid[19][1]).eq('0');
      expect(board.grid[19][2]).eq('0');
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
      expect(board.grid[2][1]).eq('0');
      expect(board.grid[3][1]).eq('0');
      expect(board.grid[4][1]).eq('0');
      expect(board.grid[4][2]).eq('0');
      // console.log(board.toString());
    });
  });

  describe('T kick tests', () => {
    beforeEach(() => {
      board = new Board();
      piece = new Piece('T');
    });

    it('position 3 case 2 & position 0 case 4', () => {
      [piece.row, piece.col] = [0, 2];
      piece.setPos(3);
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
      expect(board.grid[1][2]).eq('0');
      expect(board.grid[2][1]).eq('0');
      expect(board.grid[2][2]).eq('0');
      expect(board.grid[2][3]).eq('0');
      board.removePiece(piece);
      piece.rotateOnBoard(90, board);
      board.addPiece(piece);
      expect(board.grid[3][1]).eq('0');
      expect(board.grid[4][1]).eq('0');
      expect(board.grid[4][2]).eq('0');
      expect(board.grid[5][1]).eq('0');
      // console.log(board.toString());
    });
  });
});
