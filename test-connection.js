require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function testConnection() {
    try {
        console.log('Attempting to connect to database...');
        console.log('Connection details:', {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });

        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        
        // Test a simple query
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        
        client.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        await pool.end();
    }
}

testConnection(); 