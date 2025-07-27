import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "http";

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    // Configurar WebSocket com path específico para evitar conflito com Vite
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/ws',
      perMessageDeflate: false,
      clientTracking: true
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      console.log(`[WebSocket] Cliente conectado de ${req.socket.remoteAddress}`);
      this.clients.add(ws);
      
      // Enviar mensagem de boas-vindas
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Conectado ao servidor WebSocket',
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[WebSocket] Mensagem recebida:', message);
          
          // Echo da mensagem para teste
          ws.send(JSON.stringify({
            type: 'echo',
            data: message,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('[WebSocket] Erro ao processar mensagem:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Formato de mensagem inválido',
            timestamp: new Date().toISOString()
          }));
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`[WebSocket] Cliente desconectado - Código: ${code}, Razão: ${reason}`);
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Erro na conexão:', error);
        this.clients.delete(ws);
      });

      // Ping/Pong para manter conexão viva
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on('pong', () => {
        console.log('[WebSocket] Pong recebido');
      });
    });

    this.wss.on('error', (error) => {
      console.error('[WebSocket] Erro no servidor:', error);
    });
  }

  // Broadcast para todos os clientes conectados
  broadcast(message: any) {
    const data = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
          sentCount++;
        } catch (error) {
          console.error('[WebSocket] Erro ao enviar mensagem:', error);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });

    console.log(`[WebSocket] Mensagem enviada para ${sentCount} clientes`);
  }

  // Enviar mensagem para cliente específico
  sendToClient(clientId: string, message: any) {
    // Implementar lógica para identificar clientes específicos se necessário
    this.broadcast({ ...message, clientId });
  }

  // Obter estatísticas
  getStats() {
    return {
      connectedClients: this.clients.size,
      serverRunning: this.wss.readyState === WebSocket.OPEN
    };
  }

  // Fechar servidor WebSocket
  close() {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1000, 'Servidor sendo desligado');
      }
    });
    this.wss.close();
  }
}