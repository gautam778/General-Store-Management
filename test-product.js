require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function checkProductData() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        // Get product table structure
        console.log('\nProduct table structure:');
        const structureResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'product'
        `);
        console.log('Columns:', structureResult.rows);

        // Get product data with category
        console.log('\nProduct data:');
        const dataResult = await client.query(`
            SELECT p.*, c.category_name 
            FROM product p 
            LEFT JOIN category c ON p.category_id = c.category_id
        `);
        console.log('Products:', JSON.stringify(dataResult.rows, null, 2));

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkProductData(); 