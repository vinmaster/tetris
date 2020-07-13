import { Game } from '@/common/game';
import { EventBus } from './EventBus';

export class GameClient extends Game {
  ready = false;
  socket!: {
    client: SocketIOClient.Socket;
  };
  currentPlayer = null;
  secondsPassed;
  oldTimeStamp;
  fps;

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

    this.socket.client.emit('REGISTER', username);

    EventBus.$on('GET_BOARD', () => {
      const player = this.findPlayer(username);
      if (player) {
        const board = this.boards[player.userId];
        EventBus.$emit('LOAD_BOARD', board);
      }
    });

    // this.gameLoop(+new Date());
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
    // this.update();

    // The loop function has reached it's end. Keep requesting new frames
    window.requestAnimationFrame(this.gameLoop.bind(this));
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
      REGISTERED(user) {
        that.addPlayer(user);
        console.log('registered', user);
        that.currentPlayer = user;
        that.boards[user.userId].grid = that.boards[user.userId].getGridFromString(
          ` .  .     
OO ZZ  SS 
OO  ZZSS  
I ...     
I  L. J  T
I .L. J TT
I  LLJJ..T`,
          false
        );
        EventBus.$emit('LOAD_BOARD', that.boards[user.userId]);
      },
      READY(data) {
        console.log('READY', data);
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
