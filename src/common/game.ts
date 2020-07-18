import { Board } from './board';
import { Piece } from './piece';
import { User } from './user';

export class Game {
  users: { [userId: string]: User } = {};
  boards: { [userId: string]: Board } = {};
  pieceHistory: string[] = [];
  gameState: 'WAITING' | 'START' | 'PAUSED' | 'GAME_OVER' = 'WAITING';
  // linesCleared = {};
  // totalPieces = {};
  // score = {};
  paused = true;

  teardown() {
    this.users = {};
    this.boards = {};
    this.pieceHistory = [];
    // this.linesCleared = {};
    // this.totalPieces = {};
    // this.score = {};
  }

  findUser(username): User | null {
    const user = Object.values(this.users).find((p) => p.username === username);
    if (user) return user;
    else return null;
  }

  addUser(user: User) {
    if (!this.users[user.userId]) {
      user.pieceIndex = -1;
      this.users[user.userId] = user;
      this.boards[user.userId] = new Board();
    }
  }

  removeUser(userId) {
    delete this.users[userId];
    delete this.boards[userId];
    if (Object.keys(this.users).length === 0) {
      this.gameState = 'WAITING';
    }
  }

  listUsers(): User[] {
    return Object.values(this.users);
  }

  getNewPieces(count: number): string[] {
    const newPieces: string[] = [];
    const types = Piece.getPieceTypes();
    for (let i = 0; i < count; i++) {
      const randIndex = Math.floor(Math.random() * 6);
      newPieces.push(types[randIndex]);
    }
    return newPieces;
  }

  resetGame() {
    this.pieceHistory = this.getNewPieces(10);
    for (const p of this.listUsers()) {
      p.pieceIndex = 0;
    }
  }

  getNextPiece(userId) {
    this.users[userId].pieceIndex += 1;
    return new Piece(this.pieceHistory[this.users[userId].pieceIndex]);
  }

  swapHold(userId: string) {
    if (!userId) return;
    const board = this.boards[userId];
    if (board.holdPiece) {
      const temp = board.currentPiece;
      board.currentPiece = board.holdPiece;
      board.holdPiece = temp;
    } else {
      board.holdPiece = board.currentPiece;
      board.currentPiece = this.getNextPiece(userId);
    }
    board.currentPiece.row = 0;
  }

  update() {
    if (this.gameState !== 'START') return;

    for (const userId of Object.keys(this.users)) {
      const board = this.boards[userId];
      // console.log('current', board.currentPiece);
      if (!board.currentPiece) board.currentPiece = this.getNextPiece(userId);

      if (!board.currentPiece.shiftDownOnBoard(board)) {
        const linesToBeCleared = board.getLinesToBeClearedBy(board.currentPiece);
        if (linesToBeCleared.length > 0) {
          board.addPiece(board.currentPiece);
          board.clearLines();
        } else {
          board.addPiece(board.currentPiece);
        }
        board.currentPiece = this.getNextPiece(userId);
        // Check gameover
        if (!board.currentPiece.isValidMoveOnBoard(0, 1, board.currentPiece.data, board)) {
          console.log('game over');
          this.gameState = 'GAME_OVER';
        }
      }

      // Check if should spawn more pieces
      if (this.pieceHistory.length - this.users[userId].pieceIndex < 10) {
        this.pieceHistory = this.pieceHistory.concat(this.getNewPieces(10));
      }
      // if (!board.spawnNextPiece()) {
      //   // Game over
      //   this.paused = true;
      //   return;
      // }
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

  // calculateScore(id) {
  //   this.score[id] = this.totalPieces[id] * 100 + this.linesCleared[id] * 1000;
  // }
}
