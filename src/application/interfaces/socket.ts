type SocketData = {
  event: string;
  payload: any;
  group: string;
};

interface Socket {
  emit: (data: SocketData) => Promise<void>;
}

export { Socket, SocketData };
