require('dotenv').config();

const mysql = require('mysql2/promise');

async function main() {
  const requiredSettings = ['MYSQL_USER', 'MYSQL_DATABASE'];
  const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);

  if (missingSettings.length > 0) {
    throw new Error(
      `Missing required environment settings: ${missingSettings.join(', ')}. ` +
        'Copy .env.example to .env and enter your MySQL settings.'
    );
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured the "users" table exists.');

    const [tables] = await connection.query('SHOW TABLES');
    console.log(`Connected to "${process.env.MYSQL_DATABASE}". Tables:`);
    console.table(tables);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('MySQL connection failed:', error.message);
  process.exitCode = 1;
});
