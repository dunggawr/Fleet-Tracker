import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { GpsUpdateDto } from './dto/gps-update.dto';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import * as cookie from 'cookie';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'tracking',
})
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('TrackingGateway');

  constructor(
    private readonly trackingService: TrackingService,
    private readonly jwtService: JwtService,
  ) {}

  @OnEvent('alert.new')
  handleNewAlert(payload: any) {
    this.logger.log(`Broadcasting alert: ${payload.type}`);
    this.server.to('admin').emit('alert:new', payload);

    // Also notify the driver if relevant
    if (payload.driverId) {
      this.server.to(`driver:${payload.driverId}`).emit('alert:yours', payload);
    }
  }

  @OnEvent('trip.status_changed')
  handleTripStatusChange(payload: any) {
    this.logger.log(
      `Broadcasting trip status change: ${payload.id} -> ${payload.status}`,
    );
    this.server.to('admin').emit('trip:status', payload);
    this.server.to(`trip:${payload.id}`).emit('trip:status', payload);
  }

  @OnEvent('alert.resolved')
  handleAlertResolved(payload: any) {
    this.logger.log(`Broadcasting alert resolution: ${payload.id}`);
    this.server.to('admin').emit('alert:resolved', payload);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(
          `Client connection rejected: No token provided. ID: ${client.id}, Handshake: ${JSON.stringify(client.handshake.headers)}`,
        );
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      // Join rooms based on role
      if (payload.role === 'admin' || payload.role === 'dispatcher') {
        client.join('admin');
        this.logger.log(`Admin/Dispatcher connected: ${client.id}`);
      } else if (payload.role === 'driver') {
        client.join(`driver:${payload.id}`);
        this.logger.log(
          `Driver connected: ${client.id} (Driver ID: ${payload.id})`,
        );
      }

      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('gps:update')
  async handleGpsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GpsUpdateDto,
  ) {
    const user = client.data.user;

    // Authorization: Only drivers can update GPS (or admin for testing)
    if (user.role !== 'driver' && user.role !== 'admin') {
      return { event: 'error', data: 'Unauthorized to send GPS updates' };
    }

    try {
      const result = await this.trackingService.processGpsUpdate(data);

      // Broadcast to all admins
      this.server.to('admin').emit('vehicle:location', result);

      // Also broadcast to the specific trip room if implemented
      this.server.to(`trip:${data.tripId}`).emit('trip:location', result);

      return {
        event: 'gps:received',
        data: { timestamp: new Date().toISOString() },
      };
    } catch (error) {
      this.logger.error(`Error processing GPS update: ${error.message}`);
      return { event: 'error', data: error.message };
    }
  }

  @SubscribeMessage('subscribe:trip')
  handleSubscribeTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    client.join(`trip:${data.tripId}`);
    return { event: 'subscribed', data: { room: `trip:${data.tripId}` } };
  }

  private extractToken(client: Socket): string | undefined {
    // 1. Try auth object (standard for Socket.io)
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    // 2. Try query parameters
    if (client.handshake.query?.token) {
      return client.handshake.query.token as string;
    }

    // 3. Try Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    // 4. Try Cookies (for Web Admin with HttpOnly cookies)
    if (client.handshake.headers.cookie) {
      try {
        const cookies = cookie.parse(client.handshake.headers.cookie);
        return cookies['access_token'];
      } catch (e) {
        this.logger.error(
          `Error parsing cookies for client ${client.id}: ${e.message}`,
        );
      }
    }

    return undefined;
  }
}
