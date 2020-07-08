import { Utility } from '../common/utility';

interface User {
  id: string;
  username: string;
  usernameColor: string;
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

    socket.on('disconnect', () => {
      this.removeUser(socket.id);

      this.broadcastUsers(socket);
    });

    socket.on('LIST_USERS', () => {
      this.broadcastUsers(socket);
    });

    socket.on('REGISTER', (username: string) => {
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
    let input: any = message.trim();
    let isCommand = true;
    let username = this.getUser(socket.id).username;

    // Check if it is a command
    if (input.length <= 1 || input[0] !== '/') isCommand = false;

    if (!isCommand) {
      this.io.to('chatroom').emit('CHAT_MESSAGE', {
        username,
        text: input,
        timestamp: +new Date(),
      });
      return;
    }

    // Handle commands
    const argStr = input.substring(1, input.length).toLowerCase();
    const args = argStr.split(' ').filter((a) => a.length !== 0);
    const command = args[0];
    const timestamp = +new Date();
    let output = input;

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
          output = 'You are now admin';

          this.io.to(socket.id).emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: output,
            timestamp,
          });
          this.broadcastUsers(socket);
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
          output = 'You are now not admin';

          this.io.to(socket.id).emit('CHAT_MESSAGE', {
            username: 'SYSTEM',
            text: output,
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
      case 'users':
        if (this.isAdmin(socket.id)) {
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
      case 'setcolor':
        if (args[1].length > 0) {
          this.users[socket.id].usernameColor = args[1];
          this.broadcastUsers(socket);
          output = 'Your username color has changed';
        } else {
          output = 'Invalid color';
        }
        this.io.to(socket.id).emit('CHAT_MESSAGE', {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'role':
        if (this.isAdmin(socket.id)) {
          output = 'Admin';
        } else {
          output = 'User';
        }

        this.io.to(socket.id).emit('CHAT_MESSAGE', {
          username: 'SYSTEM',
          text: output,
          timestamp,
        });
        break;
      case 'forcerefresh':
        if (this.isAdmin(socket.id)) {
          this.io.emit('FORCE_REFRESH');
        }
        output = 'Refreshing';
        break;
      case 'help':
        output = `
/time - Get time
/users - List the connected users
/setcolor - Set username color
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
        output = 'Invalid command';
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
      output = Object.values(this.users).map((u) =>
        Utility.getObjectSlice(u, ['username', 'usernameColor'])
      );
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

  static addUser(obj: any, broadcast = true) {
    // No username
    if (!obj.username) {
      obj.username = 'Anonymous';
    }
    // Avoid conflict usernames
    let checkName = obj.username;
    let tries = 1;
    let maxTries = 10;
    const usersArray = Object.values(this.users);
    while (tries <= maxTries && usersArray.find((u) => u.username === checkName)) {
      obj.username = `${checkName}${tries + 1}`;
      checkName = obj.username;
      tries += 1;
    }

    if (tries > maxTries) {
      obj.username = 'PLEASE SET NAME';
    }

    if (broadcast) {
      this.io.emit('CHAT_MESSAGE', {
        username: 'SYSTEM',
        text: `${obj.username} has connected`,
        timestamp: +new Date(),
      });
    }

    const usernameColor = Utility.getRandomColor();

    this.users[obj.id.toString()] = {
      id: obj.id,
      username: obj.username,
      usernameColor,
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
