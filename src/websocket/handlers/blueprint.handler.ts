import { WebSocketMessage, ClientConnection } from '../types';
import { logger } from '../../utils/logger';

export class BlueprintHandler {
  async handleBlueprintUpdate(client: ClientConnection, payload: any): Promise<void> {
    const { project_id, blueprint_type } = payload;
    
    logger.info('Blueprint update requested', {
      client_id: client.id,
      project_id,
      blueprint_type
    });

    // Send update notification
    this.sendToClient(client, {
      type: 'blueprint_updated',
      payload: {
        project_id,
        blueprint_type,
        blueprint_id: `bp_${Date.now()}`,
        changes: ['Updated plot summary', 'Added new character arc'],
        version: 2
      }
    });
  }

  private sendToClient(client: ClientConnection, message: WebSocketMessage): void {
    if (client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  }
}
