import { Utility } from '../common/utility';

interface User {
  username: string;
  id: string;
}

export class WebSocketServer {
  static io: SocketIO.Server;
  static users: { [id: string]: User } = {};

  static setup(io: SocketIO.Server) {
    this.io = io;
    this.io.on('connection', this.onConnection.bind(this));
  }

  static onConnection(socket: SocketIO.Socket) {
    const obj = Utility.getObjectSlice(socket, ['rooms', 'connected', 'id']);
    // console.log('connected', obj);

    const broadcastUsers = () => {
      let output;
      if (this.isAdmin(socket)) {
        output = this.users;
      } else {
        output = Object.assign(
          {},
          Object.keys(this.users).map((id) => this.getUser(id).username)
        );
      }

      this.io.emit('LIST_USERS', output);
    };

    socket.on('disconnect', () => {
      this.removeUser(socket.id);

      broadcastUsers();
    });

    socket.on('LIST_USERS', () => {
      broadcastUsers();
    });

    socket.on('REGISTER', (username: string) => {
      // No username
      if (!username) {
        username = 'Anonymous';
      }
      obj['username'] = username;
      this.addUser(obj);
      socket.join('chatroom');

      // console.log('users', this.users);
    });

    socket.on('CHAT_MESSAGE', (message: string) => {
      if (!message) return;

      this.processMessage(socket, message);
    });
  }

  static processMessage(socket: SocketIO.Socket, message: string): any {
    let output: any = message.trim();
    let isCommand = true;
    let username = this.getUser(socket.id).username;

    // Check if it is a command
    if (output.length <= 1 || output[0] !== '/') isCommand = false;

    if (!isCommand) {
      this.io.to('chatroom').emit('CHAT_MESSAGE', {
        username,
        text: output,
        timestamp: +new Date(),
      });
      return;
    }

    // Handle commands
    const argStr = output.substring(1, output.length).toLowerCase();
    const args = argStr.split(' ').filter((a) => a.length !== 0);
    const command = args[0];
    const timestamp = +new Date();

    switch (command) {
      case 'time':
        output = new Date().toString();
        this.io.to(socket.id).emit('CHAT_MESSAGE', {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'join':
        if (args[1] === 'admins') {
          socket.join('admins');

          this.io.to(socket.id).emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: 'You are now admin',
            timestamp,
          });
        } else {
          socket.join('chatroom');
          output = `${username} has joined the chatroom`;
          this.io.to('chatroom').emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.io.to(socket.id).emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: 'You have joined the chatroom',
            timestamp,
          });
        }
        break;
      case 'leave':
        if (args[1] === 'admins') {
          socket.leave('admins');

          this.io.to(socket.id).emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: 'You are now not admin',
            timestamp,
          });
        } else {
          socket.leave('chatroom');
          output = `${username} has left the chatroom`;
          this.io.to('chatroom').emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.io.to(socket.id).emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: 'You have left the chatroom',
            timestamp,
          });
        }
        break;
      case 'listusers':
        if (this.isAdmin(socket)) {
          output = this.users;
        } else {
          output = Object.assign(
            {},
            Object.keys(this.users).map((id) => this.getUser(id).username)
          );
        }

        this.io.to(socket.id).emit('CHAT_MESSAGE', {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'forcerefresh':
        if (this.isAdmin(socket)) {
          this.io.emit('FORCE_REFRESH');
        }
        break;
      case 'help':
        output = `
/time - Get time
/listusers - List the connected users
/join - Join chatroom
/leave - Leave chatroom
/help - List commands`;
        this.io.to(socket.id).emit('CHAT_MESSAGE', {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      default:
        output = 'Invalid Command';
        this.io.to(socket.id).emit('CHAT_MESSAGE', {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
    }

    const log = {
      issuerId: socket.id,
      issuer: this.getUser(socket.id).username,
      text: output,
      timestamp,
    };
    if (this.isAdmin(socket)) {
      // Show to other admins except sender
      socket.to('admins').emit('LOGS', log);
    } else {
      // Show admins commands that are ran
      this.io.to('admins').emit('LOGS', log);
    }
    // private message
    // if (this.isAdmin(socket.id)) {
    //   this.io.to(socket.id).emit('CHAT_MESSAGE', output);
    // }
  }

  static isAdmin(id: string | SocketIO.Socket) {
    if (typeof id === 'string') {
      const room = this.getRoom('admins');
      if (!room) return false;
      const adminIds = Object.keys(room.sockets);
      return adminIds.includes(id);
    } else {
      return !!id.rooms['admins'];
    }
  }

  // Can return undefined if room is empty
  static getRoom(roomName: string): SocketIO.Room | undefined {
    return this.io.sockets.adapter.rooms[roomName];
  }

  static getUser(id: string) {
    return this.users[id];
  }

  static addUser(obj: any, broadcast = true) {
    if (broadcast) {
      this.io.emit('CHAT_MESSAGE', {
        username: 'SYSTEM',
        text: `${obj.username} has connected`,
        timestamp: +new Date(),
      });
    }

    this.users[obj.id.toString()] = {
      id: obj.id,
      username: obj.username,
    };
  }

  static removeUser(id: string, broadcast = true) {
    if (broadcast && this.getUser(id)) {
      this.io.emit('CHAT_MESSAGE', {
        username: 'SYSTEM',
        text: `${this.getUser(id).username} has disconnected`,
        timestamp: +new Date(),
      });
    }

    delete this.users[id];
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
