import express from 'express';
import * as server from 'http';
import { Server } from 'socket.io';
const app = express();

const ioPort = 4444;

const ioServer = server.createServer(app);

const socketIo = new Server(ioServer, {
  cors: {
    origin: '*',
  },
});

socketIo.on('connection', (socket) => {
  socket.on('disconnect', () => {
    socket.disconnect();
  });
});

ioServer.listen(ioPort, () => {
  console.log(`ouvindo porta ${ioPort}`);
});
