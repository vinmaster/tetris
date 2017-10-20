const Game = require('src/client/Game')
const Chat = require('src/client/Chat')
const Socket = require('src/client/Socket')

function clientReady() {
  Socket.setup()
  Chat.setup()
  Game.setup()
}
document.addEventListener('DOMContentLoaded', clientReady, false)
