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
});
