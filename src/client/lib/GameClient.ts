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

    EventBus.$on('STATE_CHANGE', (state) => {
      this.socket.client.emit(CONSTANTS.SOCKET.STATE_CHANGE, state);
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
    if (this.secondsPassed + this.lastUpdate > 3) {
      this.update();
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
    console.log('key', keyCode);

    const [UP, DOWN, LEFT, RIGHT, X] = [38, 40, 37, 39, 88];

    if ([UP, X].includes(keyCode)) {
      // const turned = this.current.rotateOnBoard(90, this.board);
      event.preventDefault();
    } else if (keyCode === DOWN) {
      // this.current.shiftDownOnBoard(this.board);
      event.preventDefault();
    } else if (keyCode === LEFT) {
      event.preventDefault();
    } else if (keyCode === RIGHT) {
      event.preventDefault();
    }
    return false;
  }

  get socketListeners() {
    let that = this;
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
        that.currentUser = user;
        that.addUser(user);
        console.log('Registered', user);
        that.currentUser = user;
        //         that.boards[user.userId].grid = that.boards[user.userId].getGridFromString(
        //           ` .  .
        // OO ZZ  SS
        // OO  ZZSS
        // I ...
        // I  L. J  T
        // I .L. J TT
        // I  LLJJ..T`,
        //           false
        //         );
        that.socket.client.emit(CONSTANTS.SOCKET.UPDATE_BOARDS);
      },
      ADD_USER(user) {
        that.addUser(user);
        that.socket.client.emit(CONSTANTS.SOCKET.UPDATE_BOARDS);
      },
      REMOVE_USER(userId) {
        that.removeUser(userId);
      },
      READY(data) {
        console.log('READY', data);
      },
      UPDATE_BOARDS(boards) {
        EventBus.$emit('UPDATE_BOARDS', boards);
      },
      UPDATE_PIECES(pieceHistory) {
        that.pieceHistory = pieceHistory;
      },
      UPDATE_GAME_STATE(state) {
        that.updateGameState(state);
        EventBus.$emit('UPDATE_GAME_STATE', state);
      },
      STATE_CHANGE(user) {
        that.users[user.userId].state = user.state;
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
