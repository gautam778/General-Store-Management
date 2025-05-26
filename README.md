# General Store Database

A comprehensive SQL database system for managing a general store's operations, including inventory, sales, employees, customers, and suppliers.

## Database Schema

The database consists of the following main tables:

### Core Tables
- `Store`: Stores information about different store locations
- `Employee`: Manages employee details and their store assignments
- `Customer`: Stores customer information
- `Supplier`: Maintains supplier records
- `Category`: Product categories
- `Product`: Main product information
- `Order`: Customer orders
- `Payment`: Payment records for orders

### Relationship Tables
- `Store_Contact`: Multiple contact numbers for stores
- `Customer_Phone`: Multiple phone numbers for customers
- `Supplier_Contact`: Multiple contact numbers for suppliers
- `Order_Product`: Products in each order
- `Supplier_Product`: Products supplied by each supplier

### Specialized Tables
- `Perishable_Product`: Products with expiration dates
- `Non_Perishable_Product`: Products with warranty periods

## Features

1. **Store Management**
   - Multiple store locations
   - Store contact information
   - Employee assignments

2. **Inventory Management**
   - Product categorization
   - Stock tracking
   - Perishable and non-perishable product handling
   - Supplier relationships

3. **Customer Management**
   - Customer profiles
   - Multiple contact numbers
   - Order history

4. **Order Processing**
   - Order tracking
   - Payment processing
   - Multiple payment methods

5. **Supplier Management**
   - Supplier profiles
   - Contact information
   - Product supply relationships

## Database Structure

### Key Relationships
- One-to-Many:
  - Store to Employees
  - Store to Store_Contact
  - Customer to Orders
  - Category to Products
  - Supplier to Supplier_Contact

- Many-to-Many:
  - Orders to Products (via Order_Product)
  - Suppliers to Products (via Supplier_Product)

### Special Features
- Automatic timestamp generation for orders and payments
- Check constraints for data validation
- Cascading deletes for maintaining referential integrity
- Generated columns for inventory management

## Setup Instructions

1. Create the database:
```sql
CREATE DATABASE general_store;
```

2. Run the SQL script:
```sql
\i general_store.sql
```

## Sample Queries

### Basic Queries
```sql
-- List all stores
SELECT * FROM Store;

-- Find products in a specific category
SELECT * FROM Product WHERE Category_ID = 1;

-- Get customer order history
SELECT * FROM "Order" WHERE Customer_ID = 1;
```

### Advanced Queries
```sql
-- Find products with low stock
SELECT * FROM Product WHERE Stock_Quantity < Reorder_Level;

-- Get total sales by store
SELECT s.Store_Name, SUM(o.Total_Amount)
FROM Store s
JOIN Employee e ON s.Store_ID = e.Store_ID
JOIN "Order" o ON e.Employee_ID = o.Employee_ID
GROUP BY s.Store_Name;
```

## Data Types

- `SERIAL`: Auto-incrementing primary keys
- `VARCHAR`: Variable-length strings
- `DECIMAL`: Precise decimal numbers
- `INT`: Integer values
- `TIMESTAMP`: Date and time values
- `DATE`: Date values

## Constraints

- Primary Keys: All main tables have SERIAL primary keys
- Foreign Keys: Maintain referential integrity
- Check Constraints: Validate data (e.g., salary > 0)
- Unique Constraints: Ensure data uniqueness where required

## Maintenance

Regular maintenance tasks:
1. Monitor stock levels
2. Update product information
3. Manage employee records
4. Track supplier relationships
5. Process customer orders

## Security Considerations

- Use appropriate user permissions
- Implement data validation
- Regular backups
- Audit logging for sensitive operations

## Future Enhancements

1. Add user authentication
2. Implement inventory alerts
3. Add sales analytics
4. Create reporting views
5. Add customer loyalty program

## Contributing

Feel free to submit issues and enhancement requests. 