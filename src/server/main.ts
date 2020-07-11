import Koa from 'koa';
import Router from 'koa-router';
import sendfile from 'koa-sendfile';
import send from 'koa-send';
import cors from '@koa/cors';
import http from 'http';
import socketio from 'socket.io';
import { WebSocketServer } from './web-socket/web-socket-server';

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 8000;

// Setup websocket
const server = http.createServer(app.callback());
const io = socketio(server);
WebSocketServer.setup(io);

if (process.env.NODE_ENV === 'production') {
  const {
    default: sslify, // middleware factory
    xForwardedProtoResolver: resolver, // resolver needed
  } = require('koa-sslify');
  app.use(sslify({ resolver }));
}
app.use(
  cors({
    credentials: true,
  })
);
app.use(router.routes());

router.get('/', async (ctx) => {
  // await sendfile(ctx, './src/server/public/index.html');
  await sendfile(ctx, __dirname + '/public/index.html');
});

// Static files
app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: __dirname + '/public' });
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
