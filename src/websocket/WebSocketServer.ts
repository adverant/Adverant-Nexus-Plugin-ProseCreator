import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { logger } from '../utils/logger';
import { ClientConnection, WebSocketMessage } from './types';
import { GenerationHandler } from './handlers/generation.handler';
import { ProgressHandler } from './handlers/progress.handler';
import { BlueprintHandler } from './handlers/blueprint.handler';

export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, ClientConnection> = new Map();
  private generationHandler: GenerationHandler;
  private progressHandler: ProgressHandler;
  private blueprintHandler: BlueprintHandler;

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.generationHandler = new GenerationHandler();
    this.progressHandler = new ProgressHandler();
    this.blueprintHandler = new BlueprintHandler();
    this.setupHandlers();
    logger.info(`WebSocket server started on port ${port}`);
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const clientId = this.generateClientId();
      const client: ClientConnection = {
        id: clientId,
        ws,
        subscriptions: new Set(),
        metadata: {
          connectedAt: new Date()
        }
      };

      this.clients.set(clientId, client);
      logger.info(`Client connected: ${clientId}`, {
        ip: req.socket.remoteAddress,
        total_clients: this.clients.size
      });

      // Send welcome message
      this.sendToClient(client, {
        type: 'connection_established',
        payload: {
          client_id: clientId,
          message: 'Connected to NexusProseCreator WebSocket server'
        }
      });

      ws.on('message', async (message: string) => {
        try {
          const data: WebSocketMessage = JSON.parse(message);
          await this.handleMessage(client, data);
        } catch (error) {
          logger.error('WebSocket message error', { error, client_id: clientId });
          this.sendToClient(client, {
            type: 'error',
            payload: { message: 'Invalid message format' }
          });
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`Client disconnected: ${clientId}`, {
          total_clients: this.clients.size
        });
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}`, { error });
      });

      // Heartbeat
      ws.on('pong', () => {
        (ws as any).isAlive = true;
      });
    });

    // Heartbeat interval
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if ((ws as any).isAlive === false) {
          return ws.terminate();
        }
        (ws as any).isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async handleMessage(client: ClientConnection, message: WebSocketMessage): Promise<void> {
    const { type, payload } = message;

    logger.debug('WebSocket message received', {
      client_id: client.id,
      type,
      payload
    });

    switch (type) {
      case 'generate_beat':
        await this.generationHandler.handleGenerateBeat(client, payload);
        break;

      case 'generate_chapter':
        await this.generationHandler.handleGenerateChapter(client, payload);
        break;

      case 'subscribe_progress':
        await this.progressHandler.handleSubscribe(client, payload);
        break;

      case 'unsubscribe_progress':
        await this.progressHandler.handleUnsubscribe(client, payload);
        break;

      case 'blueprint_update':
        await this.blueprintHandler.handleBlueprintUpdate(client, payload);
        break;

      case 'ping':
        this.sendToClient(client, { type: 'pong', payload: { timestamp: Date.now() } });
        break;

      default:
        this.sendToClient(client, {
          type: 'error',
          payload: { message: `Unknown message type: ${type}` }
        });
    }
  }

  private sendToClient(client: ClientConnection, message: WebSocketMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public broadcast(message: WebSocketMessage, filter?: (client: ClientConnection) => boolean): void {
    this.clients.forEach((client) => {
      if (!filter || filter(client)) {
        this.sendToClient(client, message);
      }
    });
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public close(): void {
    this.wss.close();
    logger.info('WebSocket server closed');
  }
}
