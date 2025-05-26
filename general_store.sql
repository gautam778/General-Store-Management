CREATE DATABASE general_store;
SELECT current_database();

CREATE TABLE Store (
    Store_ID SERIAL PRIMARY KEY,
    Store_Name VARCHAR(100) NOT NULL,
    Street VARCHAR(255),
    City VARCHAR(100),
    Pincode VARCHAR(10)
);

-- Multi-valued attribute Contact_Numbers stored in a separate table
CREATE TABLE Store_Contact (
    Store_ID INT REFERENCES Store(Store_ID) ON DELETE CASCADE,
    Contact_Number VARCHAR(15),
    PRIMARY KEY (Store_ID, Contact_Number)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'store';

CREATE TABLE Employee (
    Employee_ID SERIAL PRIMARY KEY,
    First_Name VARCHAR(50),
    Last_Name VARCHAR(50),
    Salary DECIMAL(10,2),
    Position VARCHAR(50),
    Store_ID INT REFERENCES Store(Store_ID) ON DELETE SET NULL,
    Street VARCHAR(255),
    City VARCHAR(100),
    Pincode VARCHAR(10)
);

CREATE TABLE Customer (
    Customer_ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE
);

-- Multi-valued attribute Phone stored in a separate table
CREATE TABLE Customer_Phone (
    Customer_ID INT REFERENCES Customer(Customer_ID) ON DELETE CASCADE,
    Phone_Number VARCHAR(15),
    PRIMARY KEY (Customer_ID, Phone_Number)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employee';

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customer';

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customer_phone';

CREATE TABLE Supplier (
    Supplier_ID SERIAL PRIMARY KEY,
    Supplier_Name VARCHAR(100) NOT NULL,
    Street VARCHAR(255),
    City VARCHAR(100),
    Pincode VARCHAR(10)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'supplier';

-- Multi-valued attribute Contact_Numbers stored in a separate table
CREATE TABLE Supplier_Contact (
    Supplier_ID INT REFERENCES Supplier(Supplier_ID) ON DELETE CASCADE,
    Contact_Number VARCHAR(15),
    PRIMARY KEY (Supplier_ID, Contact_Number)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'supplier_contact';

CREATE TABLE Category (
    Category_ID SERIAL PRIMARY KEY,
    Category_Name VARCHAR(100) NOT NULL,
    Description TEXT
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'category';

CREATE TABLE Product (
    Product_ID SERIAL PRIMARY KEY,
    Product_Name VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock_Quantity INT NOT NULL,
    Reorder_Level INT GENERATED ALWAYS AS (Stock_Quantity / 2) STORED,
    Category_ID INT REFERENCES Category(Category_ID) ON DELETE SET NULL
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product';

-- Specialization: Perishable Products
CREATE TABLE Perishable_Product (
    Product_ID INT PRIMARY KEY REFERENCES Product(Product_ID) ON DELETE CASCADE,
    Expiration_Date DATE NOT NULL
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'perishable_product';

-- Specialization: Non-Perishable Products
CREATE TABLE Non_Perishable_Product (
    Product_ID INT PRIMARY KEY REFERENCES Product(Product_ID) ON DELETE CASCADE,
    Warranty_Period INT CHECK (Warranty_Period >= 0)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'non_perishable_product';

CREATE TABLE "Order" (
    Order_ID SERIAL PRIMARY KEY,
    Customer_ID INT REFERENCES Customer(Customer_ID) ON DELETE SET NULL,
    Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Total_Amount DECIMAL(10,2) DEFAULT 0
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Order';

-- Order contains Products (M:N Relationship)
CREATE TABLE Order_Product (
    Order_ID INT REFERENCES "Order"(Order_ID) ON DELETE CASCADE,
    Product_ID INT REFERENCES Product(Product_ID) ON DELETE CASCADE,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    PRIMARY KEY (Order_ID, Product_ID)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'order_product';

CREATE TABLE Payment (
    Payment_ID SERIAL PRIMARY KEY,
    Order_ID INT UNIQUE REFERENCES "Order"(Order_ID) ON DELETE CASCADE,
    Payment_Method VARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payment';

CREATE TABLE Supplier_Product (
    Supplier_ID INT REFERENCES Supplier(Supplier_ID) ON DELETE CASCADE,
    Product_ID INT REFERENCES Product(Product_ID) ON DELETE CASCADE,
    PRIMARY KEY (Supplier_ID, Product_ID)
);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'supplier_product';

SELECT table_name FROM information_schema.tables WHERE table_schema='public';

ALTER TABLE Employee ADD CONSTRAINT chk_salary CHECK (Salary > 0);

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'store_contact';

SELECT * FROM Employee;


INSERT INTO Store (Store_Name, Street, City, Pincode) VALUES
('FreshMart', '123 Green St', 'Delhi', '110001'),
('DailyNeeds', '456 Blue Rd', 'Mumbai', '400001'),
('SuperBazaar', '789 Market Ln', 'Bangalore', '560001'),
('MegaMart', '321 Shopping Ave', 'Kolkata', '700001'),
('QuickBuy', '555 Fast St', 'Chennai', '600001');

INSERT INTO Store (Store_Name, Street, City, Pincode) VALUES
('GroceryWorld', '789 High St', 'Delhi', '110002'),
('DailyMart', '222 Market St', 'Mumbai', '400002'),
('BigBazaar', '333 Central Rd', 'Bangalore', '560002'),
('QuickShop', '555 Quick St', 'Kolkata', '700002'),
('ExpressMart', '777 Fast Ln', 'Chennai', '600002'),
('BestStore', '888 Corner St', 'Hyderabad', '500001'),
('FamilyMart', '999 Near Park', 'Pune', '411001');

INSERT INTO Store_Contact (Store_ID, Contact_Number) VALUES
(1, '9876543210'), (1, '9123456789'),
(2, '9988776655'), (3, '9765432101'),
(4, '9123123123'), (5, '9678901234');

INSERT INTO Store_Contact (Store_ID, Contact_Number) VALUES
(6, '9988776622'), (6, '9123456722'),
(7, '9876543299'), (8, '9123456711'),
(9, '9988776655'), (10, '9876123456'),
(11, '9678901111'), (12, '9112233445');

INSERT INTO Employee (First_Name, Last_Name, Salary, Position, Store_ID, Street, City, Pincode) VALUES
('Amit', 'Sharma', 50000.00, 'Manager', 1, '123 Green St', 'Delhi', '110001'),
('Neha', 'Verma', 45000.00, 'Cashier', 2, '456 Blue Rd', 'Mumbai', '400001'),
('Raj', 'Kumar', 40000.00, 'Stock Manager', 3, '789 Market Ln', 'Bangalore', '560001'),
('Pooja', 'Rao', 42000.00, 'Cashier', 4, '321 Shopping Ave', 'Kolkata', '700001'),
('Vikas', 'Mishra', 55000.00, 'Manager', 5, '555 Fast St', 'Chennai', '600001');

INSERT INTO Employee (First_Name, Last_Name, Salary, Position, Store_ID, Street, City, Pincode) VALUES
('Sanjay', 'Gupta', 42000.00, 'Cashier', 6, '789 High St', 'Delhi', '110002'),
('Priya', 'Sharma', 47000.00, 'Manager', 7, '222 Market St', 'Mumbai', '400002'),
('Ravi', 'Verma', 41000.00, 'Stock Manager', 8, '333 Central Rd', 'Bangalore', '560002'),
('Karan', 'Joshi', 53000.00, 'Manager', 9, '555 Quick St', 'Kolkata', '700002'),
('Divya', 'Kumar', 39000.00, 'Cashier', 10, '777 Fast Ln', 'Chennai', '600002'),
('Rahul', 'Rai', 60000.00, 'Manager', 11, '888 Corner St', 'Hyderabad', '500001'),
('Simran', 'Sen', 50000.00, 'Cashier', 12, '999 Near Park', 'Pune', '411001');

INSERT INTO Customer (Name, Email) VALUES
('Ankit Singh', 'ankit@example.com'),
('Rohit Sharma', 'rohit@example.com'),
('Sanya Mehra', 'sanya@example.com'),
('Kavita Joshi', 'kavita@example.com'),
('Vishal Roy', 'vishal@example.com');

INSERT INTO Customer (Name, Email) VALUES
('Rajesh Gupta', 'rajesh@example.com'),
('Sonal Kapoor', 'sonal@example.com'),
('Amit Tiwari', 'amit@example.com'),
('Neha Chauhan', 'neha@example.com'),
('Deepak Reddy', 'deepak@example.com'),
('Ritika Sharma', 'ritika@example.com'),
('Vinod Patel', 'vinod@example.com');

INSERT INTO Customer_Phone (Customer_ID, Phone_Number) VALUES
(1, '9876543210'), (1, '9123456789'),
(2, '9988776655'), (3, '9765432101'),
(4, '9123123123'), (5, '9678901234');

INSERT INTO Customer_Phone (Customer_ID, Phone_Number) VALUES
(6, '9887766554'), (7, '9123445678'),
(8, '9876123459'), (9, '9999888877'),
(10, '9111223344'), (11, '9112233444'),
(12, '9113344555');

INSERT INTO Supplier (Supplier_Name, Street, City, Pincode) VALUES
('FreshFarms', '100 Orchard St', 'Delhi', '110001'),
('DailySupplies', '200 Bazaar Rd', 'Mumbai', '400001'),
('AgroTech', '300 Warehouse Ln', 'Bangalore', '560001'),
('UrbanFoods', '400 Market Ave', 'Kolkata', '700001'),
('QuickLogistics', '500 Supply St', 'Chennai', '600001');

INSERT INTO Supplier (Supplier_Name, Street, City, Pincode) VALUES
('FreshAgro', '222 Orchard Ln', 'Delhi', '110003'),
('QuickSupply', '333 Goods Rd', 'Mumbai', '400003'),
('AgriNeeds', '444 Storage St', 'Bangalore', '560003'),
('UrbanFresh', '555 Organic Ave', 'Kolkata', '700003'),
('GlobalFarms', '666 Local St', 'Chennai', '600003');

INSERT INTO Supplier_Contact (Supplier_ID, Contact_Number) VALUES
(1, '9876543210'), (2, '9123456789'),
(3, '9988776655'), (4, '9765432101'),
(5, '9123123123');

INSERT INTO Supplier_Contact (Supplier_ID, Contact_Number) VALUES
(6, '9876543201'), (7, '9988776611'),
(8, '9123456700'), (9, '9999888866'),
(10, '9111223355');

INSERT INTO Category (Category_Name, Description) VALUES
('Dairy', 'Milk, cheese, and other dairy products'),
('Beverages', 'Soft drinks, juices, and water'),
('Bakery', 'Bread, biscuits, and cakes'),
('Fruits & Vegetables', 'Fresh fruits and vegetables'),
('Household', 'Cleaning supplies and daily essentials');

INSERT INTO Category (Category_Name, Description) VALUES
('Frozen', 'Frozen foods like ice cream and vegetables'),
('Baking', 'Flour, sugar, and baking essentials'),
('Meat', 'Fresh meat and poultry'),
('Seafood', 'Fresh fish and shellfish'),
('Snacks', 'Chips, cookies, and packaged snacks');

INSERT INTO Product (Product_Name, Price, Stock_Quantity, Category_ID) VALUES
('Milk', 50.00, 100, 1),
('Cheese', 120.00, 50, 1),
('Coca-Cola', 40.00, 200, 2),
('Apple', 150.00, 80, 4),
('Mop', 250.00, 30, 5);

INSERT INTO Product (Product_Name, Price, Stock_Quantity, Category_ID) VALUES
('Ice Cream', 180.00, 50, 6),
('Flour', 60.00, 200, 7),
('Chicken', 250.00, 30, 8),
('Fish', 400.00, 20, 9),
('Lays Chips', 35.00, 150, 10),
('Soap', 55.00, 100, 5),
('Juice', 90.00, 75, 2);

INSERT INTO Perishable_Product (Product_ID, Expiration_Date) VALUES
(1, '2025-03-20'),
(2, '2025-03-25'),
(4, '2025-04-01');

INSERT INTO Perishable_Product (Product_ID, Expiration_Date) VALUES
(6, '2025-05-10'),
(8, '2025-04-15'),
(9, '2025-04-20'),
(10, '2025-03-30');

INSERT INTO Non_Perishable_Product (Product_ID, Warranty_Period) VALUES
(5, 12);

INSERT INTO Non_Perishable_Product (Product_ID, Warranty_Period) VALUES
(11, 24),
(12, 36);

INSERT INTO "Order" (Customer_ID, Order_Date, Total_Amount) VALUES
(1, '2025-02-20 10:30:00', 500.00),
(2, '2025-02-21 12:00:00', 1200.00),
(3, '2025-02-22 14:00:00', 600.00);

INSERT INTO "Order" (Customer_ID, Order_Date, Total_Amount) VALUES
(4, '2025-02-23 15:00:00', 700.00),
(5, '2025-02-24 18:00:00', 1400.00),
(6, '2025-02-25 20:30:00', 800.00),
(7, '2025-02-26 21:00:00', 1000.00);

INSERT INTO Order_Product (Order_ID, Product_ID, Quantity) VALUES
(1, 1, 2),
(1, 3, 1),
(2, 2, 3),
(3, 5, 1);

INSERT INTO Order_Product (Order_ID, Product_ID, Quantity) VALUES
(4, 6, 2), (5, 9, 1), (6, 12, 2), (7, 11, 3);

INSERT INTO Payment (Order_ID, Payment_Method, Amount) VALUES
(1, 'Credit Card', 500.00),
(2, 'Cash', 1200.00),
(3, 'UPI', 600.00);

INSERT INTO Payment (Order_ID, Payment_Method, Amount) VALUES
(4, 'Credit Card', 700.00),
(5, 'Debit Card', 1400.00),
(6, 'UPI', 800.00),
(7, 'Net Banking', 1000.00);

INSERT INTO Supplier_Product (Supplier_ID, Product_ID) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5);

INSERT INTO Supplier_Product (Supplier_ID, Product_ID) VALUES
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

INSERT INTO Store (Store_Name, Street, City, Pincode) VALUES
('FreshMart', '101 Greenway Blvd', 'Delhi', '110003'),
('SuperBazaar', '202 Shopping St', 'Mumbai', '400003'),
('DailyNeeds', '303 Grocery Ln', 'Bangalore', '560003'),
('MetroMart', '404 Downtown Rd', 'Kolkata', '700003'),
('EasyShop', '505 Market Ave', 'Chennai', '600003');

INSERT INTO Store (Store_Name, Street, City, Pincode) VALUES
('EasyShop', '505 Market Ave', 'Chennai', '600003');

INSERT INTO Store_Contact (Store_ID, Contact_Number) VALUES
(13, '9988776623'), (13, '9123456724'),
(14, '9876543210'), (15, '9123456712'),
(16, '9988776677'), (17, '9876123458'),
(18, '9678902222');

INSERT INTO Employee (First_Name, Last_Name, Salary, Position, Store_ID, Street, City, Pincode) VALUES
('Aditya', 'Kapoor', 52000.00, 'Cashier', 13, '101 Greenway Blvd', 'Delhi', '110003'),
('Meera', 'Iyer', 56000.00, 'Manager', 14, '202 Shopping St', 'Mumbai', '400003'),
('Rohan', 'Sharma', 47000.00, 'Stock Manager', 15, '303 Grocery Ln', 'Bangalore', '560003'),
('Pooja', 'Verma', 60000.00, 'Manager', 16, '404 Downtown Rd', 'Kolkata', '700003'),
('Aman', 'Singh', 42000.00, 'Cashier', 17, '505 Market Ave', 'Chennai', '600003');

INSERT INTO Customer (Name, Email) VALUES
('Kunal Mehta', 'kunal@example.com'),
('Anjali Sinha', 'anjali@example.com'),
('Nishant Das', 'nishant@example.com'),
('Swati Reddy', 'swati@example.com'),
('Gautam Bansal', 'gautam@example.com');

INSERT INTO Customer_Phone (Customer_ID, Phone_Number) VALUES
(13, '9887766555'), (14, '9123445679'),
(15, '9876123460'), (16, '9999888899'),
(17, '9111223345');

INSERT INTO Supplier (Supplier_Name, Street, City, Pincode) VALUES
('Organic Farms', '707 Field St', 'Delhi', '110004'),
('MegaSupply', '808 Wholesale Rd', 'Mumbai', '400004'),
('FoodHub', '909 Store Ln', 'Bangalore', '560004'),
('FreshHarvest', '1010 Agri Ave', 'Kolkata', '700004');

INSERT INTO Supplier_Contact (Supplier_ID, Contact_Number) VALUES
(11, '9876543202'), (12, '9988776612'),
(13, '9123456701'), (14, '9999888867');

INSERT INTO Category (Category_Name, Description) VALUES
('Dairy', 'Milk, cheese, and butter'),
('Beverages', 'Soft drinks and juices'),
('Vegetables', 'Fresh produce');

INSERT INTO Product (Product_Name, Price, Stock_Quantity, Category_ID) VALUES
('Milk', 60.00, 80, 11),
('Coca-Cola', 45.00, 120, 12),
('Potatoes', 30.00, 200, 13),
('Tomatoes', 40.00, 150, 13),
('Butter', 110.00, 50, 11);

INSERT INTO Perishable_Product (Product_ID, Expiration_Date) VALUES
(13, '2025-06-10'),
(15, '2025-07-05'),
(16, '2025-06-25');


SELECT * FROM Product;
INSERT INTO Product (Product_Name, Price, Stock_Quantity, Category_ID) VALUES
('Electric Kettle', 1999.99, 50, 3);

INSERT INTO Non_Perishable_Product (Product_ID, Warranty_Period) VALUES
(17, 18),
(18, 24);

INSERT INTO "Order" (Customer_ID, Order_Date, Total_Amount) VALUES
(9, '2025-03-01 12:00:00', 750.00),
(10, '2025-03-02 14:00:00', 1350.00),
(11, '2025-03-03 16:00:00', 950.00),
(12, '2025-03-04 18:30:00', 1100.00);

INSERT INTO Order_Product (Order_ID, Product_ID, Quantity) VALUES
(8, 13, 2), (9, 15, 1), (10, 18, 2), (11, 17, 3);

INSERT INTO Payment (Order_ID, Payment_Method, Amount) VALUES
(8, 'Credit Card', 750.00),
(9, 'Debit Card', 1350.00),
(10, 'UPI', 950.00),
(11, 'Net Banking', 1100.00);

INSERT INTO Supplier_Product (Supplier_ID, Product_ID) VALUES
(11, 13), (12, 14), (13, 15), (14, 16), (14, 17);


SELECT * FROM Store;
SELECT * FROM Store_Contact;
SELECT * FROM Employee;
SELECT * FROM Customer;
SELECT * FROM Customer_Phone;
SELECT * FROM Supplier;
SELECT * FROM Supplier_Contact;
SELECT * FROM Category;
SELECT * FROM Product;
SELECT * FROM Perishable_Product;
SELECT * FROM Non_Perishable_Product;
SELECT * FROM "Order";
SELECT * FROM Order_Product;
SELECT * FROM Payment;
SELECT * FROM Supplier_Product;
