import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { EOSApiService } from '../services/eosApiService';
import { MCPTools } from './tools';
import { MCPError } from '../types';

export class EOSMCPServer {
  private server: Server;
  private eosApi: EOSApiService;
  private mcpTools: MCPTools;

  constructor() {
    this.eosApi = new EOSApiService();
    this.mcpTools = new MCPTools(this.eosApi);
    
    // Initialize MCP server
    this.server = new Server(
      {
        name: 'eos-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.mcpTools.getTools();
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })) as Tool[],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tools = this.mcpTools.getTools();
      const tool = tools.find(t => t.name === name);

      if (!tool) {
        throw new MCPError(`Tool '${name}' not found`, 'TOOL_NOT_FOUND');
      }

      try {
        const result = await tool.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        throw new MCPError(
          error.message || 'Tool execution failed',
          'TOOL_EXECUTION_ERROR',
          { tool: name, error: error.message }
        );
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('EOS MCP Server started successfully');
    } catch (error) {
      console.error('Failed to start EOS MCP Server:', error);
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    try {
      await this.server.close();
      console.error('EOS MCP Server stopped');
    } catch (error) {
      console.error('Error stopping EOS MCP Server:', error);
      throw error;
    }
  }
} 