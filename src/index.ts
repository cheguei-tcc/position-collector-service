import express from 'express';
import * as server from 'http';
import { Server } from 'socket.io';

import { Coordinates } from './models/coordinates';
import axios from 'axios';

import { createClient } from 'redis';

const app = express();
const client = createClient();

const ioPort = 4444;

const ioServer = server.createServer(app);

export const axiosInstance = axios.create({
  baseURL: 'https://swarm.cheguei.app',
  timeout: 3000000,
});

const socketIo = new Server(ioServer, {
  cors: {
    origin: '*',
  },
});

socketIo.on('connection', (socket) => {
  socket.on('coordinates_sent', async (responsibleCoordinates: Coordinates) => {
    await client.connect();
    const ttlCacheKey = await client.get(
      `${responsibleCoordinates.responsibleId}::${responsibleCoordinates.surrogateKey}`
    );
    if (ttlCacheKey) {
      const schoolCoordinates = (await axiosInstance.get(
        `/account/schools/coordinates/${responsibleCoordinates.surrogateKey}`
      )) as any;
      await axiosInstance.get(
        `/route/v1/car/${responsibleCoordinates.lat},${responsibleCoordinates.long};
        ${schoolCoordinates.lat};${schoolCoordinates.long}?overview=false`
      );
      client.hSet(
        `${responsibleCoordinates.responsibleId}::${responsibleCoordinates.surrogateKey}`,
        ''
      );
    }
  });

  socket.on('disconnect', () => {
    socket.disconnect();
  });
});

ioServer.listen(ioPort, () => {
  console.log(`ouvindo porta ${ioPort}`);
});
