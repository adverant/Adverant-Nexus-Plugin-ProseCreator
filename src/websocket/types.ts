import WebSocket from 'ws';

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface GenerationProgressPayload {
  project_id: string;
  chapter_number: number;
  beat_number?: number;
  progress?: {
    stage: string;
    progress: number;
    current_word_count?: number;
    estimated_completion?: number;
  };
  result?: {
    content: string;
    word_count: number;
    metadata: any;
  };
  error?: string;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  metadata: {
    userId?: string;
    connectedAt: Date;
  };
}
