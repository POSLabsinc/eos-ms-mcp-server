import dotenv from 'dotenv';
import { EOSMCPServer } from './mcp/server';
import { RestApiServer } from './rest/server';

// Load environment variables
dotenv.config();

async function main() {
  const mode = process.argv[2] || 'mcp';
  
  try {
    if (mode === 'mcp') {
      // Run as MCP server
      const mcpServer = new EOSMCPServer();
      await mcpServer.start();
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.error('Received SIGINT, shutting down...');
        await mcpServer.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.error('Received SIGTERM, shutting down...');
        await mcpServer.stop();
        process.exit(0);
      });
      
    } else if (mode === 'rest') {
      // Run as REST API server
      const restServer = new RestApiServer();
      await restServer.start();
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.error('Received SIGINT, shutting down...');
        await restServer.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.error('Received SIGTERM, shutting down...');
        await restServer.stop();
        process.exit(0);
      });
      
    } else {
      console.error('Invalid mode. Use "mcp" or "rest"');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 