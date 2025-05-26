require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function checkSupplierData() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        // Get supplier table structure
        console.log('\nSupplier table structure:');
        const structureResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'supplier'
        `);
        console.log('Columns:', structureResult.rows);

        // Get supplier data
        console.log('\nSupplier data:');
        const dataResult = await client.query('SELECT * FROM supplier');
        console.log('Suppliers:', JSON.stringify(dataResult.rows, null, 2));

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkSupplierData(); 