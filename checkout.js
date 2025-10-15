// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    updateCartCount();
    initializeFormValidation();
    formatCardInputs();
});

// Load order summary
function loadOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        // Redirect to products page if cart is empty
        window.location.href = 'products.html';
        return;
    }

    // Display order items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <div class="order-item-price">$${item.price} × ${item.quantity}</div>
            </div>
            <div class="order-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    // Calculate totals
    calculateTotals();
}

// Calculate order totals
function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Toggle shipping form
function toggleShippingForm() {
    const sameAsBilling = document.getElementById('sameAsBilling');
    const shippingForm = document.getElementById('shippingForm');
    
    if (sameAsBilling.checked) {
        shippingForm.style.display = 'none';
        // Clear shipping form fields
        clearShippingForm();
    } else {
        shippingForm.style.display = 'block';
    }
}

// Clear shipping form
function clearShippingForm() {
    const shippingFields = [
        'shippingFirstName', 'shippingLastName', 'shippingAddress',
        'shippingCity', 'shippingState', 'shippingZipCode'
    ];
    
    shippingFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
}

// Initialize form validation
function initializeFormValidation() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(event);
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel') {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // ZIP code validation
    if (field.id === 'zipCode' || field.id === 'shippingZipCode') {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(value)) {
            showFieldError(field, 'Please enter a valid ZIP code');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Format card input fields
function formatCardInputs() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    
    // Format card number
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        
        if (formattedValue.length <= 19) { // 16 digits + 3 spaces
            e.target.value = formattedValue;
        }
    });
    
    // Format expiry date
    expiryDate.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        e.target.value = value;
    });
    
    // Limit CVV to 4 digits
    const cvv = document.getElementById('cvv');
    cvv.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    });
}

// Process checkout
function processCheckout(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        showMessage('Please correct the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.checkout-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success message
        showMessage('Order placed successfully! Thank you for your purchase.', 'success');
        
        // Redirect to confirmation page (or show modal)
        setTimeout(() => {
            window.location.href = 'order-confirmation.html';
        }, 2000);
    }, 3000);
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    // Check terms acceptance
    const termsAccepted = document.getElementById('termsAccepted');
    if (!termsAccepted.checked) {
        showMessage('Please accept the terms and conditions', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Show terms modal (placeholder)
function showTerms() {
    alert('Terms and Conditions:\n\n1. All sales are final.\n2. Returns accepted within 30 days.\n3. Shipping costs are non-refundable.\n4. Product warranties apply as per manufacturer specifications.\n\nFor full terms, please contact customer service.');
}

// Show privacy policy modal (placeholder)
function showPrivacy() {
    alert('Privacy Policy:\n\nWe respect your privacy and are committed to protecting your personal information. We collect only the information necessary to process your order and provide customer service.\n\nYour payment information is encrypted and securely processed by our payment partners.\n\nFor our full privacy policy, please visit our website.');
}

// Add CSS for checkout-specific styles
const checkoutStyles = `
    .checkout-main {
        margin-top: 80px;
        padding: 2rem 0;
        min-height: calc(100vh - 80px);
        background: #f8f9fa;
    }

    .breadcrumb {
        margin-bottom: 2rem;
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

    .checkout-container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .checkout-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 3rem;
        align-items: start;
    }

    .checkout-form-section {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .checkout-form-section h1 {
        margin-bottom: 2rem;
        color: #2c3e50;
        font-size: 2rem;
    }

    .form-section {
        margin-bottom: 2rem;
    }

    .form-section h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-size: 1.3rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-section h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2c3e50;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .form-group input.error {
        border-color: #e74c3c;
    }

    .field-error {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-weight: normal;
    }

    .checkbox-label input[type="checkbox"] {
        width: auto;
        margin: 0;
    }

    .shipping-section,
    .payment-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
    }

    .checkout-btn {
        margin-top: 2rem;
        font-size: 1.1rem;
        padding: 1rem;
    }

    .order-summary {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        position: sticky;
        top: 100px;
    }

    .order-summary h2 {
        margin-bottom: 1.5rem;
        color: #2c3e50;
    }

    .order-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
    }

    .order-item:last-child {
        border-bottom: none;
    }

    .order-item-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 5px;
    }

    .order-item-details {
        flex: 1;
    }

    .order-item-details h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.9rem;
        color: #2c3e50;
    }

    .order-item-price {
        color: #7f8c8d;
        font-size: 0.8rem;
    }

    .order-item-total {
        font-weight: 600;
        color: #2c3e50;
    }

    .order-totals {
        margin: 2rem 0;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }

    .total-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .total-line.total {
        font-weight: bold;
        font-size: 1.1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        color: #2c3e50;
    }

    .security-badges {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    .badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #27ae60;
        font-size: 0.8rem;
    }

    .badge i {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .checkout-content {
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .order-summary {
            position: static;
        }
    }
`;

// Inject checkout styles
const styleSheet = document.createElement('style');
styleSheet.textContent = checkoutStyles;
document.head.appendChild(styleSheet);
