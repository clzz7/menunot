import { spawn } from 'child_process';
import { Pool } from 'pg';
import { promises as fs } from 'fs';

async function setupPostgresDatabase() {
  console.log('Setting up PostgreSQL database...');
  
  try {
    // Start PostgreSQL service
    const pgProcess = spawn('pg_ctl', ['start', '-D', '/tmp/postgres', '-l', '/tmp/postgres/logfile'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for PostgreSQL to start
    await new Promise((resolve, reject) => {
      pgProcess.on('close', (code) => {
        if (code === 0) {
          console.log('PostgreSQL started successfully');
          resolve(code);
        } else {
          console.log(`PostgreSQL failed to start with code ${code}`);
          reject(new Error(`PostgreSQL failed to start with code ${code}`));
        }
      });
    });

    // Create database
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: '',
      port: 5432,
    });

    await pool.query('CREATE DATABASE delivery_app;');
    console.log('Database created successfully');
    
    // Update environment variable
    process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/delivery_app';
    
    // Write to .env file
    const envContent = await fs.readFile('.env', 'utf8');
    const newEnvContent = envContent.replace(
      /# DATABASE_URL=.*$/m,
      'DATABASE_URL=postgresql://postgres@localhost:5432/delivery_app'
    );
    await fs.writeFile('.env', newEnvContent);
    
    console.log('Environment updated with DATABASE_URL');
    
    await pool.end();
    
  } catch (error) {
    console.error('Error setting up PostgreSQL:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupPostgresDatabase()
    .then(() => console.log('PostgreSQL setup complete!'))
    .catch(console.error);
}