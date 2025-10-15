// Products page functionality
let currentView = 'grid';
let currentPage = 1;
let itemsPerPage = 12;
let filteredProducts = [...products];

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
    loadProducts();
    updateCartCount();
    loadCartItems();
    initializeSearch();
    setupURLParams();
});

// Initialize products page
function initializeProductsPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const productId = urlParams.get('id');

    if (productId) {
        // Show single product details (if product detail page doesn't exist)
        showProductDetails(productId);
        return;
    }

    // Set initial filters based on URL
    if (category) {
        document.getElementById('categoryFilter').value = category;
    }

    if (search) {
        document.getElementById('searchInput').value = search;
        filterProducts();
    }
}

// Setup URL parameters handling
function setupURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
    }
}

// Load products
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const loading = document.getElementById('loading');
    
    if (loading) {
        loading.style.display = 'flex';
    }

    // Simulate loading delay
    setTimeout(() => {
        renderProducts();
        renderPagination();
        
        if (loading) {
            loading.style.display = 'none';
        }
    }, 500);
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    if (currentView === 'grid') {
        productsGrid.className = 'products-grid';
        productsGrid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    } else {
        productsGrid.className = 'products-list';
        productsGrid.innerHTML = productsToShow.map(product => createProductListItem(product)).join('');
    }
}

// Create product card for grid view
function createProductCard(product) {
    return `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Create product list item for list view
function createProductListItem(product) {
    return `
        <div class="product-list-item" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-category">Category: ${product.category}</div>
            </div>
            <div class="product-actions">
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Filter products
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    filteredProducts = products.filter(product => {
        // Category filter
        if (categoryFilter && product.category !== categoryFilter) {
            return false;
        }

        // Price filter
        if (priceFilter) {
            const price = product.price;
            switch (priceFilter) {
                case '0-100':
                    if (price > 100) return false;
                    break;
                case '100-500':
                    if (price <= 100 || price > 500) return false;
                    break;
                case '500-1000':
                    if (price <= 500 || price > 1000) return false;
                    break;
                case '1000+':
                    if (price <= 1000) return false;
                    break;
            }
        }

        // Search filter
        if (searchInput && !product.name.toLowerCase().includes(searchInput)) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    renderProducts();
    renderPagination();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;

    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'newest':
                return b.id - a.id; // Assuming higher ID = newer
            default:
                return 0; // Keep original order for 'featured'
        }
    });

    currentPage = 1;
    renderProducts();
    renderPagination();
}

// Set grid view
function setGridView() {
    currentView = 'grid';
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts();
}

// Set list view
function setListView() {
    currentView = 'list';
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts();
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
            ${i}
        </button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    pagination.innerHTML = paginationHTML;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    renderProducts();
    renderPagination();
    
    // Scroll to top of products
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show product details (placeholder for product detail page)
function showProductDetails(productId) {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    // For now, just scroll to the product in the grid
    // In a real app, you'd navigate to a product detail page
    window.location.href = `product-detail.html?id=${productId}`;
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterProducts();
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
    }
}

// Update URL when filters change
function updateURL() {
    const url = new URL(window.location);
    const category = document.getElementById('categoryFilter').value;
    const search = document.getElementById('searchInput').value;

    if (category) {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }

    if (search) {
        url.searchParams.set('search', search);
    } else {
        url.searchParams.delete('search');
    }

    window.history.replaceState({}, '', url);
}

// Add CSS for additional styles needed for products page
const additionalStyles = `
    .main-content {
        margin-top: 80px;
        padding: 2rem 0;
        min-height: calc(100vh - 80px);
    }

    .breadcrumb {
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #7f8c8d;
    }

    .breadcrumb a {
        color: #3498db;
        text-decoration: none;
    }

    .breadcrumb span {
        margin: 0 0.5rem;
    }

    .page-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .page-header h1 {
        font-size: 2.5rem;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }

    .page-header p {
        color: #7f8c8d;
        font-size: 1.1rem;
    }

    .filters-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .filters {
        display: flex;
        gap: 2rem;
        align-items: center;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .filter-group label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
    }

    .filter-group select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        background: white;
        cursor: pointer;
    }

    .view-toggle {
        display: flex;
        gap: 0.5rem;
    }

    .view-btn {
        width: 40px;
        height: 40px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .view-btn:hover,
    .view-btn.active {
        background: #3498db;
        color: white;
        border-color: #3498db;
    }

    .products-container {
        margin-bottom: 3rem;
    }

    .products-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .product-list-item {
        display: flex;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .product-list-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .product-list-item .product-image {
        width: 200px;
        height: 150px;
        object-fit: cover;
    }

    .product-details {
        flex: 1;
        padding: 1.5rem;
    }

    .product-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        min-width: 150px;
        border-left: 1px solid #eee;
    }

    .product-category {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        text-transform: capitalize;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 3rem;
    }

    .pagination-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .pagination-btn:hover,
    .pagination-btn.active {
        background: #3498db;
        color: white;
        border-color: #3498db;
    }

    .pagination-dots {
        padding: 0.5rem;
        color: #7f8c8d;
    }

    .no-products {
        text-align: center;
        padding: 4rem 2rem;
        color: #7f8c8d;
    }

    .no-products i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: #bdc3c7;
    }

    .no-products h3 {
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    @media (max-width: 768px) {
        .filters-section {
            flex-direction: column;
            gap: 1rem;
        }

        .filters {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
        }

        .filter-group {
            width: 100%;
        }

        .filter-group select {
            width: 100%;
        }

        .product-list-item {
            flex-direction: column;
        }

        .product-list-item .product-image {
            width: 100%;
            height: 200px;
        }

        .product-actions {
            border-left: none;
            border-top: 1px solid #eee;
            min-width: auto;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
