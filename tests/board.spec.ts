import { expect } from 'chai';
import 'mocha';
import { Board } from '../src/common/board';
import { Piece } from '../src/common/piece';

describe('Board', () => {
  let board: Board;

  beforeEach(() => (board = new Board()));

  it('should inital values', () => {
    expect(board.width).eq(10);
    expect(board.height).eq(22);
    expect(board.grid.length).eq(board.height);
    expect(board.grid[0].length).eq(board.width);
  });

  it('should create empty grid', () => {
    const grid = board.getEmptyGrid();
    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width; col++) {
        expect(grid[row][col]).eq('');
      }
    }
  });

  it('should clone grid', () => {
    expect(board.grid).not.eq(board.cloneGrid(board.grid));
  });

  it('should clear lines', () => {
    board.grid = board.getGridFromString(
      `
..... ....
..........
..........
..........
..... ....
. . ...   
. . . .   
..........
.  ..   . 
..........`,
      false
    );
    board.clearLines();
    // board.print();
  });

  describe('#getLinesToBeClearedBy', () => {
    it('should clear lines with T', () => {
      board.grid = board.getGridFromString(
        `..........
..........
. ........
.  .......
. ........
..........`,
        false
      );
      let piece = new Piece('T', board.grid.length - 4, 0, 1);
      const lines = board.getLinesToBeClearedBy(piece);
      board.addPiece(piece);
      // board.print();
      // console.log(lines.join('\n'));
      expect(lines.length).eq(3);
      expect(lines[0]).eq('. ........');
      expect(lines[1]).eq('.  .......');
      expect(lines[2]).eq('. ........');
    });

    it('should clear lines with I', () => {
      board.grid = board.getGridFromString(
        `..........
..........
.. .......
.. .......
.. .......
.. .......`,
        false
      );
      let piece = new Piece('I', board.grid.length - 4, 1, 3);
      const lines = board.getLinesToBeClearedBy(piece);
      board.addPiece(piece);
      // board.print();
      // console.log(lines.join('\n'));
      expect(lines.length).eq(4);
      expect(lines[0]).eq('.. .......');
      expect(lines[1]).eq('.. .......');
      expect(lines[2]).eq('.. .......');
      expect(lines[3]).eq('.. .......');
    });
  });
});
