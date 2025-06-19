# EOS MCP Server

A Model Context Protocol (MCP) server implementation that integrates with EOS APIs for user management, authentication, and other functionalities.

## Features

- **MCP Protocol Support**: Full MCP server implementation for AI model integration
- **EOS API Integration**: Seamless integration with browserapi.eatos.net
- **REST API Wrapper**: Additional REST API for easier testing and integration
- **User Management**: Complete user lifecycle management (login, invite, update, delete)
- **TypeScript**: Full TypeScript support with strict typing
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to EOS APIs (browserapi.eatos.net)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eos-ms-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# EOS API Configuration
EOS_API_BASE_URL=https://browserapi.eatos.net
EOS_API_TIMEOUT=30000

# MCP Server Configuration
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# Authentication
JWT_SECRET=your-jwt-secret-here
TOKEN_EXPIRY=24h

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## Usage

### Running as MCP Server

```bash
# Build the project
npm run build

# Run as MCP server (default)
npm start

# Or explicitly run as MCP server
npm run start mcp
```

### Running as REST API Server

```bash
# Run as REST API server
npm run start rest

# Or run in development mode
npm run dev rest
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Watch for changes
npm run watch

# Run tests
npm test
```

## API Endpoints

### MCP Tools

The MCP server exposes the following tools:

1. **eos_login** - Authenticate user with EOS API
   - Input: `{ username: string, password: string }`

2. **eos_get_current_user** - Get current authenticated user profile
   - Input: `{}`

3. **eos_get_users** - Get all users (admin only)
   - Input: `{}`

4. **eos_invite_user** - Invite a new user
   - Input: `{ email: string, role: string, firstName?: string, lastName?: string }`

5. **eos_update_user_status** - Update user status
   - Input: `{ userId: string, status: 'active' | 'inactive' }`

6. **eos_delete_user** - Delete a user
   - Input: `{ userId: string }`

7. **eos_health_check** - Check EOS API connectivity
   - Input: `{}`

### REST API Endpoints

When running as REST API server:

- `GET /health` - Health check
- `POST /auth/login` - User login
- `GET /users/current` - Get current user
- `GET /users` - Get all users
- `POST /users/invite` - Invite new user
- `PATCH /users/:userId/status` - Update user status
- `DELETE /users/:userId` - Delete user

## Example Usage

### MCP Client Integration

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'eos-mcp-client',
  version: '1.0.0',
});

await client.connect(new StdioClientTransport());

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools);

// Login
const loginResult = await client.callTool({
  name: 'eos_login',
  arguments: {
    username: 'mp5@eigital.com',
    password: 'Test@055'
  }
});

console.log('Login result:', loginResult);
```

### REST API Usage

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mp5@eigital.com",
    "password": "Test@055"
  }'

# Get current user (requires auth token)
curl -X GET http://localhost:3000/users/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EOS_API_BASE_URL` | EOS API base URL | `https://browserapi.eatos.net` |
| `EOS_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `MCP_SERVER_PORT` | REST API server port | `3000` |
| `MCP_SERVER_HOST` | REST API server host | `localhost` |
| `JWT_SECRET` | JWT secret for token signing | - |
| `TOKEN_EXPIRY` | Token expiration time | `24h` |
| `LOG_LEVEL` | Logging level | `info` |
| `NODE_ENV` | Environment | `development` |

## Error Handling

The server includes comprehensive error handling:

- **EOSApiError**: For API communication errors
- **MCPError**: For MCP protocol errors
- **ValidationError**: For input validation errors

All errors include appropriate HTTP status codes and detailed error messages.

## Security

- CORS protection
- Helmet security headers
- Input validation
- Rate limiting (configurable)
- JWT token management

## Development

### Project Structure

```
src/
├── index.ts              # Main entry point
├── types/                # TypeScript type definitions
│   └── index.ts
├── services/             # Business logic services
│   └── eosApiService.ts  # EOS API integration
├── mcp/                  # MCP protocol implementation
│   ├── server.ts         # MCP server
│   └── tools.ts          # MCP tools
└── rest/                 # REST API implementation
    └── server.ts         # REST API server
```

### Adding New Tools

1. Add the tool definition in `src/mcp/tools.ts`
2. Add corresponding API method in `src/services/eosApiService.ts`
3. Add REST endpoint in `src/rest/server.ts` (if needed)
4. Update types in `src/types/index.ts`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="login"
```

## Troubleshooting

### Common Issues

1. **MCP SDK not found**: Ensure you have the latest MCP SDK installed
2. **API connection failed**: Check your network and EOS API availability
3. **Authentication errors**: Verify your credentials and API permissions
4. **Port conflicts**: Change the port in `.env` file

### Logs

Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### v1.0.0
- Initial release
- MCP server implementation
- REST API wrapper
- User management tools
- Authentication integration