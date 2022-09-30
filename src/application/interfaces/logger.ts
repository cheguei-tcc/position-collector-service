interface Logger {
  info: (msg: string) => void;
  error: (msg: string) => void;
}

export { Logger }