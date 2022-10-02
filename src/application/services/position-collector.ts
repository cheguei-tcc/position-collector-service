import { Config } from '../../infrastructure/config';
import { PositionMessage, Status } from '../dto/position';
import { ResponsibleSocketMessage } from '../dto/socket';
import { Cache } from '../interfaces/cache';
import { GeolocationAPI } from '../interfaces/gps';
import { Logger } from '../interfaces/logger';
import { QueueProducer } from '../interfaces/queue';

interface PositionCollectorService {
  handleResponsibleSocketMessage: (message: ResponsibleSocketMessage) => Promise<void>;
}

const handleResponsibleSocketMessage = async (
  responsibleMessage: ResponsibleSocketMessage,
  logger: Logger,
  geoAPI: GeolocationAPI,
  geoAPICache: Cache,
  queueProducer: QueueProducer,
  config: Config
): Promise<void> => {
  logger.info(`consuming message: ${JSON.stringify(responsibleMessage)}`);
  // the usage of CPF and others stuff from frontend is to help us to mock things if needed
  const { CPF, name, coordinates, school } = responsibleMessage;
  const { defaultDistanceThreshold, geolocationApiTtlCache } = config;
  const cacheKey = `geoAPIRequest::${CPF}`;

  const isGeoAPIRequestCached = await geoAPICache.get(cacheKey);
  if (isGeoAPIRequestCached) {
    logger.info(`hit geoAPICache for responsible ${CPF}::${school.CNPJ}`);
    return;
  }

  const { distanceMeters, estimatedTime } = await geoAPI.getDistanceAndStimatedTime({
    from: {
      ...coordinates
    },
    to: { ...school.coordinates }
  });
  logger.info(
    ` [POSITION] retrieved for r => ${CPF} \nd => ${distanceMeters}m \nt => ${estimatedTime}s \nfrom => (${JSON.stringify(
      coordinates
    )}) to => (${JSON.stringify(school.coordinates)})`
  );

  await geoAPICache.set(cacheKey, JSON.stringify({ distanceMeters, estimatedTime }), { ttl: geolocationApiTtlCache });

  if (distanceMeters < defaultDistanceThreshold) {
    const positionMsg: PositionMessage = {
      distanceMeters,
      estimatedTime,
      responsible: {
        CPF,
        name
      },
      school,
      status: estimatedTime !== 0 ? Status.ON_THE_WAY : Status.ARRIVED
    };

    await queueProducer.enqueue(JSON.stringify(positionMsg), { queueUrl: config.studentsPickupQueueUrl });
  }
};

const newPositionCollectorService = (
  logger: Logger,
  geoAPI: GeolocationAPI,
  geoAPICache: Cache,
  queueProducer: QueueProducer,
  config: Config
): PositionCollectorService => ({
  handleResponsibleSocketMessage: async (message: ResponsibleSocketMessage) =>
    handleResponsibleSocketMessage(message, logger, geoAPI, geoAPICache, queueProducer, config)
});

export { newPositionCollectorService, PositionCollectorService };
