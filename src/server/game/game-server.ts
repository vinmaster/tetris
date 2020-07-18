import { Game } from '../../common/game';
import { WebSocketServer } from '../web-socket/web-socket-server';
import { Utility } from '../../common/utility';
import { CONSTANTS } from '../../common/constants';
import { User } from '@/common/user';

export class GameServer extends Game {
  constructor() {
    super();
    this.pieceHistory = this.pieceHistory.concat(this.getNewPieces(100));
  }

  addUser(user: User, broadcast = true) {
    user.userId = Utility.createUUID();
    super.addUser(user);

    user.role = 'User';
    user.state = this.gameState === 'WAITING' ? 'WAITING' : 'PLAYING';
    user.usernameColor = Utility.getRandomColor();
    this.validateAndSetUsername(user);

    if (broadcast) {
      WebSocketServer.broadcastAll(CONSTANTS.CHAT.MESSAGE, {
        username: 'SYSTEM',
        text: `${user.username} has connected`,
        timestamp: +new Date(),
      });
    }

    return user;
  }

  updateState(userId: string, state: any) {
    this.users[userId].state = state;
    if (this.gameState === 'WAITING') {
      // Check every board state
      const allReady = Object.values(this.users).every((u) => u.state === 'READY');
      if (allReady) {
        this.gameState = 'START';
        WebSocketServer.broadcastAll(CONSTANTS.SOCKET.UPDATE_PIECES, this.pieceHistory);
        WebSocketServer.broadcastAll(CONSTANTS.SOCKET.UPDATE_GAME_STATE, this.gameState);
      }
    }
  }

  validateAndSetUsername(user: User) {
    // No username or length 0
    if (!user.username) {
      user.username = 'User';
    }

    // Avoid conflict usernames
    let originalName = user.username;
    let checkName = user.username;
    let tries = 1;
    let maxTries = tries + 10;
    const usersArray = Object.values(this.users);
    while (
      tries < maxTries &&
      usersArray.find((u) => u && u.username === checkName && u.userId !== user.userId)
    ) {
      checkName = `${originalName}${tries + 1}`;
      tries += 1;
    }
    user.username = checkName;

    if (tries > maxTries) {
      user.username = 'PLEASE SET NAME';
    }
  }
}
