import { MCPTool } from '../types';
import { EOSApiService } from '../services/eosApiService';

export class MCPTools {
  private eosApi: EOSApiService;

  constructor(eosApi: EOSApiService) {
    this.eosApi = eosApi;
  }

  /**
   * Get all available MCP tools
   */
  getTools(): MCPTool[] {
    return [
      this.getLoginTool(),
      this.getCurrentUserTool(),
      this.getUsersTool(),
      this.getInviteUserTool(),
      this.getUpdateUserStatusTool(),
      this.getDeleteUserTool(),
      this.getHealthCheckTool(),
    ];
  }

  private getLoginTool(): MCPTool {
    return {
      name: 'eos_login',
      description: 'Authenticate user with EOS API using username and password',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'User email or username'
          },
          password: {
            type: 'string',
            description: 'User password'
          }
        },
        required: ['username', 'password']
      },
      handler: async (args: { username: string; password: string }) => {
        try {
          const result = await this.eosApi.login(args);
          return {
            success: true,
            message: 'Login successful',
            data: {
              user: result.data?.user,
              token: result.data?.token ? '***' : undefined // Don't expose token in response
            }
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Login failed',
            error: error.statusCode || 500
          };
        }
      }
    };
  }

  private getCurrentUserTool(): MCPTool {
    return {
      name: 'eos_get_current_user',
      description: 'Get current authenticated user profile',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        try {
          const user = await this.eosApi.getCurrentUser();
          return {
            success: true,
            message: 'User profile retrieved successfully',
            data: user
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Failed to get user profile',
            error: error.statusCode || 500
          };
        }
      }
    };
  }

  private getUsersTool(): MCPTool {
    return {
      name: 'eos_get_users',
      description: 'Get all users (admin only)',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        try {
          const users = await this.eosApi.getUsers();
          return {
            success: true,
            message: `Retrieved ${users.length} users`,
            data: users
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Failed to get users',
            error: error.statusCode || 500
          };
        }
      }
    };
  }

  private getInviteUserTool(): MCPTool {
    return {
      name: 'eos_invite_user',
      description: 'Invite a new user to the system',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Email address of the user to invite'
          },
          role: {
            type: 'string',
            description: 'Role to assign to the user',
            enum: ['admin', 'manager', 'user']
          },
          firstName: {
            type: 'string',
            description: 'First name of the user'
          },
          lastName: {
            type: 'string',
            description: 'Last name of the user'
          }
        },
        required: ['email', 'role']
      },
      handler: async (args: { email: string; role: string; firstName?: string; lastName?: string }) => {
        try {
          const result = await this.eosApi.inviteUser(args);
          return {
            success: true,
            message: 'User invited successfully',
            data: result
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Failed to invite user',
            error: error.statusCode || 500
          };
        }
      }
    };
  }

  private getUpdateUserStatusTool(): MCPTool {
    return {
      name: 'eos_update_user_status',
      description: 'Update user status (active/inactive)',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'ID of the user to update'
          },
          status: {
            type: 'string',
            description: 'New status for the user',
            enum: ['active', 'inactive']
          }
        },
        required: ['userId', 'status']
      },
      handler: async (args: { userId: string; status: 'active' | 'inactive' }) => {
        try {
          const result = await this.eosApi.updateUserStatus(args.userId, args.status);
          return {
            success: true,
            message: `User status updated to ${args.status}`,
            data: result
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Failed to update user status',
            error: error.statusCode || 500
          };
        }
      }
    };
  }

  private getDeleteUserTool(): MCPTool {
    return {
      name: 'eos_delete_user',
      description: 'Delete a user from the system',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'ID of the user to delete'
          }
        },
        required: ['userId']
      },
      handler: async (args: { userId: string }) => {
        try {
          const result = await this.eosApi.deleteUser(args.userId);
          return {
            success: true,
            message: 'User deleted successfully',
            data: result
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Failed to delete user',
            error: error.statusCode || 500
          };
        }
      }
    };
  }

  private getHealthCheckTool(): MCPTool {
    return {
      name: 'eos_health_check',
      description: 'Check EOS API connectivity and health',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        try {
          const isHealthy = await this.eosApi.healthCheck();
          return {
            success: true,
            message: isHealthy ? 'EOS API is healthy' : 'EOS API is not responding',
            data: {
              status: isHealthy ? 'healthy' : 'unhealthy',
              timestamp: new Date().toISOString()
            }
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Health check failed',
            error: error.statusCode || 500
          };
        }
      }
    };
  }
} 