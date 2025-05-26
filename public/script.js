// Navigation
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

// Toggle navigation
burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('toggle');
});

// Switch sections
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// Cart functionality
let cart = [];
let currentProduct = null;

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showQuantityDialog(product) {
    currentProduct = product;
    const dialog = document.getElementById('quantity-dialog');
    const quantityInput = document.getElementById('quantity');
    const availableStock = document.getElementById('available-stock');
    const productName = document.getElementById('dialog-product-name');
    const productPrice = document.getElementById('dialog-product-price');
    const dialogTotal = document.getElementById('dialog-total');
    const stockInfo = document.querySelector('.stock-info');
    
    // Set initial values
    quantityInput.value = 1;
    availableStock.textContent = product.stock;
    productName.textContent = product.name;
    productPrice.textContent = `₹${product.price}`;
    dialogTotal.textContent = `₹${product.price}`;
    
    // Update stock info styling
    if (product.stock < 50) {
        stockInfo.classList.add('low-stock');
    } else {
        stockInfo.classList.remove('low-stock');
    }
    
    // Add event listener for quantity changes
    quantityInput.addEventListener('input', updateTotal);
    
    showModal('quantity-dialog');
}

function updateTotal() {
    const quantityInput = document.getElementById('quantity');
    const dialogTotal = document.getElementById('dialog-total');
    const quantity = parseInt(quantityInput.value);
    
    if (currentProduct && quantity > 0) {
        const total = quantity * currentProduct.price;
        dialogTotal.textContent = `₹${total.toFixed(2)}`;
    }
}

function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartCount();
    updateCartDisplay();
    saveCart();
    
    // Update product stock in the UI
    const productCard = document.querySelector(`[data-product-id="${product.id}"]`);
    if (productCard) {
        const stockElement = productCard.querySelector('.product-stock');
        const newStock = product.stock - quantity;
        stockElement.textContent = `Stock: ${newStock}${newStock < 50 ? ' (Low Stock!)' : ''}`;
        stockElement.className = `product-stock ${newStock < 50 ? 'low-stock' : ''}`;
        
        // Show notification if stock becomes low after adding to cart
        if (newStock < 50) {
            showNotification(`⚠️ Low stock alert: ${product.name} now has only ${newStock} items left!`, 'warning');
        }
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    updateCartDisplay();
    saveCart();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const subtotal = document.getElementById('subtotal');
    const tax = document.getElementById('tax');
    const total = document.getElementById('total');
    
    cartItems.innerHTML = '';
    let totalAmount = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        totalAmount += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="item-category">${item.category}</p>
                <p class="item-price">₹${item.price}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn decrease" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn increase" data-index="${index}">+</button>
            </div>
            <button class="btn-remove" data-index="${index}">Remove</button>
        `;
        cartItems.appendChild(itemElement);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                updateCartDisplay();
                saveCart();
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            cart[index].quantity++;
            updateCartDisplay();
            saveCart();
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            removeFromCart(index);
        });
    });
    
    const taxAmount = totalAmount * 0.18;
    const finalTotal = totalAmount + taxAmount;
    
    subtotal.textContent = `₹${totalAmount.toFixed(2)}`;
    tax.textContent = `₹${taxAmount.toFixed(2)}`;
    total.textContent = `₹${finalTotal.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        updateCartDisplay();
    }
}

// Load cart on page load
loadCart();

