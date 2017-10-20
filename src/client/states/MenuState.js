/* global Phaser */
const Game = require('src/client/Game')

module.exports = class MenuState extends Phaser.State {
  create() {
    const textStyle = {
      font: '36px Arial',
      fill: '#fff',
      align: 'center'
    }
    this.singleplayerText = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY - 50,
      'Singleplayer',
      textStyle
    )
    this.singleplayerText.fontWeight = 'bold'
    this.singleplayerText.anchor.x = 0.5
    this.singleplayerText.anchor.y = 0.5
    this.singleplayerText.inputEnabled = true
    this.singleplayerText.events.onInputUp.add(this.singleplayerTextOnClick.bind(this), this)

    this.multiplayerText = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY + 50,
      'Multiplayer',
      textStyle
    )
    this.multiplayerText.fontWeight = 'bold'
    this.multiplayerText.anchor.x = 0.5
    this.multiplayerText.anchor.y = 0.5
    this.multiplayerText.inputEnabled = true
    this.multiplayerText.events.onInputUp.add(this.multiplayerTextOnClick, this)

    this.stage.backgroundColor = '#182d3b'
    this.stage.disableVisibilityChange = true
  }

  singleplayerTextOnClick() {
    Game.mode = 'Singleplayer'
    this.game.state.start('GameState', true, false)
  }

  multiplayerTextOnClick() {
    Game.mode = 'Multiplayer'
    this.game.state.start('WaitRoomState', true, false)
  }
}
