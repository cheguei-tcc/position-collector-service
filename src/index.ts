import Pino from 'pino';
import { newPositionCollectorService } from './application/services/position-collector';
import { createRedisClient, newRedisCache } from './infrastructure/cache/redis';
import { Config, configFromEnv } from './infrastructure/config';
import { newAxiosHttpClient } from './infrastructure/external/http-client';
import { newOSRMOpenAPI } from './infrastructure/external/osrm';
import { newServer } from './infrastructure/server';

const initDependenciesAndStart = async (config: Config) => {
  const logger = Pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: true
      }
    }
  });
  
  const redisClient = await createRedisClient(config, logger);
  const redisCache = newRedisCache(redisClient);
  
  const axiosClient = newAxiosHttpClient();
  const geoAPI = newOSRMOpenAPI(axiosClient, config);
  const positionCollectorService = newPositionCollectorService(logger, geoAPI, redisCache, config);

  const { httpServer } = newServer(logger, positionCollectorService);

  try {
    httpServer.listen(config.port, () => logger.info(`listening on port: ${config.port}`));
  } catch (err: any) {
    logger.error(`server error: ${err.message}\n${err.stack}`);
  }
};

const main = async () => {
  const config = configFromEnv();
  await initDependenciesAndStart(config);
};

main();