/* global Phaser */
// const SOCKET = CONSTANTS.SOCKET
const Socket = require('src/client/Socket')
let Game = null
const Constants = require('src/core/Constants')
const Pieces = require('src/core/Pieces')
const STATUS = Constants.STATUS

module.exports = class GameState extends Phaser.State {
  create() {
    Game = require('src/client/Game')

    const textStyle = {
      font: '24px Arial',
      fill: '#fff',
      align: 'center'
    }

    this.quitText = this.game.add.text(0, 0, 'Quit', textStyle)
    this.quitText.inputEnabled = true
    this.quitText.events.onInputUp.add(this.quitTextOnClick, this)

    this.game.time.advancedTiming = true
    this.game.time.slowMotion = 1.0
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE

    this.stage.backgroundColor = '#182d3b'
    this.stage.disableVisibilityChange = true

    this.graphics = this.game.add.graphics(0, 0)
    this.game.time.events.loop(Phaser.Timer.SECOND / 1, this.tick, Game)
    this.cursors = this.game.input.keyboard.createCursorKeys()
    this.scoreText = this.game.add.text(120, 10, 'Score: ' + this.score, { fontSize: '30px', fill: '#fff' })

    this.boardHeight = Game.boardHeight
    this.boardWidth = Game.boardWidth
    this.types = Pieces.TYPES
    this.isCursorDown = false
    // TODO take care of Singleplayer games
    // if (Game.mode === 'Singleplayer') {
    //   Socket.socket.disconnect()
    // }
    for (const player of Game.listPlayers()) {
      Game.initBoard(player.id)
    }
  }

  render() {
    this.game.debug.text(this.game.time.fps, this.game.width - 20, 14, '#00ff00')
  }

  update() {
    this.graphics.clear()

    this.drawBoard({
      graphics: this.graphics,
      x: 50,
      y: 50,
      scale: 1,
      blockSize: 30,
      board: Game.boards[Socket.id],
      nextPiece: Game.nextPiece[Socket.id],
    })

    // Count number of other players
    let count = 0
    for (const player of Game.listPlayers()) {
      if (player.id === Socket.id || player.status !== STATUS.PLAYING) {
        continue
      }
      const x = 550 + (200 * (count % 2))
      const y = 50 + (250 * Math.floor(count / 2))
      this.drawBoard({
        graphics: this.graphics,
        x: x,
        y: y,
        scale: 0.5,
        blockSize: 10,
        board: Game.boards[player.id],
        nextPiece: Game.nextPiece[player.id],
      })
      count++
    }

    this.scoreText.setText('Score: ' + Game.score[Socket.id])

    let action = null
    if (this.isCursorDown === false) {
      if (this.cursors.up.isDown) {
        action = 'rotate'
      } else if (this.cursors.down.isDown) {
        action = 'down'
      } else if (!this.cursors.left.downDuration(50) && this.cursors.left.isDown) {
        action = 'left'
      } else if (!this.cursors.right.downDuration(50) && this.cursors.right.isDown) {
        action = 'right'
      }
    } else {
      this.isCursorDown = false
    }
    if (action !== null && Game.canUpdateCurrentPiece(Socket.id, action)) {
      Socket.sendAction(action)
      Game.updateCurrentPiece(Socket.id, action)
      this.isCursorDown = true
    }
  }

  tick() {
    for (const player of Game.listPlayers()) {
      if (player.status === STATUS.PLAYING) {
        Game.updateBoard(player.id)
      }
    }
  }

  drawBoard({ graphics, x, y, scale, blockSize, board, nextPiece }) {
    const width = (blockSize * (this.boardWidth + 5))
    const height = (blockSize * (this.boardHeight + 1))

    // Background
    graphics.beginFill(0xffffff)
    graphics.drawRoundedRect(x, y, width, height, 9)
    graphics.endFill()
    graphics.beginFill(0x000000)
    graphics.drawRoundedRect(x + 2, y + 2, width - 4, height - 4, 9)
    graphics.endFill()
    // this.drawRoundedRect(graphics, x, y, width * scale, height * scale, 0x191919)
    // this.drawRoundedRect(graphics, x + 4, y + 4, (width - 6) * scale, (height - 6) * scale, 0xffffff, false)
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        const deltaX = x + 10, deltaY = y + 10
        const posX = col * blockSize + deltaX
        const posY = row * blockSize + deltaY
        if (board[row][col] === ' ') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 'blank', scale, blockSize })
        } else if (board[row][col] === 'j') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 'j', scale, blockSize })
        } else if (board[row][col] === 'l') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 'l', scale, blockSize })
        } else if (board[row][col] === 'z') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 'z', scale, blockSize })
        } else if (board[row][col] === 's') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 's', scale, blockSize })
        } else if (board[row][col] === 't') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 't', scale, blockSize })
        } else if (board[row][col] === 'o') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 'o', scale, blockSize })
        } else if (board[row][col] === 'i') {
          this.drawSquare({ graphics, x: posX, y: posY, type: 'i', scale, blockSize })
        }
      }
    }
    // Next piece
    const maxRow = nextPiece.data.length
    for (let row = 0; row < maxRow; row++) {
      const maxCol = nextPiece.data[row].length
      for (let col = 0; col < maxCol; col++) {
        if (nextPiece.data[row][col] !== ' ') {
          const posX = (col + 11) * blockSize + x
          const posY = (row + 1) * blockSize + y
          this.drawSquare({ graphics, x: posX, y: posY, type: nextPiece.name, scale, blockSize })
        }
      }
    }
  }

  drawRoundedRect(graphics, x, y, width, height, color, fill = true) {
    const curve = 10
    if (fill) {
      graphics.lineStyle(0)
    } else {
      graphics.lineStyle(1, color)
    }
    if (fill) graphics.beginFill(color)
    graphics.moveTo(x, y + curve)
    graphics.bezierCurveTo(x, y + curve, x, y, x + curve, y)
    graphics.lineTo(x + width - curve, y)
    graphics.bezierCurveTo(x + width - curve, y, x + width, y, x + width, y + curve)
    graphics.lineTo(x + width, y + height - curve)
    graphics.bezierCurveTo(x + width, y + height - curve, x + width, y + height, x + width - curve, y + height)
    graphics.lineTo(x + curve, y + height)
    graphics.bezierCurveTo(x + curve, y + height, x, y + height, x, y + height - curve)
    graphics.lineTo(x, y + curve)
    if (fill) graphics.endFill()
  }

  drawSquare({ graphics, x, y, type, scale, blockSize }) {
    const primaryColor = this.types[type].primaryColor
    const lighterColor = this.types[type].lighterColor
    const darkerColor = this.types[type].darkerColor

    const lineWidth = 2 * scale
    const halfLineWidth = lineWidth / 2
    const centerMargin = 5 * scale

    // Border + square
    graphics.beginFill(0xcc)
    if (type === 'blank') {graphics.lineStyle(lineWidth, primaryColor)} else {graphics.lineStyle(lineWidth, 0x0)}
    graphics.drawRect(x + halfLineWidth, y + halfLineWidth, blockSize - lineWidth, blockSize - lineWidth)
    graphics.endFill()

    // Top right
    graphics.beginFill(lighterColor)
    graphics.lineStyle(0, 0x0)
    graphics.moveTo(x + lineWidth, y + lineWidth)
    graphics.lineTo(x + blockSize - lineWidth, y + lineWidth)
    graphics.lineTo(x + blockSize - lineWidth, y + blockSize - lineWidth)
    graphics.lineTo(x + lineWidth, y + lineWidth)
    graphics.endFill()

    // Bottom left
    graphics.beginFill(darkerColor)
    graphics.lineStyle(0, 0x0)
    graphics.moveTo(x + lineWidth, y + lineWidth)
    graphics.lineTo(x + blockSize - lineWidth, y + blockSize - lineWidth)
    graphics.lineTo(x + lineWidth, y + blockSize - lineWidth)
    graphics.lineTo(x + lineWidth, y + lineWidth)
    graphics.endFill()

    // Center
    graphics.beginFill(primaryColor)
    graphics.drawRect(x + centerMargin, y + centerMargin, blockSize - (centerMargin * 2), blockSize - (centerMargin * 2))
    graphics.endFill()

    if (type === 'blank') {
      graphics.beginFill(0xffffff, 0.05)
      graphics.drawRect(x, y, blockSize, blockSize / 2)
      graphics.endFill()
    }
  }

  quitTextOnClick() {
    if (Game.mode === 'Singleplayer') {
      this.game.state.start('MenuState', true, false)
    } else {
      Socket.setStatus(STATUS.NOT_READY)
      this.game.state.start('MenuState', true, false)
    }
  }
}
