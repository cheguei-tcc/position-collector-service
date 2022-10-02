type QueueOptions = {
  queueUrl?: string;
  messageGroupId?: string;
};

interface QueueProducer {
  enqueue: (msg: string, options: QueueOptions) => Promise<void>;
}

export { QueueProducer, QueueOptions };
