import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { usageTrackingMiddleware, flushPendingReports } from './middleware/usage-tracking';
import { WebSocketServer } from './websocket/WebSocketServer';
import routes from './routes';

/**
 * NexusProseCreator API Server
 * Creative Content Generation Microservice
 */
class ProseCreatorServer {
  private app: Express;
  private wsServer: WebSocketServer | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: config.server.corsOrigins,
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Usage tracking middleware (after body parsing)
    this.app.use(usageTrackingMiddleware);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      next();
    });

    logger.info('Middleware setup complete');
  }

  private setupRoutes(): void {
    // Health check (no namespace)
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date() });
    });

    this.app.get('/healthz', (req, res) => {
      res.json({ status: 'ok' });
    });

    // API routes with namespace
    this.app.use('/prosecreator/api', routes);

    // Internal routes (no rate limiting)
    // this.app.use('/prosecreator/api/internal', internalRoutes);

    logger.info('Routes mounted successfully');
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    logger.info('Error handling setup complete');
  }

  public async start(): Promise<void> {
    try {
      // Start HTTP server
      const port = config.server.port;
      this.app.listen(port, () => {
        logger.info(`NexusProseCreator API server started on port ${port}`);
        logger.info(`Environment: ${config.server.nodeEnv}`);
        logger.info(`API Base URL: http://localhost:${port}/prosecreator/api`);
      });

      // Start WebSocket server
      if (config.features.enableWebSocket) {
        const wsPort = config.server.wsPort;
        this.wsServer = new WebSocketServer(wsPort);
        logger.info(`WebSocket server started on port ${wsPort}`);
      }

      // TODO: Initialize database connections
      // await this.initializeDatabases();

      logger.info('='.repeat(60));
      logger.info('NexusProseCreator is ready!');
      logger.info('='.repeat(60));

    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down gracefully...');

    // Flush pending usage reports
    await flushPendingReports();
    logger.info('Usage reports flushed');

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }

    // TODO: Close database connections

    logger.info('Shutdown complete');
    process.exit(0);
  }
}

// Create and start server
const server = new ProseCreatorServer();

// Graceful shutdown handlers
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Start server
server.start().catch((error) => {
  logger.error('Fatal error during startup', { error });
  process.exit(1);
});

export default server;
