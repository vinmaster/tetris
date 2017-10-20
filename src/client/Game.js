/* global Phaser */
const MenuState = require('src/client/states/MenuState')
const WaitRoomState = require('src/client/states/WaitRoomState')
const GameState = require('src/client/states/GameState')
const GameCore = require('src/core/GameCore')

// ES6 does not support static variables yet
let players = {}

module.exports = class Game extends GameCore {
  static setup() {
    super.setup()
    const width = $('#gameContainer').width()
    const height = $('#gameContainer').height()
    this.game = new Phaser.Game(width, height, Phaser.AUTO, 'gameContainer', { create: this.create.bind(this), render: this.render.bind(this) })
    this.mode = 'Singleplayer'
  }

  static get players() { return players }
  static set players(newPlayers) { players = newPlayers }

  static create() {
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE

    this.game.state.add('MenuState', MenuState, false)
    this.game.state.add('WaitRoomState', WaitRoomState, false)
    this.game.state.add('GameState', GameState, false)
    // this.game.state.start('MenuState')
    // this.game.state.start('GameState')
    this.game.state.start('WaitRoomState')
  }

  static render() {
    // this.game.debug.text(this.game.time.fps, 500, 14, '#00ff00')
  }
}
