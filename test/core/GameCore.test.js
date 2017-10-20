/* eslint-env mocha */

const chai = require('chai')
const GameCore = require(process.cwd() + '/src/core/GameCore')
const Pieces = require(process.cwd() + '/src/core/Pieces')

const expect = chai.expect

describe('GameCore', () => {
  beforeEach(() => GameCore.setup())
  afterEach(() => GameCore.teardown())

  it('should return list of empty players', () => {
    expect(GameCore.listPlayers()).empty
  })

  it('should add player', () => {
    const player = { id: 'test id', name: 'test name' }
    GameCore.registerPlayer(player)
    expect(GameCore.players[player.id]).eq(player)
    expect(GameCore.listPlayers()).lengthOf(1)
  })

  it('should remove player', () => {
    GameCore.registerPlayer({ id: '1', name: '1' })
    GameCore.removePlayer('1')
    expect(GameCore.listPlayers()).lengthOf(0)
  })

  it('should get player name', () => {
    GameCore.registerPlayer({ id: '1', name: 'name' })
    expect(GameCore.getName('1')).eq('name')
  })

  it('should setup with clean state', () => {
    expect(GameCore.nextPiece).not.eq(null)
    const board = GameCore.board
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        expect(board[row][col]).eq(' ')
      }
    }
  })

  it('should have a new piece on the board after 1 update', () => {
    const id = 'test id'
    GameCore.pieces = [Pieces.spawnPiece()]
    GameCore.initBoard(id)
    const nextPiece = GameCore.nextPiece
    expect(GameCore.currentPiece[id]).eq(null)
    expect(nextPiece).not.eq(null)
    GameCore.updateBoard(id)
    expect(GameCore.currentPiece).not.eq(null)
  })
})
