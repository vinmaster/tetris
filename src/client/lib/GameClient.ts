import { Game } from '@/common/game';
import { EventBus } from './EventBus';
import { CONSTANTS } from '@/common/constants';
import { User } from '@/common/user';

export class GameClient extends Game {
  ready = false;
  socket!: {
    client: SocketIOClient.Socket;
  };
  currentUser!: User;
  secondsPassed;
  oldTimeStamp = 0;
  fps;
  lastUpdate = 0;

  constructor() {
    super();
    window.addEventListener('keydown', this.onKeyEvents.bind(this), false);
  }

  setup() {
    let username = localStorage.getItem('username');
    if (!username) {
      username = prompt('Please enter a username:');
      if (username) localStorage.setItem('username', username);
    }

    this.socket.client.emit(CONSTANTS.SOCKET.REGISTER, username);

    EventBus.$on('GET_BOARD', () => {
      this.socket.client.emit(CONSTANTS.SOCKET.UPDATE_BOARDS);
    });

    EventBus.$on('BUS_STATE_CHANGE', (state) => {
      this.socket.client.emit(CONSTANTS.SOCKET.USER_STATE_CHANGE, state);
    });

    // EventBus.$on('NOT_READY', () => {
    //   this.socket.client.emit(CONSTANTS.STATES.NOT_READY);
    // });
  }

  teardown() {
    console.log('GameClient teardown');
    super.teardown();
    window.removeEventListener('keydown', this.onKeyEvents.bind(this), false);
    EventBus.$off();
  }

  gameLoop(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
    this.oldTimeStamp = timeStamp;

    // Calculate fps
    const newFps = Math.round(1 / this.secondsPassed);
    if (newFps !== this.fps) EventBus.$emit('FPS', newFps);
    this.fps = newFps;

    // Perform update
    const seconds = 0.5;
    if (this.secondsPassed + this.lastUpdate > seconds) {
      this.update();
      this.updateView();
      this.lastUpdate = 0;
    } else {
      this.lastUpdate += this.secondsPassed;
    }

    // The loop function has reached it's end. Keep requesting new frames
    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  updateGameState(state) {
    this.gameState = state;
    if (state === 'START') {
      this.gameLoop(0);
    }
  }

  updateView() {
    EventBus.$emit(CONSTANTS.SOCKET.UPDATE_GAME_STATE, this.gameState);
    EventBus.$emit('UPDATE_SINGLE_BOARD', {
      userId: this.currentUser.userId,
      board: this.boards[this.currentUser.userId],
    });
    this.socket.client.emit(CONSTANTS.SOCKET.UPDATE_SINGLE_BOARD, {
      userId: this.currentUser.userId,
      board: this.boards[this.currentUser.userId],
    });
  }

  // this.board.removePiece(this.current);

  //   this.board.addPiece(this.current);
  //   for (let row = 0; row < this.board.height; row++) {
  //     Vue.set(this.board.grid, row, this.board.grid[row]);
  //   }

  onKeyEvents(event: KeyboardEvent) {
    const { keyCode } = event;
    if (event.target && event.target['tagName'].toLowerCase() === 'input') {
      event.stopPropagation();
      return;
    }
    // console.log('key', keyCode);
    let updateView = false;

    const board = this.boards[this.currentUser.userId];
    if ([CONSTANTS.KEYCODES.X].includes(keyCode)) {
      board?.currentPiece?.rotateOnBoard(90, board);
      event.preventDefault();
      updateView = true;
    }
    if (keyCode === CONSTANTS.KEYCODES.DOWN) {
      board?.currentPiece?.shiftDownOnBoard(board);
      updateView = true;
      event.preventDefault();
    }

    if (keyCode === CONSTANTS.KEYCODES.LEFT) {
      board?.currentPiece?.shiftLeftRightOnBoard('left', board);
      updateView = true;
      event.preventDefault();
    } else if (keyCode === CONSTANTS.KEYCODES.RIGHT) {
      board.currentPiece?.shiftLeftRightOnBoard('right', board);
      updateView = true;
      event.preventDefault();
    }

    if ([CONSTANTS.KEYCODES.UP, CONSTANTS.KEYCODES.SPACE].includes(keyCode)) {
      board?.currentPiece?.hardDropOnBoard(board);
      updateView = true;
      event.preventDefault();
    }

    if ([CONSTANTS.KEYCODES.C].includes(keyCode)) {
      this.swapHold(this.currentUser.userId);
    }

    if (updateView) this.updateView();
    return false;
  }

  get socketListeners() {
    let THIS = this;
    return {
      connect() {
        console.log('[connected]');
      },
      disconnect() {
        console.log('[disconnected]');
        EventBus.$emit('DISCONNECT');
      },
      connect_error() {
        EventBus.$emit('CONNECT_ERROR');
      },

      // Chat
      LIST_USERS(users) {
        EventBus.$emit('LIST_USERS', users);
      },
      CHAT_MESSAGE(data) {
        EventBus.$emit('CHAT_MESSAGE', data);
      },

      // Game
      SET_USERNAME(username) {
        localStorage.setItem('username', username);
      },
      REGISTERED(user) {
        THIS.currentUser = user;
        THIS.addUser(user);
        THIS.users[user.userId].state = user.state;
        EventBus.$emit('UPDATE_USER_STATE', user);
        //         THIS.boards[user.userId].grid = THIS.boards[user.userId].getGridFromString(
        //           ` .  .
        // OO ZZ  SS
        // OO  ZZSS
        // I ...
        // I  L. J  T
        // I .L. J TT
        // I  LLJJ..T`,
        //           false
        //         );
        // THIS.socket.client.emit(CONSTANTS.SOCKET.UPDATE_BOARDS);
      },
      [CONSTANTS.SOCKET.ADD_USER](user) {
        THIS.addUser(user);
      },
      [CONSTANTS.SOCKET.REMOVE_USER](userId) {
        THIS.removeUser(userId);
        EventBus.$emit(CONSTANTS.SOCKET.REMOVE_USER, userId);
      },
      [CONSTANTS.STATES.READY](data) {
        console.log('READY', data);
      },
      [CONSTANTS.SOCKET.UPDATE_BOARDS](boards) {
        EventBus.$emit('UPDATE_BOARDS', boards);
      },
      [CONSTANTS.SOCKET.UPDATE_SINGLE_BOARD](data) {
        if (!data || !THIS.currentUser || data.userId === THIS.currentUser.userId) return;
        if (!THIS.currentUser) return;
        EventBus.$emit('UPDATE_SINGLE_BOARD', data);
      },
      [CONSTANTS.SOCKET.UPDATE_PIECES](pieceHistory) {
        THIS.pieceHistory = pieceHistory;
      },
      [CONSTANTS.SOCKET.UPDATE_GAME_STATE](state) {
        THIS.updateGameState(state);
        EventBus.$emit('UPDATE_GAME_STATE', state);
      },
      [CONSTANTS.SOCKET.USER_STATE_CHANGE](user) {
        console.log(user);
        if (!THIS.users[user.userId]) return;
        THIS.users[user.userId].state = user.state;
        EventBus.$emit('UPDATE_USER_STATE', user);
      },

      // Admins
      LOGS(data) {
        console.log('[LOGS]', data);
      },
      FORCE_REFRESH() {
        window.location.reload(true);
      },
    };
  }
}
