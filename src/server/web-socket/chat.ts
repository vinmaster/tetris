import { WebSocketServer } from './web-socket-server';
import { CONSTANTS } from '../../common/constants';

export class Chat {
  processMessage(socket: SocketIO.Socket, message: string): any {
    let input: any = message.trim();
    let isCommand = true;
    const user = WebSocketServer.sockets[socket.id];
    if (!user) {
      this.sendError(socket, 'User not found');
      return;
    }
    let username = user.username;

    // Check if it is a command
    if (input.length <= 1 || input[0] !== '/') isCommand = false;

    if (!isCommand) {
      WebSocketServer.broadcastRoom('chatroom', CONSTANTS.CHAT.MESSAGE, {
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
        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
      case 'join':
        if (args[1] === 'admins') {
          socket.join('admins');
          user.role = 'Admin';
          output = 'You are now admin';

          WebSocketServer.broadcastTo(
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: output,
              timestamp,
            },
            socket
          );
          WebSocketServer.broadcastUsers();
        } else {
          socket.join('chatroom');
          output = `${username} has joined the chatroom`;
          WebSocketServer.broadcastRoom(
            'chatroom',
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: output,
              timestamp,
            },
            socket
          );
          WebSocketServer.broadcastTo(
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: 'You have joined the chatroom',
              timestamp,
            },
            socket
          );
        }
        break;
      case 'leave':
        if (args[1] === 'admins') {
          socket.leave('admins');
          user.role = 'User';
          output = 'You are now not admin';

          WebSocketServer.broadcastTo(
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: output,
              timestamp,
            },
            socket
          );
          WebSocketServer.broadcastUsers();
        } else {
          socket.leave('chatroom');
          output = `${username} has left the chatroom`;
          WebSocketServer.broadcastRoom(
            'chatroom',
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: output,
              timestamp,
            },
            socket
          );
          WebSocketServer.broadcastTo(
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: 'You have left the chatroom',
              timestamp,
            },
            socket
          );
        }
        break;
      case 'users':
        if (WebSocketServer.isAdmin(socket.id)) {
          output = WebSocketServer.sockets;
        } else {
          output = Object.assign(
            {},
            Object.values(WebSocketServer.sockets).map((user) => user.username)
          );
        }

        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
      case 'setusername': {
        const username = args.slice(1).join(' ');
        if (!user) {
          this.sendError(socket, 'User not found');
          return;
        }
        user.username = username;
        WebSocketServer.gameServer.validateAndSetUsername(user);
        output = `Your username: ${user.username}`;
        WebSocketServer.broadcastTo(CONSTANTS.SOCKET.SET_USERNAME, user.username, socket);
        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        WebSocketServer.broadcastUsers();
        break;
      }
      case 'color':
        output = `Your username color: ${user.usernameColor}`;
        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
      case 'setcolor': {
        const color = args.slice(1).join(' ');
        if (color.length > 0) {
          user.usernameColor = color;
          WebSocketServer.broadcastUsers();
          output = `Your username color: ${color}`;
        } else {
          output = 'Invalid color';
        }
        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
      }
      case 'role':
        output = user.role;

        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
      case 'forcerefresh':
        if (WebSocketServer.isAdmin(socket.id)) {
          WebSocketServer.broadcastAll('FORCE_REFRESH');
          WebSocketServer.gameServer.pieceHistory = WebSocketServer.gameServer.getNewPieces(100);
          output = 'Refreshing';
        } else {
          output = 'Invalid command';
          WebSocketServer.broadcastTo(
            CONSTANTS.CHAT.MESSAGE,
            {
              username: 'SYSTEM',
              text: output,
              timestamp,
            },
            socket
          );
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
        if (WebSocketServer.isAdmin(socket.id)) {
          output += `
/forcerefresh - Force refresh all client browsers
`;
        }
        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
      default:
        output = 'Invalid command';
        WebSocketServer.broadcastTo(
          CONSTANTS.CHAT.MESSAGE,
          {
            username: 'SYSTEM',
            text: output,
            timestamp,
          },
          socket
        );
        break;
    }

    const log = {
      issuerId: socket.id,
      issuer: user.username,
      input,
      text: output,
      timestamp,
    };
    if (WebSocketServer.isAdmin(socket.id)) {
      // Show to other admins except sender
      socket.to('admins').emit('LOGS', log);
    } else {
      // Show admins commands that ran
      WebSocketServer.broadcastRoom('admins', 'LOGS', log);
    }
  }

  sendError(socket: SocketIO.Socket, error) {
    WebSocketServer.broadcastTo(
      CONSTANTS.CHAT.MESSAGE,
      {
        username: 'SYSTEM',
        text: error,
        timestamp: +new Date(),
      },
      socket
    );
  }
}
