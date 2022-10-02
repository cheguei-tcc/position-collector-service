import { Producer } from 'sqs-producer';
import { randomUUID } from 'crypto';
import { Logger } from '../../../application/interfaces/logger';
import { QueueOptions, QueueProducer } from '../../../application/interfaces/queue';

const enqueue = async (msg: string, options: QueueOptions, logger: Logger) => {
  logger.info(`[SQS Producer] enqueue msg => ${msg}`);
  const producer = Producer.create({ queueUrl: options.queueUrl });

  await producer.send({ id: randomUUID(), body: msg, groupId: options.messageGroupId });
};

const newSqsPositionMsgProducer = (logger: Logger): QueueProducer => ({
  enqueue: async (msg: string, options: QueueOptions) => enqueue(msg, options, logger)
});

export { newSqsPositionMsgProducer };
