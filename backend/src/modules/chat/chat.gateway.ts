import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  // Mapa de conexões: userId -> socketId[]
  private connectedUsers = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    try {
      // Extrair token do handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.log('❌ Conexão rejeitada: token não fornecido');
        client.disconnect();
        return;
      }

      // Validar token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.userId || payload.sub;
      const tenantId = payload.tenantId;

      // Armazenar dados do usuário no socket
      client.data.userId = userId;
      client.data.tenantId = tenantId;

      // Adicionar cliente ao room do tenant (isolamento multi-tenant)
      await client.join(`tenant:${tenantId}`);

      // Registrar conexão
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      console.log(`✅ Cliente conectado: ${client.id} | User: ${userId} | Tenant: ${tenantId}`);

      // Notificar outros usuários do tenant que este usuário está online
      this.server.to(`tenant:${tenantId}`).emit('user:online', { userId });

    } catch (error) {
      console.log('❌ Conexão rejeitada: token inválido', error?.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const tenantId = client.data.tenantId;

    if (userId) {
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        
        // Se não há mais conexões deste usuário, remover do mapa e notificar offline
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
          if (tenantId) {
            this.server.to(`tenant:${tenantId}`).emit('user:offline', { userId });
          }
        }
      }
    }

    console.log(`❌ Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): { event: string; data: any } {
    console.log(`🏓 Ping recebido de ${client.id}`);
    return {
      event: 'pong',
      data: {
        message: 'pong',
        timestamp: new Date().toISOString(),
        userId: client.data.userId,
      },
    };
  }

  @SubscribeMessage('message:send')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const tenantId = client.data.tenantId;
    const userId = client.data.userId;

    console.log(`📨 Mensagem recebida de ${userId}:`, data);

    // Broadcast para todos os usuários do tenant
    this.server.to(`tenant:${tenantId}`).emit('message:new', {
      conversationId: data.conversationId,
      content: data.content,
      senderId: userId,
      timestamp: new Date().toISOString(),
    });
  }

  // Método utilitário para enviar mensagens programaticamente
  sendMessageToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  // Verificar se um usuário está online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  // Obter todos os usuários online de um tenant
  getOnlineUsers(tenantId: string): string[] {
    const onlineUsers: string[] = [];
    this.server.in(`tenant:${tenantId}`).fetchSockets().then((sockets) => {
      sockets.forEach((socket: any) => {
        if (socket.data.userId) {
          onlineUsers.push(socket.data.userId);
        }
      });
    });
    return onlineUsers;
  }
}
