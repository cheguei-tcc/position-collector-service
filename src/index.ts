import Pino from 'pino';
import { newPositionCollectorService } from './application/services/position-collector';
import { createRedisClient, newRedisCache } from './infrastructure/cache/redis';
import { Config, configFromEnv } from './infrastructure/config';
import { newAzureRouteAPI } from './infrastructure/external/azure';
import { newAxiosHttpClient } from './infrastructure/external/http-client';
import { newOSRMOpenAPI } from './infrastructure/external/osrm';
import { newSqsPositionMsgProducer } from './infrastructure/external/sqs';
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
  const geoAPI =
    config.nodeEnv === 'prod'
      ? newAzureRouteAPI(axiosClient, logger, config)
      : newOSRMOpenAPI(axiosClient, logger, config);
  const sqsProducer = newSqsPositionMsgProducer(logger);

  const positionCollectorService = newPositionCollectorService(logger, geoAPI, redisCache, sqsProducer, config);

  const { httpServer } = newServer(logger, positionCollectorService, config);

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
