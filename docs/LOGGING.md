# Logging Configuration Guide

## Overview

This template uses **Pino** for high-performance structured logging with environment-based configuration to minimize log verbosity in production while maintaining debugging capabilities.

## Key Features

- **5x Performance**: Pino is significantly faster than Winston
- **Structured JSON Logging**: Machine-readable logs for production
- **Conditional Logging**: Feature flags control verbose operations
- **Module-Specific Loggers**: Separate loggers for different components
- **Runtime Control**: Change log levels without restarting
- **Log Sampling**: Reduce high-volume debug logs

## Environment Variables

### Core Configuration

```bash
# Log level: debug, info, warn, error
LOG_LEVEL=info  # Default: warn (production), info (staging), debug (development)

# Feature-specific flags (default: false in production)
LOG_DB_QUERIES=false      # Database query logging
LOG_CHAT_DETAILS=false    # OpenAI request/response details
LOG_API_STEPS=false       # Detailed API operation steps
LOG_STARTUP=false         # Verbose startup information
```

### Admin Configuration

```bash
# Comma-separated list of admin emails for runtime control
ADMIN_EMAILS=admin@example.com,developer@example.com
```

## Log Levels by Environment

### Production (`LOG_LEVEL=warn`)
- Only warnings and errors are logged
- All feature flags disabled by default
- Minimal output for performance

### Staging (`LOG_LEVEL=info`)
- Info level and above logged
- Startup logging enabled
- Other features disabled

### Development (`LOG_LEVEL=debug`)
- All logs including debug
- All features enabled by default
- Pretty-printed console output

## Module-Specific Loggers

The application uses specialized loggers for different components:

- **`api`**: HTTP request/response logging
- **`db`**: Database operations (conditional)
- **`chat`**: OpenAI interactions (conditional)
- **`queue`**: Background job processing
- **`documents`**: File operations
- **`auth`**: Authentication events
- **`startup`**: Application initialization

## Usage Examples

### Basic Logging

```typescript
import { logger } from '@/lib/pino-logger';

// General logging
logger.base.info('Application started');
logger.base.error({ err: error }, 'Failed to start');
```

### API Logging

```typescript
import { apiLogger } from '@/lib/pino-logger';

// Automatic request/response logging
apiLogger.start('GET', '/api/users');
apiLogger.end('GET', '/api/users', 200, 45); // 45ms
```

### Database Logging (Conditional)

```typescript
import { dbLogger } from '@/lib/pino-logger';

// Only logs if LOG_DB_QUERIES=true
dbLogger.query('SELECT * FROM users', 12, 5); // 12ms, 5 rows
```

### Chat/OpenAI Logging (Conditional)

```typescript
import { chatLogger } from '@/lib/pino-logger';

// Only logs if LOG_CHAT_DETAILS=true
chatLogger.request('gpt-4', 150); // 150 tokens
chatLogger.content(responseText); // Only first 200 chars
```

## Runtime Log Control

Admin users can change log levels and features at runtime:

### Get Current Configuration
```bash
GET /api/admin/log-level
```

### Change Log Level
```bash
POST /api/admin/log-level
{
  "level": "debug"
}
```

### Toggle Feature Flags
```bash
PUT /api/admin/log-level
{
  "features": {
    "dbQueries": true,
    "chatDetails": false,
    "apiSteps": true,
    "startup": false
  }
}
```

## PM2 Configuration

The `ecosystem.config.js` file includes environment-specific logging settings:

```javascript
// Production
env: {
  LOG_LEVEL: 'warn',
  LOG_DB_QUERIES: 'false',
  LOG_CHAT_DETAILS: 'false',
  LOG_API_STEPS: 'false',
  LOG_STARTUP: 'false'
}
```

## Log Output Examples

### Production (Minimal)
```json
{"level":"WARN","time":"2024-01-15T10:30:45.123Z","msg":"Database connection slow","duration":1500}
{"level":"ERROR","time":"2024-01-15T10:31:12.456Z","msg":"API request failed","err":{"message":"Timeout"}}
```

### Development (Pretty)
```
2024-01-15 10:30:45.123 INFO: Application started
2024-01-15 10:30:45.234 DEBUG: Database connected {host: "localhost", database: "vvg_template"}
2024-01-15 10:30:45.456 INFO: → GET /api/users
2024-01-15 10:30:45.567 DEBUG: Query executed {query: "SELECT * FROM users", duration: 12, rows: 5}
2024-01-15 10:30:45.678 INFO: ← GET /api/users 200 222ms
```

## Best Practices

1. **Use Appropriate Log Levels**
   - `error`: Critical issues requiring immediate attention
   - `warn`: Important issues that don't stop operation
   - `info`: Key application events and metrics
   - `debug`: Detailed information for debugging

2. **Avoid Logging Sensitive Data**
   - Pino automatically redacts common sensitive fields
   - Never log passwords, tokens, or personal data

3. **Use Structured Logging**
   ```typescript
   // Good
   logger.info({ userId, action, duration }, 'User action completed');
   
   // Avoid
   logger.info(`User ${userId} completed ${action} in ${duration}ms`);
   ```

4. **Conditional Verbose Logging**
   ```typescript
   // Only log in development or when flag is enabled
   if (logger.db.isLevelEnabled('debug')) {
     logger.db.debug({ query, params }, 'Executing query');
   }
   ```

## Troubleshooting

### Logs Too Verbose
1. Check `LOG_LEVEL` environment variable
2. Ensure feature flags are disabled in production
3. Use log sampling for high-frequency operations

### Missing Logs
1. Verify log level allows the message type
2. Check if conditional logging flag is enabled
3. Ensure logger module is properly imported

### Performance Issues
1. Disable `LOG_DB_QUERIES` in production
2. Set `LOG_LEVEL=warn` or `error`
3. Use log sampling for debug logs

## Migration from Winston

The logging API maintains backward compatibility:

```typescript
// Old Winston code
logger.info('Message', { data });

// Works with Pino (same API)
logger.info('Message', { data });
```

Key differences:
- Pino uses `err` property for errors (not `error`)
- Metadata comes before message in Pino
- No custom transports needed (PM2 handles files)