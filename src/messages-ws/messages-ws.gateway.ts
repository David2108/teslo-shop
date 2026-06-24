import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { threadId } from 'node:worker_threads';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * Escucha a todos los clientes que se conecten a la aplicación
 * namespace -> Es el nombre de la sala
 */
@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss!: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }

  /**
   * Socker.io
   * - Cada socket tiene un id unico
   */
  async handleConnection(client: Socket) {

    // Obtener los extraHeaders
    const token = client.handshake.headers.authentication as string;

    let payload: JwtPayload;

    try{
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    }catch(error){
      client.disconnect();
      return;
    }

    // // Se une al cliente a la sala ventas
    // client.join('ventas')
    // // Se emite un mensaje a todos los clientes de la sala de ventas
    // this.wss.to('ventas').emit('');

    // Emite a todos los clientes con el evento 'clients-updated'
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado: ', client.id);
    this.messagesWsService.removeClient(client.id);

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  /**
     * Servidor escucha el evento
     */
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {

    // Emite unicamente al client
    // client.emit('message-from-server', {
    //     fullname: 'Soy Yo!!',
    //     message: payload.message || 'no-message'
    // });

    // Emite a todos los clientes excepto al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //     fullname: 'Soy Yo!!',
    //     message: payload.message || 'no-message'
    // });

    // Se emite a todos los clientes
    this.wss.emit('message-from-server', {
      fullname: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    });

  }

}