// Fetch and display products
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Add notification system
function showNotification(message, type = 'warning') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Force a reflow to ensure the animation works
    notification.offsetHeight;
    
    // Add show class for animation
    notification.classList.add('show');
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Modify displayProducts function to check stock levels
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    let lowStockProducts = [];

    products.forEach(product => {
        const isLowStock = product.stock < 50;
        if (isLowStock) {
            lowStockProducts.push(product);
        }

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        productCard.innerHTML = `
            <div class="product-info">
                <h3>${product.name || 'Unnamed Product'}</h3>
                <p class="product-category">${product.category || 'Uncategorized'}</p>
                <p class="product-price">₹${product.price || 0}</p>
                <p class="product-stock ${isLowStock ? 'low-stock' : ''}">
                    Stock: ${product.stock || 0}
                    ${isLowStock ? ' (Low Stock!)' : ''}
                </p>
                <button class="btn-primary" onclick="showQuantityDialog(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    Add to Cart
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    // Show notification if there are low stock products
    if (lowStockProducts.length > 0) {
        const message = lowStockProducts.length === 1 
            ? `⚠️ Low stock alert: ${lowStockProducts[0].name || 'Product'} has only ${lowStockProducts[0].stock || 0} items left!`
            : `⚠️ Low stock alert: ${lowStockProducts.length} products have less than 50 items in stock!`;
        showNotification(message, 'warning');
    }
}

// Fetch and display orders
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-card';
        
        // Calculate tax and total
        const subtotal = parseFloat(order.total_amount) || 0;
        const tax = subtotal * 0.18; // 18% tax
        const total = subtotal + tax;
        
        orderElement.innerHTML = `
            <div class="order-header">
                <h3>Order #${order.order_id}</h3>
                <p class="order-date">Date: ${new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            <div class="order-details">
                <div class="customer-info">
                    <p><strong>Customer:</strong> ${order.customer_name || 'N/A'}</p>
                </div>
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (18%):</span>
                        <span>₹${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total Amount:</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-items">
                    <h4>Items Purchased:</h4>
                    <div class="items-list">
                        ${order.items ? order.items.map(item => `
                            <div class="order-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">x${item.quantity}</span>
                                <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('') : '<p>No items found</p>'}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(orderElement);
    });
}

// Fetch and display employees
async function fetchEmployees() {
    try {
        const response = await fetch('/api/employees');
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
}

function displayEmployees(employees) {
    const container = document.getElementById('employees-container');
    container.innerHTML = '';
    
    employees.forEach(employee => {
        const employeeCard = document.createElement('div');
        employeeCard.className = 'employee-card';
        employeeCard.innerHTML = `
            <h3>${employee.first_name} ${employee.last_name}</h3>
            <p>Position: ${employee.position}</p>
            <p>Store: ${employee.store_name}</p>
            <p>Salary: ₹${employee.salary}</p>
        `;
        container.appendChild(employeeCard);
    });
}

// Fetch and display suppliers
async function fetchSuppliers() {
    try {
        const response = await fetch('/api/suppliers');
        const suppliers = await response.json();
        displaySuppliers(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
}

function displaySuppliers(suppliers) {
    const container = document.getElementById('suppliers-container');
    container.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const supplierCard = document.createElement('div');
        supplierCard.className = 'supplier-card';
        supplierCard.innerHTML = `
            <h3>${supplier.name}</h3>
            <p>Address: ${supplier.street}, ${supplier.city}</p>
            <p>Pincode: ${supplier.pincode}</p>
        `;
        container.appendChild(supplierCard);
    });
}

// Fetch and display store statistics
async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('total-stores').textContent = stats.totalStores;
        document.getElementById('total-products').textContent = stats.totalProducts;
        document.getElementById('total-employees').textContent = stats.totalEmployees;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Filter functions
function showNoResults(container, message) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
        <i class="fas fa-search"></i>
        <p>${message}</p>
    `;
    container.appendChild(noResults);
}

function clearNoResults(container) {
    const noResults = container.querySelector('.no-results');
    if (noResults) {
        noResults.remove();
    }
}

function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const supplier = document.getElementById('supplier-filter').value;
    const search = document.getElementById('search-product').value.toLowerCase();
    const sort = document.getElementById('sort-products').value;
    
    const productCards = document.querySelectorAll('.product-card');
    const container = document.getElementById('products-container');
    let visibleCount = 0;
    
    clearNoResults(container);
    
    productCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const productCategory = card.querySelector('.product-category').textContent.toLowerCase();
        const productSupplier = card.querySelector('.product-supplier')?.textContent.toLowerCase() || '';
        const price = parseFloat(card.querySelector('.product-price').textContent.replace('₹', ''));
        
        const matchesCategory = !category || productCategory === category.toLowerCase();
        const matchesSupplier = !supplier || productSupplier === supplier.toLowerCase();
        const matchesSearch = name.includes(search) || productCategory.includes(search);
        
        const isVisible = matchesCategory && matchesSupplier && matchesSearch;
        card.style.display = isVisible ? 'block' : 'none';
        if (isVisible) visibleCount++;
    });
    
    if (visibleCount === 0) {
        showNoResults(container, 'No products found matching your criteria');
    }
    
    // Sort products
    const products = Array.from(container.children).filter(child => !child.classList.contains('no-results'));
    
    products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('₹', ''));
        const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('₹', ''));
        const nameA = a.querySelector('h3').textContent;
        const nameB = b.querySelector('h3').textContent;
        
        switch(sort) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'name':
                return nameA.localeCompare(nameB);
            default:
                return 0;
        }
    });
    
    products.forEach(product => container.appendChild(product));
}

