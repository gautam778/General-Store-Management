require('dotenv').config();
const { Pool } = require('pg');

// Log environment variables (without password)
console.log('Database Configuration:');
console.log('User:', process.env.DB_USER);
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function verifyConnection() {
    try {
        console.log('\nAttempting to connect to database...');
        const client = await pool.connect();
        console.log('✓ Successfully connected to PostgreSQL database');
        
        // Test database version
        const versionResult = await client.query('SELECT version()');
        console.log('\nPostgreSQL Version:', versionResult.rows[0].version);
        
        // Test database tables
        console.log('\nChecking database tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\nAvailable tables:');
        tablesResult.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });
        
        client.release();
    } catch (err) {
        console.error('\nError connecting to the database:');
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        console.error('Error detail:', err.detail);
        
        if (err.code === '3D000') {
            console.error('\nThe database does not exist. Please create it using:');
            console.error('CREATE DATABASE general_store;');
        } else if (err.code === '28P01') {
            console.error('\nInvalid password. Please check your .env file.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('\nCould not connect to the server. Please check if PostgreSQL is running.');
        }
    } finally {
        await pool.end();
    }
}

verifyConnection(); 