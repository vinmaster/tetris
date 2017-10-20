/* eslint-env mocha */

const chai = require('chai')
const io = require('socket.io-client')
const Constants = require(process.cwd() + '/src/core/Constants')
const CHAT = Constants.CHAT
const SOCKET = Constants.SOCKET
const STATUS = Constants.STATUS
const app = require(process.cwd() + '/src/server')
// const Socket = require(process.cwd() + '/src/server/Socket')
const Game = require(process.cwd() + '/src/server/Game')
const expect = chai.expect

describe('Socket', () => {
  const socketUrl = 'http://localhost:8000'
  const socketOptions = {
    transports: ['websocket'],
    'force new connection': true
  }
  let socket
  let server

  const onPromise = (socket, event) => {
    return new Promise(function(resolve, reject) {
      socket.on(event, (data) => resolve(data))
    })
  }

  beforeEach((done) => {
    server = app.server
    socket = io.connect(socketUrl, socketOptions)
    onPromise(socket, 'connect').then(() => done())
    socket.on('disconnect', () => {
    })
  })
  afterEach(() => {
    if (socket.connected) {
      socket.disconnect()
    }
  })
  after(() => {
    server.close(() => {
      // process.exit()
    })
  })

  it('should register player once', (done) => {
    socket.on(CHAT.NEW_MSG, (data) => {
      expect(data.msg).be.lengthOf(1)
      expect(Object.keys(Game.players).length).eq(1)
      done()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name' })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name' })
    socket.emit(CHAT.NEW_MSG, { msg: '/listplayers' })
  })

  it('should remove player', (done) => {
    const socket2 = io.connect(socketUrl, socketOptions)
    socket.on(SOCKET.PLAYER_LEFT, (data) => {
      expect(Object.keys(Game.players).length).eq(1)
      socket2.disconnect()
      done()
    })
    socket2.on(SOCKET.PLAYER_REGISTER, (data) => {
      socket2.disconnect()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name 1' })
    socket2.emit(SOCKET.PLAYER_REGISTER, { name: 'test name 2' })
  })

  it('should allow player to get ready', (done) => {
    socket.on(STATUS.READY, (data) => {
      expect(data.name).eq('test name')
      expect(data.status).eq(STATUS.READY)
      done()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name' })
    socket.emit(STATUS.READY)
  })

  it('should allow player to get not ready', (done) => {
    socket.on(STATUS.NOT_READY, (data) => {
      expect(data.name).eq('test name')
      expect(data.status).eq(STATUS.NOT_READY)
      done()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name' })
    socket.emit(STATUS.NOT_READY)
  })

  it('should not start game if just one player is not ready', (done) => {
    socket.on(SOCKET.START_GAME, (data) => {
      expect(data.status).eq(STATUS.NOT_READY)
      done()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name' })
    socket.emit(STATUS.NOT_READY)
    socket.emit(SOCKET.START_GAME)
  })

  it('should not start game if everyone is not ready', (done) => {
    const socket2 = io.connect(socketUrl, socketOptions)
    socket2.on(SOCKET.START_GAME, (data) => {
      expect(data.status).eq(STATUS.NOT_READY)
      socket2.disconnect()
      done()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name 1' })
    socket2.emit(SOCKET.PLAYER_REGISTER, { name: 'test name 2' })
    socket.emit(STATUS.READY)
    socket2.on(STATUS.NOT_READY, () => socket.emit(SOCKET.START_GAME))
    socket2.emit(STATUS.NOT_READY)
  })

  it('should start game if everyone is ready', (done) => {
    const socket2 = io.connect(socketUrl, socketOptions)
    socket2.on(SOCKET.START_GAME, (data) => {
      expect(data.status).eq(STATUS.READY)
      expect(data.players).not.eq(null)
      socket2.disconnect()
      done()
    })
    socket.emit(SOCKET.PLAYER_REGISTER, { name: 'test name 1' })
    socket2.emit(SOCKET.PLAYER_REGISTER, { name: 'test name 2' })
    socket.emit(STATUS.READY)
    socket2.on(STATUS.READY, () => socket.emit(SOCKET.START_GAME, 'from test'))
    socket2.emit(STATUS.READY)
  })
})

// function recursiveDisconnect(Clients, callback) {
//   Client = Clients.pop();
//   Client.on('disconnect',function() {
//     if(Clients.length > 0) recursiveDisconnect(Clients);
//     else {
//       callback();
//     }
//   });
//
//   Client.disconnect();
// }
//
// //In test
// recursiveDisconnect([client,client2,client3],done);
