import { Utility } from '../../common/utility';
import { CONSTANTS } from '../../common/constants';
import { GameServer } from '../game/game-server';

interface User {
  id: string;
  userId: string;
  username: string;
  usernameColor: string;
}

export class WebSocketServer {
  static io: SocketIO.Server;
  static users: { [id: string]: User | undefined } = {};
  static gameServer: GameServer;

  static setup(io: SocketIO.Server, gameServer: GameServer) {
    this.io = io;
    this.io.on('connection', this.onConnection.bind(this));
    this.gameServer = gameServer;
  }

  static onConnection(socket: SocketIO.Socket) {
    const obj = Utility.getObjectSlice(socket, ['rooms', 'connected', 'id']);
    // console.log('connected', obj);

    socket.on('disconnect', () => {
      this.removeUser(socket.id);

      this.broadcastUsers(socket);
    });

    socket.on(CONSTANTS.SOCKET.LIST_USERS, () => {
      this.broadcastUsers(socket);
    });

    socket.on(CONSTANTS.SOCKET.REGISTER, (username: string) => {
      obj['username'] = username;
      const user = this.addUser(obj);
      socket.join('chatroom');
      this.io.to(socket.id).emit('REGISTERED', user);
      socket.emit('ADD_USER', user);
    });

    socket.on(CONSTANTS.CHAT.MESSAGE, (message: string) => {
      if (!message) return;

      this.processMessage(socket, message);
    });
  }

  static processMessage(socket: SocketIO.Socket, message: string): any {
    let input: any = message.trim();
    let isCommand = true;
    const user = this.getUser(socket.id);
    if (!user) {
      this.sendError(socket, 'User not found');
      return;
    }
    let username = user.username;

    // Check if it is a command
    if (input.length <= 1 || input[0] !== '/') isCommand = false;

    if (!isCommand) {
      this.io.to('chatroom').emit(CONSTANTS.CHAT.MESSAGE, {
        username,
        text: input,
        timestamp: +new Date(),
      });
      return;
    }

    // Handle commands
    const argStr: string = input.substring(1, input.length).toLowerCase();
    const args = argStr.split(' ').filter((a) => a.length !== 0);
    const command = args[0];
    const timestamp = +new Date();
    let output = input;

    switch (command) {
      case 'time':
        output = new Date().toString();
        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'join':
        if (args[1] === 'admins') {
          socket.join('admins');
          output = 'You are now admin';

          this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.broadcastUsers(socket);
        } else {
          socket.join('chatroom');
          output = `${username} has joined the chatroom`;
          this.io.to('chatroom').emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: 'You have joined the chatroom',
            timestamp,
          });
        }
        break;
      case 'leave':
        if (args[1] === 'admins') {
          socket.leave('admins');
          output = 'You are now not admin';

          this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.broadcastUsers(socket);
        } else {
          socket.leave('chatroom');
          output = `${username} has left the chatroom`;
          this.io.to('chatroom').emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: 'You have left the chatroom',
            timestamp,
          });
        }
        break;
      case 'users':
        if (this.isAdmin(socket.id)) {
          output = this.users;
        } else {
          output = Object.assign(
            {},
            Object.values(this.users)
              .map((user) => (user ? user.username : null))
              .filter((u) => u)
          );
        }

        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'setusername': {
        const username = args.slice(1).join(' ');
        const user = this.getUser(socket.id);
        if (!user) {
          this.sendError(socket, 'User not found');
          return;
        }
        user.username = username;
        this.validateUsername(user);
        output = `Your username: ${user.username}`;
        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        this.broadcastUsers(socket);
        break;
      }
      case 'color':
        output = `Your username color: ${user.usernameColor}`;
        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'setcolor': {
        const color = args.slice(1).join(' ');
        if (color.length > 0) {
          user.usernameColor = color;
          this.broadcastUsers(socket);
          output = `Your username color: ${color}`;
        } else {
          output = 'Invalid color';
        }
        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      }
      case 'role':
        if (this.isAdmin(socket.id)) {
          output = 'Admin';
        } else {
          output = 'User';
        }

        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'forcerefresh':
        if (this.isAdmin(socket.id)) {
          this.io.emit('FORCE_REFRESH');
          output = 'Refreshing';
        } else {
          output = 'Invalid command';
          this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
        }
        break;
      case 'help':
        output = `
/time - Get time
/users - List the connected users
/setusername - Set new username
/color - Get username color
/setcolor - Set username color
/role - Check role
/join - Join chatroom
/leave - Leave chatroom
/help - List commands`;
        if (this.isAdmin(socket.id)) {
          output += `
/forcerefresh - Force refresh all client browsers
`;
        }
        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      default:
        output = 'Invalid command';
        this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
    }

    const log = {
      issuerId: socket.id,
      issuer: user.username,
      input,
      text: output,
      timestamp,
    };
    if (this.isAdmin(socket.id)) {
      // Show to other admins except sender
      socket.to('admins').emit('LOGS', log);
    } else {
      // Show admins commands that ran
      this.io.to('admins').emit('LOGS', log);
    }
  }

  static broadcastUsers(socket: SocketIO.Socket) {
    let output;
    if (this.isAdmin(socket.id)) {
      output = Object.values(this.users);
    } else {
      output = Object.values(this.users).map((u) => {
        if (!u) return {};
        else return Utility.getObjectSlice(u, ['username', 'usernameColor']);
      });
    }

    this.io.emit('LIST_USERS', output);
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

  static getUser(id: string) {
    return this.users[id];
  }

  static validateUsername(user: User) {
    // No username or length 0
    if (!user.username) {
      user.username = 'Player';
    }

    // Avoid conflict usernames
    let originalName = user.username;
    let checkName = user.username;
    let tries = 1;
    let maxTries = tries + 10;
    const usersArray = Object.values(this.users);
    while (tries < maxTries && usersArray.find((u) => u && u.username === checkName)) {
      checkName = `${originalName}${tries + 1}`;
      tries += 1;
    }
    user.username = checkName;

    if (tries > maxTries) {
      user.username = 'PLEASE SET NAME';
    }
  }

  static sendError(socket: SocketIO.Socket, error) {
    this.io.to(socket.id).emit(CONSTANTS.CHAT.MESSAGE, {
      username: 'SYSTEM',
      text: error,
      timestamp: +new Date(),
    });
  }

  static addUser(obj: any, broadcast = true) {
    this.validateUsername(obj);

    if (broadcast) {
      this.io.emit(CONSTANTS.CHAT.MESSAGE, {
        username: 'SYSTEM',
        text: `${obj.username} has connected`,
        timestamp: +new Date(),
      });
    }

    const usernameColor = Utility.getRandomColor();

    const user = {
      id: obj.id,
      userId: Utility.createUUID(),
      username: obj.username,
      usernameColor,
    };
    this.users[obj.id] = user;

    return user;
  }

  static removeUser(id: string, broadcast = true) {
    const user = this.getUser(id);
    if (broadcast && user) {
      this.io.emit(CONSTANTS.CHAT.MESSAGE, {
        username: 'SYSTEM',
        text: `${user.username} has disconnected`,
        timestamp: +new Date(),
      });
    }

    // Deletes the object
    delete this.users[id];
    // this.users[id] = undefined;
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
