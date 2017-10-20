
class GameCore {
  static setup() {
    this.width = 10
    this.height = 10
    this.boardHeight = 20
    this.boardWidth = 10
    this.players = {}
    this.boards = {}
    this.pieces = []
    this.currentPiece = {}
    this.nextPiece = {}
    this.linesCleared = {}
    this.totalPieces = {}
    this.score = {}
  }

  static teardown() {
    this.players = {}
    this.boards = {}
    this.pieces = []
    this.currentPiece = {}
    this.nextPiece = {}
    this.linesCleared = {}
    this.totalPieces = {}
    this.score = {}
  }

  static registerPlayer(player) {
    if (!this.players[player.id]) {
      this.players[player.id] = player
    }
  }

  static removePlayer(id) {
    delete this.players[id]
  }

  static getPlayer(id) {
    return this.players[id]
  }

  static listPlayers() {
    return Object.keys(this.players).map((key) => this.players[key])
  }

  static getName(id) {
    const player = this.players[id]
    if (player) {
      return player.name
    } else {
      return null
    }
  }

  static dup(piece) {
    return JSON.parse(JSON.stringify(piece))
  }

  static start() {
  }

  static initBoard(id) {
    this.boards[id] = new Array()
    this.currentPiece[id] = null
    this.linesCleared[id] = 0
    this.totalPieces[id] = 0
    this.score[id] = 0
    this.nextPiece[id] = this.dup(this.pieces[this.totalPieces[id]])
    for (let row = 0; row < this.boardHeight; row++) {
      this.boards[id][row] = new Array()
      for (let col = 0; col < this.boardWidth; col++) {
        this.boards[id][row][col] = ' '
      }
    }
  }

  static updateBoard(id) {
    if (!this.pause) {
      if (this.canUpdateCurrentPiece(id, 'down')) {
        this.updateCurrentPiece(id, 'down')
      } else {
        this.clearLines(id)
        if (this.canSpawnNewPiece(id)) {
          this.spawnNewPiece(id)
          this.nextPiece[id] = this.pieces[this.totalPieces[id]]
        } else {
          // Game over
          this.pause = true
        }
        this.calculateScore(id)
      }
    }
  }

  static clearLines(id) {
    for (let row = this.boardHeight - 1; row >= 0; row--) {
      let isFull = true
      for (let col = 0; col < this.boardWidth; col++) {
        if (this.boards[id][row][col] === ' ') {isFull = false}
      }
      // Clear line
      if (isFull) {
        for (let col = 0; col < this.boardWidth; col++) {
          this.boards[id][row][col] = ' '
        }
        this.linesCleared[id]++
      }
    }
    // Shift lines
    let shift = 0
    for (let row = this.boardHeight - 1; row >= 0; row--) {
      let isEmpty = true
      for (let col = 0; col < this.boardWidth; col++) {
        if (this.boards[id][row][col] !== ' ') {
          isEmpty = false
        }
      }
      if (isEmpty) {shift++}
      // Move it down
      for (let col = 0; col < this.boardWidth; col++) {
        if (row - shift >= 0) {this.boards[id][row][col] = this.boards[id][row - shift][col]}
      }
    }
  }

  static canUpdateCurrentPiece(id, direction) {
    if (this.currentPiece[id]) {
      let deltaRow = 0
      let deltaCol = 0
      if (direction === 'down') deltaRow = 1
      if (direction === 'left') deltaCol = -1
      if (direction === 'right') deltaCol = 1

      const pos = this.currentPiece[id].pos
      if (this.validDelta(id, deltaRow, deltaCol, pos)) {
        return true
      }
    }
    return false
  }

  static updateCurrentPiece(id, direction) {
    if (this.currentPiece[id]) {
      let deltaRow = 0
      let deltaCol = 0
      if (direction === 'down') deltaRow = 1
      if (direction === 'left') deltaCol = -1
      if (direction === 'right') deltaCol = 1

      if (['down', 'left', 'right'].indexOf(direction) !== -1) {
        const pos = this.currentPiece[id].pos
        for (const pair of pos) {
          this.boards[id][pair.row][pair.col] = ' '
        }
        this.currentPiece[id].pos = pos.map((p) => {
          return { row: p.row + deltaRow, col: p.col + deltaCol }
        })
        this.currentPiece[id].center.row += deltaRow
        this.currentPiece[id].center.col += deltaCol
        for (const pair of this.currentPiece[id].pos) {
          this.boards[id][pair.row][pair.col] = this.currentPiece[id].name
        }
      } else if (direction === 'rotate') {
        // TODO implement rotation
      }
    }
  }

  static validDelta(id, deltaRow, deltaCol, pos) {
    let isValid = true
    for (const pair of pos) {
      const row = pair.row + deltaRow
      const col = pair.col + deltaCol
      // Check if next pos is valid or it is part of self
      isValid = isValid && this.validSpace(id, row, col, pos)
      if (!isValid) return isValid
    }
    return isValid
  }

  static validSpace(id, row, col, pos) {
    return row >= 0 && row < this.boardHeight &&
      col >= 0 && col < this.boardWidth &&
      (this.boards[id][row][col] === ' ' ||
      pos.findIndex((p) => row === p.row && col === p.col) !== -1)
  }

  static canSpawnNewPiece(id) {
    let canSpawn = true
    const width = this.nextPiece[id].data.length
    for (let row = 0; row < width; row++) {
      const height = this.nextPiece[id].data[row].length
      for (let col = 0; col < height; col++) {
        if (this.nextPiece[id].data[row][col] !== ' ') {
          const colOffset = Math.round(this.boardWidth / 2) - Math.round(width / 2)
          canSpawn = canSpawn && this.boards[id][row][col + colOffset] === ' '
        }
      }
    }
    return canSpawn
  }

  static spawnNewPiece(id) {
    this.currentPiece[id] = this.nextPiece[id]
    const width = this.currentPiece[id].data.length
    let rowOffset = 0
    for (let row = 0; row < width; row++) {
      let isPlaced = false
      const height = this.currentPiece[id].data[row].length

      for (let col = 0; col < height; col++) {
        if (this.currentPiece[id].data[row][col] !== ' ') {
          isPlaced = true
          // Place new piece on board
          const colOffset = Math.round(this.boardWidth / 2) - Math.round(width / 2)
          const newCol = col + colOffset
          const newRow = row + rowOffset
          this.boards[id][newRow][newCol] = this.currentPiece[id].name
          // Store piece position
          this.currentPiece[id].pos.push({ row: newRow, col: newCol})
          const half = Math.floor(this.currentPiece[id].center / 2)
          if (newRow === half && newCol === half) {
            this.currentPiece[id].center = { row: newRow, col: newCol }
          }
        }
      }
      // Try to place piece at highest point of the board
      if (!isPlaced) {
        rowOffset--
      }
    }
    this.totalPieces[id]++
  }

  static calculateScore(id) {
    this.score[id] = (this.totalPieces[id] * 100) + (this.linesCleared[id] * 1000)
  }
}

module.exports = GameCore