// Add category options to filter and product form
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        // Update category filter
        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        // Update product form category select
        const productCategory = document.getElementById('product-category');
        productCategory.innerHTML = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            // Add to filter
            const filterOption = document.createElement('option');
            filterOption.value = category.category_name;
            filterOption.textContent = category.category_name;
            categoryFilter.appendChild(filterOption);
            
            // Add to product form
            const formOption = document.createElement('option');
            formOption.value = category.category_id;
            formOption.textContent = category.category_name;
            productCategory.appendChild(formOption);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Add store options to filter and employee form
async function loadStores() {
    try {
        const response = await fetch('/api/stores');
        const stores = await response.json();
        
        // Update store filter
        const storeFilter = document.getElementById('store-filter');
        storeFilter.innerHTML = '<option value="">All Stores</option>';
        
        // Update employee form store select
        const employeeStore = document.getElementById('employee-store');
        employeeStore.innerHTML = '<option value="">Select Store</option>';
        
        stores.forEach(store => {
            // Add to filter
            const filterOption = document.createElement('option');
            filterOption.value = store.store_name;
            filterOption.textContent = store.store_name;
            storeFilter.appendChild(filterOption);
            
            // Add to employee form
            const formOption = document.createElement('option');
            formOption.value = store.store_id;
            formOption.textContent = store.store_name;
            employeeStore.appendChild(formOption);
        });
    } catch (error) {
        console.error('Error loading stores:', error);
    }
}

