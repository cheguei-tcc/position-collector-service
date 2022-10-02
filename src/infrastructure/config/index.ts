type Config = {
  nodeEnv: string;
  logLevel: string;
  port: string;
  redisUri: string;
  redisHost: string;
  studentsPickupQueueUrl: string;
  awsRegion: string;
  defaultDistanceThreshold: number;
  geolocationApiTtlCache: number;
  osrmOpenAPIUrl: string;
  azureApiUrl: string;
  azureApiSubscriptionKey: string;
};

const configFromEnv = (): Config => ({
  nodeEnv: process.env.NODE_ENV ?? 'local',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  port: process.env.PORT ?? '4444',
  redisUri: process.env.REDIS_URI ?? 'redis://localhost:6379',
  studentsPickupQueueUrl:
    process.env.STUDENTS_PICKUP_QUEUE_URL ??
    'https://sqs.sa-east-1.amazonaws.com/879051259341/students-pickup-queue-test.fifo',
  awsRegion: process.env.AWS_DEFAULT_REGION ?? 'sa-east-1',
  redisHost: process.env.REDIS_HOST || 'localhost',
  defaultDistanceThreshold: Number(process.env.DEFAULT_DISTANCE_THRESHOLD) || 5000, // in metters
  geolocationApiTtlCache: Number(process.env.GEOLOCATION_API_TTL_CACHE) || 7, // in seconds
  osrmOpenAPIUrl: process.env.OSRM_OPEN_API_URL || 'https://routing.openstreetmap.de',
  azureApiUrl: process.env.AZURE_API_URL || 'https://atlas.microsoft.com',
  azureApiSubscriptionKey: process.env.AZURE_API_SUBSCRIPTION_KEY || ''
});

export { Config, configFromEnv };
