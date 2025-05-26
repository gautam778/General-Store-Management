require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        console.error('Connection details:', {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });
        return;
    }
    console.log('Connected to PostgreSQL database');
    release();
});

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        console.log('Fetching products...');
        const result = await pool.query(`
            SELECT 
                p.product_id as id,
                p.product_name as name,
                p.price,
                p.stock_quantity as stock,
                p.reorder_level,
                c.category_name as category
            FROM product p 
            LEFT JOIN category c ON p.category_id = c.category_id
        `);
        console.log(`Found ${result.rows.length} products`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        console.log('Fetching orders...');
        const result = await pool.query(`
            WITH order_totals AS (
                SELECT 
                    o.order_id,
                    o.order_date,
                    o.customer_id,
                    c.name as customer_name,
                    COALESCE(SUM(op.quantity * p.price), 0) as total_amount
                FROM "Order" o 
                LEFT JOIN customer c ON o.customer_id = c.customer_id
                LEFT JOIN order_product op ON o.order_id = op.order_id
                LEFT JOIN product p ON op.product_id = p.product_id
                GROUP BY o.order_id, o.order_date, o.customer_id, c.name
            )
            SELECT 
                ot.*,
                json_agg(
                    json_build_object(
                        'name', p.product_name,
                        'quantity', op.quantity,
                        'price', p.price
                    )
                ) as items
            FROM order_totals ot
            LEFT JOIN order_product op ON ot.order_id = op.order_id
            LEFT JOIN product p ON op.product_id = p.product_id
            GROUP BY ot.order_id, ot.order_date, ot.customer_id, ot.customer_name, ot.total_amount
            ORDER BY ot.order_date DESC
        `);
        console.log(`Found ${result.rows.length} orders`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all employees
app.get('/api/employees', async (req, res) => {
    try {
        console.log('Fetching employees...');
        const result = await pool.query(`
            SELECT e.*, s.store_name 
            FROM employee e 
            LEFT JOIN store s ON e.store_id = s.store_id
        `);
        console.log(`Found ${result.rows.length} employees`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
    try {
        console.log('Fetching suppliers...');
        const result = await pool.query(`
            SELECT 
                supplier_id as id,
                supplier_name as name,
                street,
                city,
                pincode
            FROM supplier
        `);
        console.log(`Found ${result.rows.length} suppliers`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get store statistics
app.get('/api/stats', async (req, res) => {
    try {
        console.log('Fetching store statistics...');
        const [stores, products, employees] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM store'),
            pool.query('SELECT COUNT(*) FROM product'),
            pool.query('SELECT COUNT(*) FROM employee')
        ]);

        const stats = {
            totalStores: parseInt(stores.rows[0].count),
            totalProducts: parseInt(products.rows[0].count),
            totalEmployees: parseInt(employees.rows[0].count)
        };
        
        console.log('Store statistics:', stats);
        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    const { customer_id, products } = req.body;
    console.log('Creating new order:', { customer_id, products });
    
    try {
        // Start transaction
        await pool.query('BEGIN');
        
        // Create order
        const orderResult = await pool.query(
            'INSERT INTO "Order" (customer_id, order_date) VALUES ($1, CURRENT_TIMESTAMP) RETURNING order_id',
            [customer_id]
        );
        
        const orderId = orderResult.rows[0].order_id;
        console.log('Created order with ID:', orderId);
        
        // Add order products
        for (const product of products) {
            await pool.query(
                'INSERT INTO order_product (order_id, product_id, quantity) VALUES ($1, $2, $3)',
                [orderId, product.id, product.quantity]
            );
        }
        
        // Commit transaction
        await pool.query('COMMIT');
        console.log('Order created successfully');
        
        res.json({ orderId, message: 'Order created successfully' });
    } catch (err) {
        // Rollback transaction on error
        await pool.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new customer
app.post('/api/customers', async (req, res) => {
    const { name, email } = req.body;
    console.log('Creating new customer:', { name, email });
    
    try {
        const result = await pool.query(
            'INSERT INTO customer (name, email) VALUES ($1, $2) RETURNING customer_id',
            [name, email]
        );
        
        const customerId = result.rows[0].customer_id;
        console.log('Created customer with ID:', customerId);
        
        res.json({ customer_id: customerId });
    } catch (err) {
        console.error('Error creating customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new payment
app.post('/api/payments', async (req, res) => {
    const { order_id, payment_method, amount } = req.body;
    console.log('Creating new payment:', { order_id, payment_method, amount });
    
    try {
        const result = await pool.query(
            'INSERT INTO payment (order_id, payment_method, amount, date) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING payment_id',
            [order_id, payment_method, amount]
        );
        
        const paymentId = result.rows[0].payment_id;
        console.log('Created payment with ID:', paymentId);
        
        res.json({ payment_id: paymentId });
    } catch (err) {
        console.error('Error creating payment:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        console.log('Fetching categories...');
        const result = await pool.query('SELECT category_id, category_name FROM category ORDER BY category_name');
        console.log(`Found ${result.rows.length} categories`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all stores
app.get('/api/stores', async (req, res) => {
    try {
        console.log('Fetching stores...');
        const result = await pool.query('SELECT * FROM store ORDER BY store_name');
        console.log(`Found ${result.rows.length} stores`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching stores:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all cities
app.get('/api/cities', async (req, res) => {
    try {
        console.log('Fetching cities...');
        const result = await pool.query(`
            SELECT DISTINCT city 
            FROM store 
            ORDER BY city
        `);
        console.log(`Found ${result.rows.length} cities`);
        res.json(result.rows.map(row => row.city));
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new product
app.post('/api/products', async (req, res) => {
    const { name, price, stock, category_id } = req.body;
    console.log('Creating new product:', { name, price, stock, category_id });
    
    try {
        const result = await pool.query(
            'INSERT INTO product (product_name, price, stock_quantity, category_id) VALUES ($1, $2, $3, $4) RETURNING product_id',
            [name, price, stock, category_id]
        );
        
        const productId = result.rows[0].product_id;
        console.log('Created product with ID:', productId);
        
        res.json({ product_id: productId });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new employee
app.post('/api/employees', async (req, res) => {
    const { first_name, last_name, position, salary, store_id, street, city, pincode } = req.body;
    console.log('Creating new employee with data:', {
        first_name,
        last_name,
        position,
        salary,
        store_id,
        street,
        city,
        pincode
    });
    
    try {
        const result = await pool.query(
            'INSERT INTO employee (first_name, last_name, position, salary, store_id, street, city, pincode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [first_name, last_name, position, salary, store_id, street, city, pincode]
        );
        
        const newEmployee = result.rows[0];
        console.log('Created employee:', newEmployee);
        
        res.json({ 
            employee_id: newEmployee.employee_id,
            employee: newEmployee 
        });
    } catch (err) {
        console.error('Error creating employee:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Create new supplier
app.post('/api/suppliers', async (req, res) => {
    const { name, street, city, pincode } = req.body;
    console.log('Creating new supplier:', { name, street, city, pincode });
    
    try {
        const result = await pool.query(
            'INSERT INTO supplier (supplier_name, street, city, pincode) VALUES ($1, $2, $3, $4) RETURNING supplier_id',
            [name, street, city, pincode]
        );
        
        const supplierId = result.rows[0].supplier_id;
        console.log('Created supplier with ID:', supplierId);
        
        res.json({ supplier_id: supplierId });
    } catch (err) {
        console.error('Error creating supplier:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
}); 