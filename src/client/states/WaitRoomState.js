/* global Phaser */
const Socket = require('src/client/Socket')
const Constants = require('src/core/Constants')
const STATUS = Constants.STATUS
const SOCKET = Constants.SOCKET
let Game

module.exports = class WaitRoomState extends Phaser.State {
  create() {
    const textStyle = {
      font: '36px Arial',
      fill: '#fff',
      align: 'center'
    }

    this.statusText = this.game.add.text(this.game.world.centerX, 0, 'Click here when ready', textStyle)
    this.statusText.anchor.x = 0.5
    this.statusText.fontWeight = 'bold'
    this.statusText.inputEnabled = true
    this.statusText.events.onInputUp.add(this.statusTextOnClick, this)

    this.playerListText = this.game.add.text(this.game.world.centerX, 100, '', textStyle)
    this.playerListText.anchor.x = 0.5

    this.stage.backgroundColor = '#182d3b'
    this.stage.disableVisibilityChange = true
    Game = require('src/client/Game')

    this.status = STATUS.NOT_READY
  }

  update() {
    this.updatePlayerListText()
  }

  statusTextOnClick() {
    if (this.status === STATUS.NOT_READY) {
      this.status = STATUS.READY
      this.statusText.text = 'Waiting for other players'
      Socket.setStatus(STATUS.READY)
    } else if (this.statusText.text === 'Click here to start') {
      this.socket = Socket.getSocket()
      this.socket.emit(SOCKET.START_GAME)
      this.game.state.start('GameState', true, false)
    }
  }

  updatePlayerListText() {
    const list = Game.listPlayers()
    if (list.length === 0) return

    let isReadyToStart = true
    const str = list.reduce((text, player) => {
      if (player.status !== STATUS.READY) {
        isReadyToStart = false
      }
      text += `${player.name} - ${player.status}\n`
      return text
    }, 'Player List\n---------------\n')
    this.playerListText.text = str

    if (isReadyToStart) {
      this.statusText.text = 'Click here to start'
    } else {
      if (this.status === STATUS.READY) {
        this.statusText.text = 'Waiting for other players'
      } else if (this.status === STATUS.NOT_READY) {
        this.statusText.text = 'Click here when ready'
      }
    }
  }
}
