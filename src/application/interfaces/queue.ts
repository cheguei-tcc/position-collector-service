type QueueOptions = {
  queueUrl?: string;
};

interface QueueProducer {
  enqueue: (msg: string, options: QueueOptions) => Promise<void>;
}

export { QueueProducer, QueueOptions };
