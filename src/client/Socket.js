/* global io */

const Constants = require('src/core/Constants')
const Chat = require('src/client/Chat')
let Game
const CHAT = Constants.CHAT
const SOCKET = Constants.SOCKET
const STATUS = Constants.STATUS
const CONNECT_SETTINGS = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 3
}

module.exports = class Socket {
  static setup() {
    this.id = null
    this.playerName = this.getName()
    this.socket = io.connect(CONNECT_SETTINGS)
    this.socket.on('connect', this.connectionCallback.bind(this))
    Game = require('src/client/Game')
  }

  static getSocket() { return this.socket }
  static getName() {
    let name = sessionStorage.getItem('name')

    if (name === null) {
      name = prompt("What's your name?")
      if (name === null) name = 'Anon'
      sessionStorage.setItem('name', name)
    }
    return name
  }

  static setStatus(status) {
    this.socket.emit(status)
  }

  static sendAction(action) {
    this.socket.emit(SOCKET.PLAYER_ACTION, action)
  }

  static connectionCallback() {
    this.id = this.socket.id
    Chat.appendToChat('** Connected To Server **')
    this.socket.emit(SOCKET.PLAYER_REGISTER, { name: this.playerName })

    this.socket.on('disconnect', (player) => {
      console.log('disconnect')
      Game.removePlayer(player.id)
      Chat.appendToChat('** Disconnected From Server **')
    })
    this.socket.on('reconnecting', (attempt) => {
      console.log('reconnecting attempt', attempt)
    })
    this.socket.on('reconnect', (attempt) => {
      console.log('reconnected after attempt', attempt)
      // Disconnect from old socket when connect is called again
      this.socket.disconnect()
      this.socket = io.connect(CONNECT_SETTINGS)
      this.socket.on('connect', this.connectionCallback.bind(this))
    })

    this.socket.on(CHAT.NEW_MSG, (data) => {
      console.log(CHAT.NEW_MSG, data)
      Chat.appendToChat(`${data.name}: ${JSON.stringify(data.msg)}`)
    })

    this.socket.on(SOCKET.PLAYER_REGISTER, (players) => {
      Game.players = players
    })

    this.socket.on(SOCKET.PLAYER_JOINED, (player) => {
      if (this.id !== player.id) {
        Game.registerPlayer(player)
      }
      Chat.appendToChat(`** ${player.name}: joined **`)
    })

    this.socket.on(SOCKET.PLAYER_LEFT, (player) => {
      delete Game.players[player.id]
      Chat.appendToChat(`** ${player.name}: left **`)
    })

    this.socket.on(STATUS.READY, (player) => {
      if (Game.players[player.id]) {
        Game.players[player.id] = player
      }
    })

    this.socket.on(STATUS.NOT_READY, (player) => {
      if (Game.players[player.id]) {
        Game.players[player.id] = player
      }
    })

    this.socket.on(SOCKET.START_GAME, ({ status, players }) => {
      if (status === STATUS.READY) {
        Game.game.state.start('GameState', true, false)
        Game.players = players
      }
    })

    this.socket.on(SOCKET.PLAYER_ACTION, ({ player, action }) => {
      if (player.id !== this.id) {
        Game.updateCurrentPiece(player.id, action)
      }
    })

    this.socket.on(SOCKET.PIECES, ({ index, pieces }) => {
      if (index === 0) {
        Game.pieces = pieces
      }
    })
  }
}
