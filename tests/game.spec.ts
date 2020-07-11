import { expect } from 'chai';
import 'mocha';
import { Game } from '../src/common/game';

describe('Game', () => {
  let game: Game;

  beforeEach(() => (game = new Game()));

  it('should inital values', () => {
    expect(game.pause).true;
  });
});
