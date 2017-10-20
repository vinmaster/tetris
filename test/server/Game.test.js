/* eslint-env mocha */

const chai = require('chai')
const Game = require(process.cwd() + '/src/server/Game')

const expect = chai.expect

describe('Game', () => {
  beforeEach(() => Game.setup())
  afterEach(() => Game.teardown())

  it('should inherit GameCore functions', () => {
    expect(Game.listPlayers()).be.empty
  })
})
