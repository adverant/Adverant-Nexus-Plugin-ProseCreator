import { WebSocketMessage, ClientConnection } from '../types';
import { logger } from '../../utils/logger';

export class ProgressHandler {
  async handleSubscribe(client: ClientConnection, payload: any): Promise<void> {
    const { project_id, job_id } = payload;
    
    logger.info('Client subscribed to progress', {
      client_id: client.id,
      project_id,
      job_id
    });

    // Add subscription
    const subscription = job_id || `project_${project_id}`;
    client.subscriptions.add(subscription);

    // Send confirmation
    this.sendToClient(client, {
      type: 'subscription_confirmed',
      payload: {
        subscription,
        message: 'Subscribed to progress updates'
      }
    });
  }

  async handleUnsubscribe(client: ClientConnection, payload: any): Promise<void> {
    const { subscription } = payload;
    
    logger.info('Client unsubscribed from progress', {
      client_id: client.id,
      subscription
    });

    client.subscriptions.delete(subscription);

    this.sendToClient(client, {
      type: 'unsubscription_confirmed',
      payload: {
        subscription,
        message: 'Unsubscribed from progress updates'
      }
    });
  }

  private sendToClient(client: ClientConnection, message: WebSocketMessage): void {
    if (client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  }
}
