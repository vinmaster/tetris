import { Utility } from '../../common/utility';
import { CONSTANTS } from '../../common/constants';
import { GameServer } from '../game/game-server';
import { Chat } from './chat';
import { User } from '@/common/user';

export class WebSocketServer {
  static io: SocketIO.Server;
  static sockets: { [id: string]: User } = {};
  static gameServer: GameServer;
  static chat: Chat;

  static setup(io: SocketIO.Server, gameServer: GameServer) {
    this.io = io;
    this.io.on('connection', this.onConnection.bind(this));
    this.gameServer = gameServer;
    this.chat = new Chat();
  }

  static onConnection(socket: SocketIO.Socket) {
    // const obj = Utility.getObjectSlice(socket, ['id']);
    // console.log('connected', obj);

    socket.on('disconnect', () => {
      if (!this.sockets[socket.id]) return;
      const userId = this.sockets[socket.id].userId;
      const username = this.sockets[socket.id].username;

      delete this.sockets[socket.id];
      this.gameServer.removeUser(userId);

      this.broadcastAll(CONSTANTS.CHAT.MESSAGE, {
        username: 'SYSTEM',
        text: `${username} has disconnected`,
        timestamp: +new Date(),
      });
      this.broadcastAll(CONSTANTS.SOCKET.REMOVE_USER, userId, socket);
    });

    // Chat module
    socket.on(CONSTANTS.CHAT.MESSAGE, (message: string) => {
      if (!message) return;

      this.chat.processMessage(socket, message);
    });

    socket.on(CONSTANTS.SOCKET.LIST_USERS, () => {
      this.broadcastUsers();
    });

    // Game
    socket.on(CONSTANTS.SOCKET.REGISTER, (username: string) => {
      let user = this.sockets[socket.id];
      // Check if already registered
      if (!user) {
        let userObj = {
          username,
        } as User;
        user = this.gameServer.addUser(userObj);
        this.sockets[socket.id] = user;
        socket.join('chatroom');
      }

      this.broadcastTo(CONSTANTS.SOCKET.REGISTERED, user, socket);
      this.broadcastAll(CONSTANTS.SOCKET.ADD_USER, user, socket);
      this.broadcastAll(CONSTANTS.SOCKET.UPDATE_PIECES, this.gameServer.pieceHistory);
      this.broadcastTo(CONSTANTS.SOCKET.UPDATE_GAME_STATE, this.gameServer.gameState, socket);
    });

    socket.on(CONSTANTS.SOCKET.UPDATE_BOARDS, () => {
      this.broadcastAll(CONSTANTS.SOCKET.UPDATE_BOARDS, this.gameServer.boards);
    });

    socket.on(CONSTANTS.SOCKET.UPDATE_SINGLE_BOARD, (data) => {
      this.broadcastAll(CONSTANTS.SOCKET.UPDATE_SINGLE_BOARD, data);
    });

    socket.on(CONSTANTS.SOCKET.USER_STATE_CHANGE, (state) => {
      const user = this.sockets[socket.id];
      this.gameServer.updateState(user.userId, state);

      this.broadcastAll(CONSTANTS.SOCKET.USER_STATE_CHANGE, user);
    });
  }

  static broadcastAll(event: string, data?: any, except?: SocketIO.Socket) {
    if (except !== undefined) {
      if (data) {
        except.broadcast.emit(event, data);
      } else {
        except.broadcast.emit(event);
      }
    } else {
      this.io.emit(event, data);
    }
  }

  static broadcastRoom(room: string, event: string, data: any, except?: SocketIO.Socket) {
    if (except !== undefined) {
      except.to(room).emit(event, data);
    } else {
      this.io.to(room).emit(event, data);
    }
  }

  static broadcastTo(event: string, data: any, target: SocketIO.Socket) {
    // this.io.to(target.id).emit(event, data);
    target.emit(event, data);
  }

  static broadcastToSocketId(event: string, data: any, socketId: string) {
    this.broadcastRoom(socketId, event, data);
  }

  static broadcastUsers() {
    let output;
    for (const socketId of Object.keys(this.sockets)) {
      if (this.isAdmin(socketId)) {
        output = Object.values(this.sockets);
      } else {
        output = Object.values(this.sockets).map((u) =>
          Utility.getObjectSlice(u, ['userId', 'role', 'username', 'usernameColor'])
        );
      }

      this.broadcastToSocketId('LIST_USERS', output, socketId);
    }
  }

  static isAdmin(id: string) {
    const room = this.getRoom('admins');
    if (!room) return false;
    const adminIds = Object.keys(room.sockets);
    return adminIds.includes(id);
  }

  // Can return undefined if room is empty
  static getRoom(roomName: string): SocketIO.Room | undefined {
    return this.io.sockets.adapter.rooms[roomName];
  }

  static isInRoom(roomName: string, id: string) {
    const room = this.getRoom(roomName);
    if (!room) return false;
    return room.sockets[id];
  }

  static listSockets() {
    if (!this.io) {
      console.log('this.io is not set');
    }
    return this.io.sockets.connected;
  }

  static listSocketIds() {
    return Object.keys(this.listSockets());
  }
}