// Add city options to filter
async function loadCities() {
    try {
        const response = await fetch('/api/cities');
        const cities = await response.json();
        const cityFilter = document.getElementById('city-filter');
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

// Add supplier options to filter
async function loadSuppliers() {
    try {
        const response = await fetch('/api/suppliers');
        const suppliers = await response.json();
        
        // Update supplier filter
        const supplierFilter = document.getElementById('supplier-filter');
        supplierFilter.innerHTML = '<option value="">All Suppliers</option>';
        
        // Update product form supplier select
        const productSupplier = document.getElementById('product-supplier');
        productSupplier.innerHTML = '<option value="">Select Supplier</option>';
        
        suppliers.forEach(supplier => {
            // Add to filter
            const filterOption = document.createElement('option');
            filterOption.value = supplier.name;
            filterOption.textContent = supplier.name;
            supplierFilter.appendChild(filterOption);
            
            // Add to product form
            const formOption = document.createElement('option');
            formOption.value = supplier.id;
            formOption.textContent = supplier.name;
            productSupplier.appendChild(formOption);
        });
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial data
    fetchProducts();
    fetchOrders();
    fetchEmployees();
    fetchSuppliers();
    fetchStats();
    loadCategories();
    loadStores();
    loadCities();
    loadSuppliers();
    
    // Load saved cart
    loadCart();
    
    // Set up quantity dialog event listeners
    const quantityDialog = document.getElementById('quantity-dialog');
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const confirmBtn = document.getElementById('confirm-quantity');
    const cancelBtn = document.getElementById('cancel-quantity');
    const closeBtn = quantityDialog.querySelector('.close');
    
    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotal();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        const maxStock = currentProduct ? currentProduct.stock : 1;
        if (currentValue < maxStock) {
            quantityInput.value = currentValue + 1;
            updateTotal();
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (currentProduct && quantity > 0 && quantity <= currentProduct.stock) {
            addToCart(currentProduct, quantity);
            hideModal('quantity-dialog');
            currentProduct = null;
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        hideModal('quantity-dialog');
        currentProduct = null;
    });
    
    closeBtn.addEventListener('click', () => {
        hideModal('quantity-dialog');
        currentProduct = null;
    });
    
    // Add event listeners for filters
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('supplier-filter').addEventListener('change', filterProducts);
    document.getElementById('search-product').addEventListener('input', filterProducts);
    document.getElementById('sort-products').addEventListener('change', filterProducts);
    
    document.getElementById('search-employee').addEventListener('input', filterEmployees);
    document.getElementById('store-filter').addEventListener('change', filterEmployees);
    
    document.getElementById('search-supplier').addEventListener('input', filterSuppliers);
    document.getElementById('city-filter').addEventListener('change', filterSuppliers);
});

function filterEmployees() {
    const search = document.getElementById('search-employee').value.toLowerCase();
    const store = document.getElementById('store-filter').value;
    
    const employeeCards = document.querySelectorAll('.employee-card');
    
    employeeCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const position = card.querySelector('p:nth-of-type(1)').textContent.toLowerCase();
        const storeName = card.querySelector('p:nth-of-type(2)').textContent.toLowerCase();
        
        const matchesSearch = name.includes(search) || 
                            position.includes(search) || 
                            storeName.includes(search);
        const matchesStore = !store || storeName.includes(store.toLowerCase());
        
        card.style.display = matchesSearch && matchesStore ? 'block' : 'none';
    });
}

function filterSuppliers() {
    const search = document.getElementById('search-supplier').value.toLowerCase();
    const city = document.getElementById('city-filter').value;
    
    const supplierCards = document.querySelectorAll('.supplier-card');
    
    supplierCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const address = card.querySelector('p:nth-of-type(1)').textContent.toLowerCase();
        const cityText = card.querySelector('p:nth-of-type(1)').textContent.toLowerCase();
        
        const matchesSearch = name.includes(search) || address.includes(search);
        const matchesCity = !city || cityText.includes(city.toLowerCase());
        
        card.style.display = matchesSearch && matchesCity ? 'block' : 'none';
    });
}

// Update checkout form display
function showCheckoutForm() {
    const cartItems = document.getElementById('cart-items');
    const checkoutForm = document.getElementById('checkout-form');
    const cartSummary = document.querySelector('.cart-container .cart-summary');
    
    // Hide cart items and summary
    cartItems.style.display = 'none';
    cartSummary.style.display = 'none';
    
    // Show checkout form
    checkoutForm.style.display = 'block';
    
    // Update checkout form summary values
    const subtotal = document.querySelector('#checkout-form #subtotal');
    const tax = document.querySelector('#checkout-form #tax');
    const total = document.querySelector('#checkout-form #total');
    
    // Get values from cart summary
    const cartSubtotal = document.querySelector('.cart-container #subtotal').textContent;
    const cartTax = document.querySelector('.cart-container #tax').textContent;
    const cartTotal = document.querySelector('.cart-container #total').textContent;
    
    // Update checkout form summary
    subtotal.textContent = cartSubtotal;
    tax.textContent = cartTax;
    total.textContent = cartTotal;
}

