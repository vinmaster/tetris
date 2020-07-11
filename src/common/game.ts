export class Game {
  boardHeight = 20;
  boardWidth = 10;
  players = {};
  boards = {};
  pieces = [];
  currentPiece = {};
  nextPiece = {};
  linesCleared = {};
  totalPieces = {};
  score = {};
  pause = true;

  teardown() {
    this.players = {};
    this.boards = {};
    this.pieces = [];
    this.currentPiece = {};
    this.nextPiece = {};
    this.linesCleared = {};
    this.totalPieces = {};
    this.score = {};
  }

  registerPlayer(player) {
    if (!this.players[player.id]) {
      this.players[player.id] = player;
    }
  }

  removePlayer(id) {
    delete this.players[id];
  }

  getPlayer(id) {
    return this.players[id];
  }

  listPlayers() {
    return Object.keys(this.players).map((key) => this.players[key]);
  }

  getName(id) {
    const player = this.players[id];
    if (player) {
      return player.name;
    } else {
      return null;
    }
  }

  dup(piece) {
    return JSON.parse(JSON.stringify(piece));
  }

  start() {}

  initBoard(id) {
    this.boards[id] = new Array();
    this.currentPiece[id] = null;
    this.linesCleared[id] = 0;
    this.totalPieces[id] = 0;
    this.score[id] = 0;
    this.nextPiece[id] = this.dup(this.pieces[this.totalPieces[id]]);
    for (let row = 0; row < this.boardHeight; row++) {
      this.boards[id][row] = new Array();
      for (let col = 0; col < this.boardWidth; col++) {
        this.boards[id][row][col] = ' ';
      }
    }
  }

  updateBoard(id) {
    if (!this.pause) {
      if (this.canUpdateCurrentPiece(id, 'down')) {
        this.updateCurrentPiece(id, 'down');
      } else {
        this.clearLines(id);
        if (this.canSpawnNewPiece(id)) {
          this.spawnNewPiece(id);
          this.nextPiece[id] = this.pieces[this.totalPieces[id]];
        } else {
          // Game over
          this.pause = true;
        }
        this.calculateScore(id);
      }
    }
  }

  clearLines(id) {
    for (let row = this.boardHeight - 1; row >= 0; row--) {
      let isFull = true;
      for (let col = 0; col < this.boardWidth; col++) {
        if (this.boards[id][row][col] === ' ') {
          isFull = false;
        }
      }
      // Clear line
      if (isFull) {
        for (let col = 0; col < this.boardWidth; col++) {
          this.boards[id][row][col] = ' ';
        }
        this.linesCleared[id]++;
      }
    }
    // Shift lines
    let shift = 0;
    for (let row = this.boardHeight - 1; row >= 0; row--) {
      let isEmpty = true;
      for (let col = 0; col < this.boardWidth; col++) {
        if (this.boards[id][row][col] !== ' ') {
          isEmpty = false;
        }
      }
      if (isEmpty) {
        shift++;
      }
      // Move it down
      for (let col = 0; col < this.boardWidth; col++) {
        if (row - shift >= 0) {
          this.boards[id][row][col] = this.boards[id][row - shift][col];
        }
      }
    }
  }

  canUpdateCurrentPiece(id, direction) {
    if (this.currentPiece[id]) {
      let deltaRow = 0;
      let deltaCol = 0;
      if (direction === 'down') deltaRow = 1;
      if (direction === 'left') deltaCol = -1;
      if (direction === 'right') deltaCol = 1;

      const pos = this.currentPiece[id].pos;
      if (this.validDelta(id, deltaRow, deltaCol, pos)) {
        return true;
      }
    }
    return false;
  }

  updateCurrentPiece(id, direction) {
    if (this.currentPiece[id]) {
      let deltaRow = 0;
      let deltaCol = 0;
      if (direction === 'down') deltaRow = 1;
      if (direction === 'left') deltaCol = -1;
      if (direction === 'right') deltaCol = 1;

      if (['down', 'left', 'right'].indexOf(direction) !== -1) {
        const pos = this.currentPiece[id].pos;
        for (const pair of pos) {
          this.boards[id][pair.row][pair.col] = ' ';
        }
        this.currentPiece[id].pos = pos.map((p) => {
          return { row: p.row + deltaRow, col: p.col + deltaCol };
        });
        this.currentPiece[id].center.row += deltaRow;
        this.currentPiece[id].center.col += deltaCol;
        for (const pair of this.currentPiece[id].pos) {
          this.boards[id][pair.row][pair.col] = this.currentPiece[id].name;
        }
      } else if (direction === 'rotate') {
        // TODO implement rotation
      }
    }
  }

  validDelta(id, deltaRow, deltaCol, pos) {
    let isValid = true;
    for (const pair of pos) {
      const row = pair.row + deltaRow;
      const col = pair.col + deltaCol;
      // Check if next pos is valid or it is part of self
      isValid = isValid && this.validSpace(id, row, col, pos);
      if (!isValid) return isValid;
    }
    return isValid;
  }

  validSpace(id, row, col, pos) {
    return (
      row >= 0 &&
      row < this.boardHeight &&
      col >= 0 &&
      col < this.boardWidth &&
      (this.boards[id][row][col] === ' ' ||
        pos.findIndex((p) => row === p.row && col === p.col) !== -1)
    );
  }

  canSpawnNewPiece(id) {
    let canSpawn = true;
    const width = this.nextPiece[id].data.length;
    for (let row = 0; row < width; row++) {
      const height = this.nextPiece[id].data[row].length;
      for (let col = 0; col < height; col++) {
        if (this.nextPiece[id].data[row][col] !== ' ') {
          const colOffset = Math.round(this.boardWidth / 2) - Math.round(width / 2);
          canSpawn = canSpawn && this.boards[id][row][col + colOffset] === ' ';
        }
      }
    }
    return canSpawn;
  }

  spawnNewPiece(id) {
    this.currentPiece[id] = this.nextPiece[id];
    const width = this.currentPiece[id].data.length;
    let rowOffset = 0;
    for (let row = 0; row < width; row++) {
      let isPlaced = false;
      const height = this.currentPiece[id].data[row].length;

      for (let col = 0; col < height; col++) {
        if (this.currentPiece[id].data[row][col] !== ' ') {
          isPlaced = true;
          // Place new piece on board
          const colOffset = Math.round(this.boardWidth / 2) - Math.round(width / 2);
          const newCol = col + colOffset;
          const newRow = row + rowOffset;
          this.boards[id][newRow][newCol] = this.currentPiece[id].name;
          // Store piece position
          this.currentPiece[id].pos.push({ row: newRow, col: newCol });
          const half = Math.floor(this.currentPiece[id].center / 2);
          if (newRow === half && newCol === half) {
            this.currentPiece[id].center = { row: newRow, col: newCol };
          }
        }
      }
      // Try to place piece at highest point of the board
      if (!isPlaced) {
        rowOffset--;
      }
    }
    this.totalPieces[id]++;
  }

  calculateScore(id) {
    this.score[id] = this.totalPieces[id] * 100 + this.linesCleared[id] * 1000;
  }
}
