const mysql = require('mysql2/promise');

async function createNDADatabase() {
  let connection;
  
  try {
    // Connect to MySQL server without specifying a database
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 10003,
      user: 'michael',
      password: 'Ei#qs9T!px@Wso'
      // Note: No database specified so we can create one
    });
    
    console.log('Connected to MySQL server');
    
    // Create the new database
    await connection.execute('CREATE DATABASE IF NOT EXISTS nda_analyzer');
    console.log('✅ Created database: nda_analyzer');
    
    // Show databases to confirm
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:', databases.map(db => db.Database));
    
    // Check if our new database exists
    const ndaExists = databases.some(db => db.Database === 'nda_analyzer');
    console.log(ndaExists ? '✅ nda_analyzer database confirmed' : '❌ nda_analyzer database not found');
    
  } catch (error) {
    console.error('Error creating database:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('❌ Access denied - you may not have CREATE DATABASE permissions');
    } else if (error.code === 'ER_DB_CREATE_EXISTS') {
      console.log('✅ Database already exists');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
}

createNDADatabase();