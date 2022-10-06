import { Config } from '../../infrastructure/config';
import { PositionMessage, Status } from '../dto/position';
import { ResponsibleSocketMessage } from '../dto/socket';
import { Cache } from '../interfaces/cache';
import { GeolocationAPI } from '../interfaces/gps';
import { Logger } from '../interfaces/logger';
import { QueueProducer } from '../interfaces/queue';
import { Socket } from '../interfaces/socket';

interface PositionCollectorService {
  handleResponsibleSocketMessage: (message: ResponsibleSocketMessage, socket: Socket) => Promise<void>;
}

const handleResponsibleSocketMessage = async (
  responsibleMessage: ResponsibleSocketMessage,
  logger: Logger,
  geoAPI: GeolocationAPI,
  geoAPICache: Cache,
  queueProducer: QueueProducer,
  socket: Socket,
  config: Config
): Promise<void> => {
  logger.info(`consuming message: ${JSON.stringify(responsibleMessage)}`);
  // the usage of CPF and others stuff from frontend is to help us to mock things if needed
  const { id, coordinates, school } = responsibleMessage;
  if (!id) {
    logger.info('[DO NOTHING] responsibleId is undefined');
    return;
  }
  const { defaultDistanceThreshold, geolocationApiTtlCache, arrivedTimeWindow } = config;
  const cacheKey = `geoAPIRequest::responsible::${id}`;

  const isGeoAPIRequestCached = await geoAPICache.get(cacheKey);
  if (isGeoAPIRequestCached) {
    logger.info(`hit geoAPICache for  responsible::${id}::school::${school.id}`);
    return;
  }

  const { distanceMeters, estimatedTime } = await geoAPI.getDistanceAndStimatedTime({
    from: {
      ...coordinates
    },
    to: { ...school.coordinates }
  });
  logger.info(
    ` [POSITION] retrieved for responsibleId => ${id} \ndistance => ${distanceMeters}m \ntime => ${estimatedTime}s \nfrom => (${JSON.stringify(
      coordinates
    )}) to => (${JSON.stringify(school.coordinates)})`
  );

  if (estimatedTime <= arrivedTimeWindow) {
    // emit calculated position event to client socket
    await socket.emit({
      event: 'arrived',
      group: String(id),
      payload: JSON.stringify({ status: 'ARRIVED' })
    });
  }
  await geoAPICache.set(cacheKey, JSON.stringify({ distanceMeters, estimatedTime }), { ttl: geolocationApiTtlCache });

  // emit calculated position event to client socket
  await socket.emit({
    event: 'calculated-position',
    group: String(id),
    payload: JSON.stringify({ distanceInMeters: distanceMeters, timeInSeconds: estimatedTime })
  });
  logger.info(`[SOCKET] sent calculated-position to room => ${id}`);

  if (distanceMeters < defaultDistanceThreshold) {
    const positionMsg: PositionMessage = {
      distanceMeters,
      estimatedTime,
      responsible: {
        id
      },
      school,
      status: estimatedTime !== 0 ? Status.ON_THE_WAY : Status.ARRIVED
    };

    // enqueue to students-pickup consumer
    await queueProducer.enqueue(JSON.stringify(positionMsg), {
      queueUrl: config.studentsPickupQueueUrl,
      messageGroupId: `${id}`
    });
  }
};

const newPositionCollectorService = (
  logger: Logger,
  geoAPI: GeolocationAPI,
  geoAPICache: Cache,
  queueProducer: QueueProducer,
  config: Config
): PositionCollectorService => ({
  handleResponsibleSocketMessage: async (message: ResponsibleSocketMessage, socket: Socket) =>
    handleResponsibleSocketMessage(message, logger, geoAPI, geoAPICache, queueProducer, socket, config)
});

export { newPositionCollectorService, PositionCollectorService };
