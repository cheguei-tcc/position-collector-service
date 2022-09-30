import { createClient } from 'redis';
import { Logger } from '../../../application/interfaces/logger';

import { Config } from '../../config';

const createRedisClient = async (config: Config, logger: Logger) => {
  const client = createClient({
    url: config.redisUri
  });

  // logging all available redis events:
  client.on('connect', () => logger.info(`[REDIS] connecting on ${config.redisUri}...`));
  client.on('ready', () => logger.info('[REDIS] connection ready'));
  client.on('end', () => logger.info('[REDIS] client disconnected via .quit() or .disconnect()'));
  client.on('error', (err) => logger.error(`[REDIS] error ${JSON.stringify(err)}`));
  client.on('reconnecting', () => logger.info(`[REDIS] Trying to reconnect to ${config.redisUri}`));

  await client.connect();

  return client;
};

export { newRedisCache } from './hash';
export { createRedisClient };
