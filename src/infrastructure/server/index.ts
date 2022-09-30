import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Logger } from 'pino';
import { PositionCollectorService } from '../../application/services/position-collector';
import { ResponsibleSocketMessage } from '../../application/dto/socket';

const healthcheck = async (_request: any, response: any) => {
  // default is a "healthcheck" route
  return response.end(JSON.stringify({ health: 'ok' }));
};

export const newServer = (logger: Logger, positionCollectorService: PositionCollectorService) => {
  const httpServer = createServer(healthcheck);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', async (socket) => {
    logger.info(`socketId => ${socket.id} connected`);

    socket.on('coordinates_sent', async (message: ResponsibleSocketMessage) => await positionCollectorService.handleResponsibleSocketMessage(message));

    socket.on('disconnecting', (reason) => {
      logger.info(
        `disconnecting socket: ${socket.id}, reason: ${reason}, from rooms: ${JSON.stringify([...socket.rooms])}`
      );
    });

    // TCP LOW LEVEL CONNECTION
    socket.conn.once('upgrade', () => {
      // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
      logger.info(`[TCP] upgraded transport ${socket.conn.transport.name}`);
      logger.info(`clients connected: ${io.engine.clientsCount}`);
    });
  });

  return { httpServer, io };
};
