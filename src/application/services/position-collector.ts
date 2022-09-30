import { Config } from '../../infraestructure/config';
import { ResponsibleSocketMessage } from '../dto/socket';
import { Cache } from '../interfaces/cache';
import { GeolocationAPI } from '../interfaces/gps';
import { Logger } from '../interfaces/logger';

interface PositionCollectorService {
  handleResponsibleSocketMessage: (message: ResponsibleSocketMessage) => Promise<void>;
}

const handleResponsibleSocketMessage = async (
  message: ResponsibleSocketMessage,
  logger: Logger,
  geoAPI: GeolocationAPI,
  geoAPICache: Cache,
  config: Config
): Promise<void> => {
  logger.info(`consuming message: ${JSON.stringify(message)}`);
  // the usage of CPF and others stuff from frontend is to help us to mock things if needed
  const { CPF, coordinates, school } = message;
  const { defaultDistanceThreshold, geolocationApiTtlCache } = config;
  const cacheKey = `geoAPIRequest::${CPF}`

  const isGeoAPIRequestCached = await geoAPICache.get(cacheKey);
  if (isGeoAPIRequestCached) {
    logger.info(`hit geoAPICache - can't make request to geolocation API for responsible ${CPF}::${school.CNPJ}`)
    return;
  }

  const { distanceMeters, estimatedTime } = await geoAPI.getDistanceAndStimatedTime({
    from: {
      ...coordinates
    },
    to: { ...school.coordinates }
  });
  logger.info(`retrieved d => ${distanceMeters} t => ${estimatedTime} from => (${JSON.stringify(coordinates)}) to => (${JSON.stringify(school.coordinates)})`)

  await geoAPICache.set(cacheKey, JSON.stringify({ distanceMeters, estimatedTime}), { ttl: geolocationApiTtlCache });

  if (distanceMeters < defaultDistanceThreshold) {

  }
};

const newPositionCollectorService = (
  logger: Logger,
  geoAPI: GeolocationAPI,
  geoAPICache: Cache,
  config: Config
): PositionCollectorService => ({
  handleResponsibleSocketMessage: async (message: ResponsibleSocketMessage) => handleResponsibleSocketMessage(message, logger, geoAPI, geoAPICache, config)
});

export { newPositionCollectorService, PositionCollectorService };
