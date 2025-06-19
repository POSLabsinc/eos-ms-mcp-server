import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { EOSApiService } from '../services/eosApiService';
import { LoginRequest, InviteUserRequest } from '../types';

export class RestApiServer {
  private app: express.Application;
  private server: any;
  private eosApi: EOSApiService;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.MCP_SERVER_PORT || '3000', 10);
    this.eosApi = new EOSApiService();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' ? false : true,
      credentials: true
    }));
    
    // Logging
    this.app.use(morgan('combined'));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (req, res) => {
      try {
        const isHealthy = await this.eosApi.healthCheck();
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          eosApi: isHealthy ? 'connected' : 'disconnected'
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Health check failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Authentication routes
    this.app.post('/auth/login', async (req, res) => {
      try {
        const credentials: LoginRequest = req.body;
        
        if (!credentials.username || !credentials.password) {
          return res.status(400).json({
            success: false,
            message: 'Username and password are required'
          });
        }

        const result = await this.eosApi.login(credentials);
        res.json(result);
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Login failed',
          error: error.statusCode || 500
        });
      }
    });

    // User management routes
    this.app.get('/users/current', async (req, res) => {
      try {
        const user = await this.eosApi.getCurrentUser();
        res.json({
          success: true,
          data: user
        });
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Failed to get current user',
          error: error.statusCode || 500
        });
      }
    });

    this.app.get('/users', async (req, res) => {
      try {
        const users = await this.eosApi.getUsers();
        res.json({
          success: true,
          data: users
        });
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Failed to get users',
          error: error.statusCode || 500
        });
      }
    });

    this.app.post('/users/invite', async (req, res) => {
      try {
        const inviteData: InviteUserRequest = req.body;
        
        if (!inviteData.email || !inviteData.role) {
          return res.status(400).json({
            success: false,
            message: 'Email and role are required'
          });
        }

        const result = await this.eosApi.inviteUser(inviteData);
        res.json(result);
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Failed to invite user',
          error: error.statusCode || 500
        });
      }
    });

    this.app.patch('/users/:userId/status', async (req, res) => {
      try {
        const { userId } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Valid status (active/inactive) is required'
          });
        }

        const result = await this.eosApi.updateUserStatus(userId, status);
        res.json(result);
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Failed to update user status',
          error: error.statusCode || 500
        });
      }
    });

    this.app.delete('/users/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const result = await this.eosApi.deleteUser(userId);
        res.json(result);
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Failed to delete user',
          error: error.statusCode || 500
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // Error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`REST API Server running on port ${this.port}`);
        console.log(`Health check: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('REST API Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
} 