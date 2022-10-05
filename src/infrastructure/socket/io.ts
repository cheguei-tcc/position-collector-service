import { Server as SocketIO } from 'socket.io';
import { Socket, SocketData } from '../../application/interfaces/socket';

const emit = async (io: SocketIO, data: SocketData): Promise<void> => {
  const { event, payload, group } = data;

  const room = io.in(group);

  room.emit(event, payload);
};

const newSocketIOAdapter = (io: SocketIO): Socket => ({
  emit: async (data: SocketData) => emit(io, data)
});

export { newSocketIOAdapter };