// Update cancel checkout
function cancelCheckout() {
    const cartItems = document.getElementById('cart-items');
    const checkoutForm = document.getElementById('checkout-form');
    const cartSummary = document.querySelector('.cart-container .cart-summary');
    
    // Show cart items and summary
    cartItems.style.display = 'block';
    cartSummary.style.display = 'block';
    
    // Hide checkout form
    checkoutForm.style.display = 'none';
}

// Add event listeners
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    showCheckoutForm();
});

document.getElementById('cancel-checkout').addEventListener('click', cancelCheckout);

document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        payment_method: document.getElementById('payment-method').value
    };
    
    try {
        // First create the customer
        const customerResponse = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: customerData.name,
                email: customerData.email
            })
        });
        
        const customerResult = await customerResponse.json();
        
        // Then create the order
        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_id: customerResult.customer_id,
                products: cart.map(item => ({
                    id: item.id,
                    quantity: 1
                }))
            })
        });
        
        const orderResult = await orderResponse.json();
        
        // Create payment record
        await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: orderResult.orderId,
                payment_method: customerData.payment_method,
                amount: parseFloat(document.querySelector('#checkout-form #total').textContent.replace('₹', ''))
            })
        });
        
        // Clear cart and show success message
        cart = [];
        updateCartCount();
        updateCartDisplay();
        saveCart();
        
        document.getElementById('checkout-form').style.display = 'none';
        document.getElementById('order-form').reset();
        
        alert('Order placed successfully! Order ID: ' + orderResult.orderId);
        
        // Refresh orders list
        fetchOrders();
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
});

// Modal functionality
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Add Product
document.getElementById('add-product-btn').addEventListener('click', () => {
    showModal('add-product-form');
});

document.getElementById('cancel-product').addEventListener('click', () => {
    hideModal('add-product-form');
});

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        price: document.getElementById('product-price').value,
        stock: document.getElementById('product-stock').value,
        category_id: document.getElementById('product-category').value
    };
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            hideModal('add-product-form');
            document.getElementById('product-form').reset();
            fetchProducts();
            alert('Product added successfully!');
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
    }
});

// Add Employee
document.getElementById('add-employee-btn').addEventListener('click', () => {
    showModal('add-employee-form');
});

document.getElementById('cancel-employee').addEventListener('click', () => {
    hideModal('add-employee-form');
});

document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeData = {
        first_name: document.getElementById('employee-first-name').value,
        last_name: document.getElementById('employee-last-name').value,
        position: document.getElementById('employee-position').value,
        salary: document.getElementById('employee-salary').value,
        store_id: document.getElementById('employee-store').value,
        street: document.getElementById('employee-street').value.trim(),
        city: document.getElementById('employee-city').value.trim(),
        pincode: document.getElementById('employee-pincode').value.trim()
    };
    
    console.log('Sending employee data:', employeeData);
    
    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        const responseData = await response.json();
        console.log('Server response:', responseData);
        
        if (response.ok) {
            hideModal('add-employee-form');
            document.getElementById('employee-form').reset();
            fetchEmployees();
            alert('Employee added successfully!');
        } else {
            throw new Error('Failed to add employee');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Error adding employee. Please try again.');
    }
});

// Add Supplier
document.getElementById('add-supplier-btn').addEventListener('click', () => {
    showModal('add-supplier-form');
});

document.getElementById('cancel-supplier').addEventListener('click', () => {
    hideModal('add-supplier-form');
});

document.getElementById('supplier-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const supplierData = {
        name: document.getElementById('supplier-name').value,
        street: document.getElementById('supplier-street').value,
        city: document.getElementById('supplier-city').value,
        pincode: document.getElementById('supplier-pincode').value
    };
    
    try {
        const response = await fetch('/api/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplierData)
        });
        
        if (response.ok) {
            hideModal('add-supplier-form');
            document.getElementById('supplier-form').reset();
            fetchSuppliers();
            alert('Supplier added successfully!');
        } else {
            throw new Error('Failed to add supplier');
        }
    } catch (error) {
        console.error('Error adding supplier:', error);
        alert('Error adding supplier. Please try again.');
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
}); 