import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // cấu hình CORS nếu cần thiết
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log(`Server initialized: ${server}`);
    this.server = server;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('test', 'test');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendMessageToAllClient(name: string, payload: object) {
    if (!this.server) {
      console.error('WebSocket server is not initialized');
      return;
    }
    console.log({ name, payload, position: 'gateway' });
    this.server.emit(name, payload);
  }
}
