interface Cache {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options: { ttl?: number }) => Promise<void>;
}

export { Cache }