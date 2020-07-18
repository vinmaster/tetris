import { expect } from 'chai';
import 'mocha';
import { Game } from '../src/common/game';
import { User } from '../src/common/user';

describe('Game', () => {
  let game: Game;
  let user: User;

  beforeEach(() => {
    game = new Game();
    user = {
      username: 'test',
      userId: 'test',
      role: 'User',
    } as User;
    game.addUser(user);
    game.pieceHistory = game.getNewPieces(10);
  });

  it('should inital values', () => {
    expect(game.gameState).eq('WAITING');
  });

  it('should update after starting', () => {
    game.gameState = 'START';
    game.update();
    expect(user.pieceIndex).eq(0);
    expect(game.boards[user.userId].currentPiece!.type).eq(game.pieceHistory[0]);
    game.update();
  });

  it('should stop piece when hitting bottom', () => {
    const board = game.boards[user.userId];
    game.pieceHistory = ['J', 'T'];
    game.gameState = 'START';
    board.currentPiece = game.getNextPiece(user.userId);
    if (board.currentPiece) {
      board.currentPiece.row = 18;
      // board.addPiece(board.currentPiece);
      // board.print();
      // board.removePiece(board.currentPiece);
      board.addPiece(board.currentPiece);
      game.update();
      // board.print();
      const canMoveDown = board.currentPiece.isValidMoveOnBoard(
        0,
        1,
        board.currentPiece.data,
        board
      );
      expect(board.currentPiece.type).eq('T');
      // expect(canMoveDown).false;
    }
  });

  it('should clear line', () => {
    const board = game.boards[user.userId];
    board.grid = board.getGridFromString(
      `
          
OO OOOOOOO`,
      false
    );
    game.pieceHistory = ['T', 'I'];
    game.gameState = 'START';
    board.currentPiece = game.getNextPiece(user.userId);
    board.currentPiece.position = 2;
    board.currentPiece.row = 16;
    board.currentPiece.col = 1;
    if (board.currentPiece) {
      board.addPiece(board.currentPiece);
      expect(board.grid[19].join('')).eq('OOOOOOOOO');
      board.removePiece(board.currentPiece);

      // Fall in place
      game.update();
      board.addPiece(board.currentPiece);
      expect(board.grid[19].join('')).eq('OOTOOOOOOO');
      board.removePiece(board.currentPiece);

      // Next update should clear line from
      game.update();
      expect(board.grid[19].join('')).eq('TTT');
      // board.addPiece(board.currentPiece);
      // board.print();
    }
  });
});
