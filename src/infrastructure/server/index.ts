import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { PositionCollectorService } from '../../application/services/position-collector';
import { ResponsibleSocketMessage } from '../../application/dto/socket';
import { Logger } from '../../application/interfaces/logger';
import { newSocketIOAdapter } from '../socket/io';

const healthcheck = async (request: any, response: any, logger: Logger) => {
  // default is a "healthcheck" route
  logger.info(`received request ${request.method} - ${request.url}`);
  return response.end(JSON.stringify({ health: 'ok' }));
};

export const newServer = (logger: Logger, positionCollectorService: PositionCollectorService) => {
  const httpServer = createServer(async (req, res) => healthcheck(req, res, logger));

  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`socketId => ${socket.id} connected`);

    // move every socket connected to it respectivelly room which now is the CPF for now
    const room = socket.request.headers['user-surrogate-key'];
    await socket.join(room!);

    socket.on('coordinates_sent', async (message: ResponsibleSocketMessage) => {
      try {
        const socketIOAdapter = newSocketIOAdapter(io);
        await positionCollectorService.handleResponsibleSocketMessage(message, socketIOAdapter);
      } catch (err: any) {
        logger.error(JSON.stringify(err));
      }
    });

    socket.on('disconnecting', (reason) => {
      logger.info(`disconnecting socket: ${socket.id}, reason: ${reason}, rooms: ${JSON.stringify([...socket.rooms])}`);
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
