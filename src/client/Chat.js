const Constants = require('src/core/Constants')
const CHAT = Constants.CHAT

const KEY = {
  ENTER: 13,
  UP: 38,
  DOWN: 40,
}

class Chat {
  static setup() {
    this.msgList = $('ul.msg-list')
    this.inputbox = $('.inputbox')
    this.sendButton = $('.send')
    this.history = []
    this.historyIndex = 0
    this.socket = require('src/client/Socket').getSocket()

    this.setInputEvents()
  }

  static setInputEvents() {
    this.inputbox.off('keydown').on('keydown', (e) => {
      switch (e.keyCode) {
        case KEY.ENTER:
          if (this.inputbox.val() === '') return
          this.send()
          break
        case KEY.UP:
          if (this.historyIndex === 0) {
            this.history.unshift(this.inputbox.val())
          }
          this.historyIndex++
          this.inputbox.val(this.history[this.historyIndex])
          break
        case KEY.DOWN:
          if (this.historyIndex > 0) {
            this.historyIndex--
            this.inputbox.val(this.history[this.historyIndex])
          }
          break
        default:
      }
    })

    this.sendButton.click((e) => {
      this.send()
    })
  }

  static send() {
    const data = { id: this.socket.id, msg: this.inputbox.val()}
    this.socket.emit(CHAT.NEW_MSG, data)
    this.history.unshift(this.inputbox.val())
    this.inputbox.val('')
  }

  static appendToChat(msg) {
    this.msgList.append('<li class="msg">' + msg + '</li>')
  }
}

module.exports = Chat
