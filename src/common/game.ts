import { Board } from './board';

interface Player {
  userId: string;
}

export class Game {
  players: { [userId: string]: Player } = {};
  boards: { [userId: string]: Board } = {};
  pieces = [];
  currentPiece = {};
  nextPiece = {};
  linesCleared = {};
  totalPieces = {};
  score = {};
  paused = true;

  constructor() {}

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

  addPlayer(player: Player) {
    if (!this.players[player.userId]) {
      this.players[player.userId] = player;
      this.boards[player.userId] = new Board();
    }
  }

  removePlayer(userId) {
    delete this.players[userId];
    delete this.boards[userId];
  }

  getPlayer(userId): Player {
    return this.players[userId];
  }

  listPlayers(): Player[] {
    return Object.values(this.players);
  }

  update() {
    if (!this.paused) {
      // Check inputs

      for (const userId of Object.keys(this.players)) {
        const board = this.boards[userId];
        if (!board.currentPiece) return;

        if (!board.currentPiece.shiftDownOnBoard(board)) {
          const linesToBeCleared = board.getLinesToBeClearedBy(board.currentPiece);
          board.addPiece(board.currentPiece);
          if (linesToBeCleared.length > 0) {
            board.clearLines();
          }
        }

        // if (!board.spawnNextPiece()) {
        //   // Game over
        //   this.paused = true;
        //   return;
        // }
      }
    }
  }

  // canUpdateCurrentPiece(id, direction) {
  //   if (this.currentPiece[id]) {
  //     let deltaRow = 0;
  //     let deltaCol = 0;
  //     if (direction === 'down') deltaRow = 1;
  //     if (direction === 'left') deltaCol = -1;
  //     if (direction === 'right') deltaCol = 1;

  //     const pos = this.currentPiece[id].pos;
  //     if (this.validDelta(id, deltaRow, deltaCol, pos)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // updateCurrentPiece(id, direction) {
  //   if (this.currentPiece[id]) {
  //     let deltaRow = 0;
  //     let deltaCol = 0;
  //     if (direction === 'down') deltaRow = 1;
  //     if (direction === 'left') deltaCol = -1;
  //     if (direction === 'right') deltaCol = 1;

  //     if (['down', 'left', 'right'].indexOf(direction) !== -1) {
  //       const pos = this.currentPiece[id].pos;
  //       for (const pair of pos) {
  //         this.boards[id][pair.row][pair.col] = ' ';
  //       }
  //       this.currentPiece[id].pos = pos.map((p) => {
  //         return { row: p.row + deltaRow, col: p.col + deltaCol };
  //       });
  //       this.currentPiece[id].center.row += deltaRow;
  //       this.currentPiece[id].center.col += deltaCol;
  //       for (const pair of this.currentPiece[id].pos) {
  //         this.boards[id][pair.row][pair.col] = this.currentPiece[id].name;
  //       }
  //     } else if (direction === 'rotate') {
  //       // TODO implement rotation
  //     }
  //   }
  // }

  // validDelta(id, deltaRow, deltaCol, pos) {
  //   let isValid = true;
  //   for (const pair of pos) {
  //     const row = pair.row + deltaRow;
  //     const col = pair.col + deltaCol;
  //     // Check if next pos is valid or it is part of self
  //     isValid = isValid && this.validSpace(id, row, col, pos);
  //     if (!isValid) return isValid;
  //   }
  //   return isValid;
  // }

  // validSpace(id, row, col, pos) {
  //   return (
  //     row >= 0 &&
  //     row < this.boardHeight &&
  //     col >= 0 &&
  //     col < this.boardWidth &&
  //     (this.boards[id][row][col] === ' ' ||
  //       pos.findIndex((p) => row === p.row && col === p.col) !== -1)
  //   );
  // }

  // canSpawnNewPiece(id) {
  //   let canSpawn = true;
  //   const width = this.nextPiece[id].data.length;
  //   for (let row = 0; row < width; row++) {
  //     const height = this.nextPiece[id].data[row].length;
  //     for (let col = 0; col < height; col++) {
  //       if (this.nextPiece[id].data[row][col] !== ' ') {
  //         const colOffset = Math.round(this.boardWidth / 2) - Math.round(width / 2);
  //         canSpawn = canSpawn && this.boards[id][row][col + colOffset] === ' ';
  //       }
  //     }
  //   }
  //   return canSpawn;
  // }

  // spawnNewPiece(id) {
  //   this.currentPiece[id] = this.nextPiece[id];
  //   const width = this.currentPiece[id].data.length;
  //   let rowOffset = 0;
  //   for (let row = 0; row < width; row++) {
  //     let isPlaced = false;
  //     const height = this.currentPiece[id].data[row].length;

  //     for (let col = 0; col < height; col++) {
  //       if (this.currentPiece[id].data[row][col] !== ' ') {
  //         isPlaced = true;
  //         // Place new piece on board
  //         const colOffset = Math.round(this.boardWidth / 2) - Math.round(width / 2);
  //         const newCol = col + colOffset;
  //         const newRow = row + rowOffset;
  //         this.boards[id][newRow][newCol] = this.currentPiece[id].name;
  //         // Store piece position
  //         this.currentPiece[id].pos.push({ row: newRow, col: newCol });
  //         const half = Math.floor(this.currentPiece[id].center / 2);
  //         if (newRow === half && newCol === half) {
  //           this.currentPiece[id].center = { row: newRow, col: newCol };
  //         }
  //       }
  //     }
  //     // Try to place piece at highest point of the board
  //     if (!isPlaced) {
  //       rowOffset--;
  //     }
  //   }
  //   this.totalPieces[id]++;
  // }

  calculateScore(id) {
    this.score[id] = this.totalPieces[id] * 100 + this.linesCleared[id] * 1000;
  }
}
