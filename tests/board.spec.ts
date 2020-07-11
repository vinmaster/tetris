import { expect } from 'chai';
import 'mocha';
import { Board } from '../src/common/board';

describe('Game', () => {
  let board: Board;

  beforeEach(() => (board = new Board()));

  it('should inital values', () => {
    expect(board.width).eq(10);
    expect(board.height).eq(22);
    expect(board.grid.length).eq(board.height);
    expect(board.grid[0].length).eq(board.width);
  });

  describe('#spawnNewPieceForPlayer', () => {
    it('should fail if there is no next piece', () => {
      expect(board.spawnNewPieceForPlayer('player 1')).false;
    });

    it('should add next piece', () => {
      board.nextPieceTypes.push('I');
      expect(board.spawnNewPieceForPlayer('player 1')).true;
      expect(board.grid[0]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      expect(board.grid[1]).deep.eq([
        '',
        '',
        '',
        'I,player 1',
        'I,player 1',
        'I,player 1',
        'I,player 1',
        '',
        '',
        '',
      ]);
      expect(board.grid[2]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      expect(board.grid[3]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
    });

    it.skip('should add next piece if there is a piece not by this player', () => {
      board.nextPieceTypes.push('I');
      board.grid[0] = ['', '', '', '', '', 'I,player 2', '', '', '', ''];
      // expect(board.spawnNewPieceForPlayer('player 1')).true;
      // expect(board.grid[0]).deep.eq([
      //   '',
      //   '',
      //   '',
      //   'I,player 1',
      //   'I,player 1',
      //   'I,player 2|I,player 1',
      //   'I,player 1',
      //   '',
      //   '',
      //   '',
      // ]);
      // expect(board.grid[1]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      // expect(board.grid[2]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      // expect(board.grid[3]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      console.log(board.toString());
    });

    it.skip('should not add next piece if there is a piece by this player', () => {
      board.nextPieceTypes.push('I');
      board.grid[0] = ['', '', '', '', '', 'I,player 1', '', '', '', ''];
      // expect(board.spawnNewPieceForPlayer('player 1')).false;
      expect(board.grid[0]).deep.eq([
        '',
        '',
        '',
        'I,player 1',
        'I,player 1',
        'I,player 1',
        '',
        '',
        '',
        '',
      ]);
      expect(board.grid[1]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      expect(board.grid[2]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
      expect(board.grid[3]).deep.eq(['', '', '', '', '', '', '', '', '', '']);
    });
  });
});
