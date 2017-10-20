// const Logger = require(process.cwd() + '/src/server/Logger')
const GameCore = require(process.cwd() + '/src/core/GameCore')

// ES6 does not support static variables yet
let players = {}

module.exports = class Game extends GameCore {
  static setup() {
    super.setup()
  }

  static get players() { return players }
  static set players(newPlayers) { players = newPlayers }
}
