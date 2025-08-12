# Database Tests

This directory contains comprehensive tests for the MySQL database infrastructure.

## Test Files

### 1. `infrastructure-test.js`
**Purpose**: Validates that all database infrastructure components are properly set up.

**What it tests**:
- ✅ Database connection layer (`src/lib/db.ts`)
- ✅ Configuration system (`src/lib/config.ts`)
- ✅ Migration system (`scripts/database/run-migrations.ts`)
- ✅ Repository pattern implementation
- ✅ TypeScript type system
- ✅ API integration endpoints
- ✅ Error handling & logging
- ✅ Production readiness (dependencies, scripts)

**Run**: `node tests/database/infrastructure-test.js`

### 2. `connection-test.js`
**Purpose**: Tests actual MySQL database connectivity.

**What it tests**:
- ✅ Environment variable configuration
- ✅ MySQL connection establishment
- ✅ Basic query execution
- ✅ Table existence checking
- ✅ Connection error handling

**Run**: `node tests/database/connection-test.js`

**With MySQL credentials**:
```bash
MYSQL_HOST=your-host MYSQL_USER=your-user MYSQL_PASSWORD=your-password MYSQL_DATABASE=vvg_template node tests/database/connection-test.js
```

### 3. `repository-pattern-test.js`
**Purpose**: Tests the repository pattern with in-memory storage fallback.

**What it tests**:
- ✅ Repository class instantiation
- ✅ Document creation (CRUD operations)
- ✅ Query methods (findById, findByHash, findByUser, findByStatus)
- ✅ Update operations
- ✅ Error handling for non-existent records
- ✅ TypeScript type safety

**Run**: `node tests/database/repository-pattern-test.js`

## Running All Tests

Create a test runner script:

```bash
echo "Running Database Infrastructure Tests..."
node tests/database/infrastructure-test.js
echo -e "\n" && echo "Running Repository Pattern Tests..."
node tests/database/repository-pattern-test.js
echo -e "\n" && echo "Running Connection Tests..."
node tests/database/connection-test.js
```

## Test Results Interpretation

### Infrastructure Test
- **Score 8/8 (100%)**: All components ready for production
- **Score 7/8 (88%)**: Minor components missing, still functional
- **Score <7**: Major infrastructure gaps

### Connection Test
- **Success with tables**: Database fully operational
- **Success without tables**: Database connected, needs migration
- **Not configured**: Missing environment variables (expected in development)
- **Connection failed**: Network/credential issues

### Repository Pattern Test
- **All tests pass**: Repository layer fully functional
- **Import errors**: TypeScript/module resolution issues
- **Operation failures**: Logic errors in repository implementation

## Integration with Main Application

These tests validate that the application can:

1. **Connect to MySQL** when credentials are provided
2. **Fall back gracefully** to in-memory storage when MySQL unavailable  
3. **Create all required tables** via migration system
4. **Perform CRUD operations** through repository pattern
5. **Handle errors robustly** with proper logging
6. **Monitor health** through API endpoints

## Production Deployment

Before deploying:

1. ✅ Run `infrastructure-test.js` - should score 100%
2. ✅ Set MySQL environment variables
3. ✅ Run `connection-test.js` - should connect successfully
4. ✅ Run `npm run db:migrate` - should create all tables
5. ✅ Run `repository-pattern-test.js` - should work with real database
6. ✅ Start application - should connect automatically

## Troubleshooting

**Connection timeouts**: Check firewall/network access to MySQL server
**Access denied**: Verify username/password and database permissions  
**Module not found**: Run `npm install` to ensure all dependencies installed
**TypeScript errors**: Ensure `tsx` package installed for running TypeScript files