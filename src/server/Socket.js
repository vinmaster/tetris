const Constants = require(process.cwd() + '/src/core/Constants')
const Pieces = require(process.cwd() + '/src/core/Pieces')
const CHAT = Constants.CHAT
const SOCKET = Constants.SOCKET
const STATUS = Constants.STATUS
const Logger = require(process.cwd() + '/src/server/Logger')
const Game = require(process.cwd() + '/src/server/Game')

module.exports = class Sockets {
  static setup(io) {
    if (!io) {
      throw 'IO required for Socket setup'
    }
    this.io = io
    this.io.on('connection', this.connectionCallback.bind(this))
    this.pieces = []
    for (let i = 0; i < 100; i++) {
      this.pieces.push(Pieces.spawnPiece())
    }
  }

  static connectionCallback(socket) {
    socket.on('disconnect', (data) => {
      const name = Game.getName(socket.id)
      Logger.log('disconnect', name)
      Game.removePlayer(socket.id)
      this.io.emit(SOCKET.PLAYER_LEFT, { id: socket.id, name })
    })

    socket.on(CHAT.NEW_MSG, (data) => {
      // const key = Object.keys(io.sockets)[0]
      // this.io.to(socket.id).emit(CHAT_NEW_MSG, { name: 'Test', msg: 'Private msg' })
      // socket.broadcast.emit(PLAYER_REGISTER, player)
      const { id, msg } = data
      switch (msg) {
        case '/listplayers':
          socket.emit(CHAT.NEW_MSG, { name: 'Server', msg: Game.listPlayers() })
          this.io.to('debug').emit(CHAT.NEW_MSG, { name: 'Server', msg: `${Game.getName(id)} used /listplayers` })
          break
        case '/listdebug':
          socket.emit(CHAT.NEW_MSG, { name: 'Server', msg: this.io.sockets.adapter.rooms['debug'].sockets })
          break
        default:
          this.io.emit(CHAT.NEW_MSG, Object.assign(data, { name: Game.getName(id) }))
      }
    })

    socket.on(SOCKET.PLAYER_REGISTER, (data) => {
      Logger.log(SOCKET.PLAYER_REGISTER, data.name)
      const player = {
        id: socket.id,
        name: data.name,
        status: STATUS.NOT_READY,
      }
      Game.registerPlayer(player)

      if (data.name === 'Admin') {
        socket.join('debug')
      }

      socket.emit(SOCKET.PLAYER_REGISTER, Game.players)
      this.io.emit(SOCKET.PLAYER_JOINED, player)
    })

    socket.on(STATUS.READY, (data) => {
      const player = Game.getPlayer(socket.id)
      if (player) {
        Logger.log(STATUS.READY, player.name)
        player.status = STATUS.READY
        // Gives pieces to clients start at 0
        this.io.emit(SOCKET.PIECES, { index: 0, pieces: this.pieces })
        this.io.emit(STATUS.READY, player)
      }
    })

    socket.on(STATUS.NOT_READY, (data) => {
      const player = Game.getPlayer(socket.id)
      if (player) {
        player.status = STATUS.NOT_READY
        this.io.emit(STATUS.NOT_READY, player)
      }
    })

    socket.on(SOCKET.START_GAME, (data) => {
      const finalStatus = Game.listPlayers().reduce((status, player) => {
        if (status !== STATUS.READY) {
          return status
        }
        return player.status
      }, STATUS.READY)
      if (finalStatus === STATUS.READY) {
        Logger.log(SOCKET.START_GAME, Game.getName(socket.id))
        for (const player of Game.listPlayers()) {
          player.status = STATUS.PLAYING
        }
        Game.start()
      }
      this.io.emit(SOCKET.START_GAME, { status: finalStatus, players: Game.players })
    })

    socket.on(SOCKET.PLAYER_ACTION, (action) => {
      Logger.log(SOCKET.PLAYER_ACTION, action)
      const player = Game.getPlayer(socket.id)
      this.io.emit(SOCKET.PLAYER_ACTION, { player, action })
    })
  }
}
