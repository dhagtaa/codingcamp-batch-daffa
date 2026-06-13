/**
 * ============================================
 * EXPENSE & BUDGET VISUALIZER
 * Main Application Script
 * ============================================
 */

/**
 * AppState Object - Centralized state management
 * Requirement: App State Management (1.1)
 */
const AppState = {
  transactions: [],
  theme: 'light',
  sortOption: 'default',
  chartInstance: null,
  chartColors: {
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Fun: '#FFE66D'
  }
};

/**
 * ============================================
 * VALIDATION FUNCTIONS
 * ============================================
 */

/**
 * Validates form input data
 * Requirement: Form Validation (2.1)
 * 
 * @param {string} itemName - The item/expense name
 * @param {number} amount - The expense amount
 * @param {string} category - The expense category
 * @returns {object} Validation result with valid flag and errors array
 */
function validateForm(itemName, amount, category) {
  const errors = [];
  
  // Validate itemName
  if (!itemName || !itemName.trim()) {
    errors.push({ field: 'itemName', message: 'Item name is required' });
  } else if (itemName.trim().length > 100) {
    errors.push({ field: 'itemName', message: 'Item name must not exceed 100 characters' });
  }
  
  // Validate amount
  const numAmount = Number(amount);
  if (amount === '' || amount === null || amount === undefined) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (isNaN(numAmount)) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  } else if (numAmount === 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than zero' });
  } else if (numAmount < 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  
  // Validate category
  const validCategories = ['Food', 'Transport', 'Fun'];
  if (!category || !validCategories.includes(category)) {
    errors.push({ field: 'category', message: 'Please select a valid category' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * ============================================
 * TRANSACTION MANAGEMENT FUNCTIONS
 * ============================================
 */

/**
 * Adds a new transaction to the app state
 * Requirement: Add Expense (1.2)
 * 
 * @param {string} itemName - The item/expense name
 * @param {number} amount - The expense amount
 * @param {string} category - The expense category (Food, Transport, Fun)
 * @returns {object} The created transaction object or error object
 */
function addTransaction(itemName, amount, category) {
  // Validate input first
  const validation = validateForm(itemName, amount, category);
  if (!validation.valid) {
    console.error('Form validation failed:', validation.errors);
    return { error: true, errors: validation.errors };
  }
  
  // Create transaction object
  const transaction = {
    id: generateUniqueId(),
    itemName: itemName.trim(),
    amount: Number(amount),
    category: category,
    timestamp: Date.now()
  };
  
  // Add to transactions array (at the beginning for "newest first")
  AppState.transactions.unshift(transaction);
  
  // Save to localStorage
  saveData();
  
  return transaction;
}

/**
 * Deletes a transaction from the app state
 * Requirement: Delete Transaction (1.3)
 * 
 * @param {string} id - The transaction ID to delete
 * @returns {boolean} True if deleted, false otherwise
 */
function deleteTransaction(id) {
  // Find the transaction index
  const index = AppState.transactions.findIndex(tx => tx.id === id);
  
  if (index === -1) {
    console.error('Transaction not found:', id);
    return false;
  }
  
  // Remove from array
  AppState.transactions.splice(index, 1);
  
  // Save to localStorage
  saveData();
  
  return true;
}

/**
 * ============================================
 * CALCULATION FUNCTIONS
 * ============================================
 */

/**
 * Calculates total balance (sum of all transactions)
 * Requirement: Dashboard - Balance Display (2.2)
 * 
 * @param {array} transactions - Optional array of transactions (defaults to AppState.transactions)
 * @returns {number} Total balance amount
 */
function calculateTotalBalance(transactions = AppState.transactions) {
  if (!Array.isArray(transactions)) {
    return 0;
  }
  
  return transactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);
    return total + (isFinite(amount) ? amount : 0);
  }, 0);
}

/**
 * Calculates totals grouped by category
 * Requirement: Chart Generation (3.1)
 * 
 * @param {array} transactions - Optional array of transactions (defaults to AppState.transactions)
 * @returns {object} Object with category totals: { Food: x, Transport: y, Fun: z }
 */
function calculateCategoryTotals(transactions = AppState.transactions) {
  const totals = {
    Food: 0,
    Transport: 0,
    Fun: 0
  };
  
  if (!Array.isArray(transactions)) {
    return totals;
  }
  
  transactions.forEach(transaction => {
    const category = transaction.category;
    const amount = Number(transaction.amount);
    
    if (totals.hasOwnProperty(category) && isFinite(amount)) {
      totals[category] += amount;
    }
  });
  
  return totals;
}

/**
 * ============================================
 * UI UPDATE FUNCTIONS
 * ============================================
 */

/**
 * Updates the total balance display
 * Requirement: Dashboard - Balance Display (2.2)
 */
function updateBalance() {
  const total = calculateTotalBalance();
  const formattedBalance = formatCurrency(total);
  
  const balanceElement = document.getElementById('totalBalance');
  if (balanceElement) {
    balanceElement.textContent = formattedBalance;
  }
}

/**
 * Renders transactions list with sorting
 * Requirement: Render Transaction List (2.4)
 * 
 * @param {array} transactions - Array of transactions to render (defaults to AppState.transactions)
 * @param {string} sortOption - Sort option (default, newest, oldest, highest, lowest)
 */
function renderTransactions(transactions = AppState.transactions, sortOption = AppState.sortOption) {
  const transactionList = document.getElementById('transactionList');
  const emptyState = document.getElementById('emptyState');
  
  if (!transactionList) {
    console.error('Transaction list element not found');
    return;
  }
  
  // Sort transactions
  const sortedTransactions = sortTransactionsList(transactions, sortOption);
  
  // Clear existing items
  transactionList.innerHTML = '';
  
  // If no transactions, show empty state
  if (sortedTransactions.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Render each transaction
  sortedTransactions.forEach(transaction => {
    const card = document.createElement('div');
    card.className = `transaction-card category-${transaction.category.toLowerCase()}`;
    card.setAttribute('data-id', transaction.id);
    
    // Format date
    const date = new Date(transaction.timestamp);
    const dateString = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    
    const formattedAmount = formatCurrency(transaction.amount);
    
    card.innerHTML = `
      <div class="card-content">
        <div class="card-info">
          <h3 class="transaction-name">${escapeHtml(transaction.itemName)}</h3>
          <p class="transaction-date">${dateString}</p>
          <span class="transaction-category ${transaction.category.toLowerCase()}">${transaction.category}</span>
        </div>
        <p class="transaction-amount">${formattedAmount}</p>
      </div>
      <button class="delete-button" aria-label="Delete transaction">✕</button>
    `;
    
    transactionList.appendChild(card);
  });
}

/**
 * Updates the expense chart visualization
 * Requirement: Chart Generation (3.1), Chart Update (3.2)
 */
function updateChart() {
  const categoryTotals = calculateCategoryTotals();
  
  // Initialize chart if not exists
  if (!AppState.chartInstance) {
    initChart();
  }
  
  if (AppState.chartInstance) {
    // Update chart data
    AppState.chartInstance.data.datasets[0].data = [
      categoryTotals.Food,
      categoryTotals.Transport,
      categoryTotals.Fun
    ];
    
    // Re-render chart
    AppState.chartInstance.update();
  }
}

/**
 * Updates the monthly summary information
 * Requirement: Dashboard - Monthly Summary (2.3)
 */
function updateMonthlySummary() {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter transactions for current month
  const currentMonthTransactions = AppState.transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });
  
  // Calculate totals
  const monthlyTotal = calculateTotalBalance(currentMonthTransactions);
  const count = currentMonthTransactions.length;
  
  // Format month label
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Update DOM
  const currentMonthEl = document.getElementById('currentMonth');
  if (currentMonthEl) {
    currentMonthEl.textContent = monthLabel;
  }
  
  const monthlyTotalEl = document.getElementById('monthlyTotal');
  if (monthlyTotalEl) {
    monthlyTotalEl.textContent = formatCurrency(monthlyTotal);
  }
  
  const transactionCountEl = document.getElementById('transactionCount');
  if (transactionCountEl) {
    transactionCountEl.textContent = count;
  }
}

/**
 * ============================================
 * CHART INITIALIZATION
 * ============================================
 */

/**
 * Initializes the Chart.js instance
 * Requirement: Chart Generation (3.1)
 */
function initChart() {
  const canvas = document.getElementById('expenseChart');
  if (!canvas) {
    console.error('Chart canvas element not found');
    return;
  }
  
  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.error('Chart.js library not loaded');
    return;
  }
  
  const categoryTotals = calculateCategoryTotals();
  
  AppState.chartInstance = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['Food', 'Transport', 'Fun'],
      datasets: [
        {
          data: [
            categoryTotals.Food,
            categoryTotals.Transport,
            categoryTotals.Fun
          ],
          backgroundColor: [
            AppState.chartColors.Food,
            AppState.chartColors.Transport,
            AppState.chartColors.Fun
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${formatCurrency(value)}`;
            }
          }
        }
      }
    }
  });
  
  return AppState.chartInstance;
}

/**
 * ============================================
 * THEME MANAGEMENT FUNCTIONS
 * ============================================
 */

/**
 * Toggles between light and dark theme
 * Requirement: Theme Toggle (4.1)
 */
function toggleTheme() {
  // Toggle theme
  const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
  AppState.theme = newTheme;
  
  // Apply theme
  applyTheme(newTheme);
  
  // Save preference
  saveThemePreference(newTheme);
}

/**
 * Applies the specified theme to the document
 * Requirement: Theme Application (4.2)
 * 
 * @param {string} theme - Theme to apply ('light' or 'dark')
 */
function applyTheme(theme) {
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-theme', theme);
}

/**
 * ============================================
 * SORTING FUNCTIONS
 * ============================================
 */

/**
 * Sorts transactions based on selected option
 * Requirement: Sort Transactions (2.5)
 * 
 * @param {array} transactions - Array of transactions to sort
 * @param {string} sortOption - Sort criteria (default, newest, oldest, highest, lowest)
 * @returns {array} Sorted transactions array (does NOT mutate original)
 */
function sortTransactionsList(transactions, sortOption) {
  if (!Array.isArray(transactions)) {
    return [];
  }
  
  // Create a copy to avoid mutating original array
  const sorted = [...transactions];
  
  switch (sortOption) {
    case 'newest':
      // Sort by timestamp descending (newest first)
      sorted.sort((a, b) => b.timestamp - a.timestamp);
      break;
      
    case 'oldest':
      // Sort by timestamp ascending (oldest first)
      sorted.sort((a, b) => a.timestamp - b.timestamp);
      break;
      
    case 'highest':
      // Sort by amount descending (highest first)
      sorted.sort((a, b) => b.amount - a.amount);
      break;
      
    case 'lowest':
      // Sort by amount ascending (lowest first)
      sorted.sort((a, b) => a.amount - b.amount);
      break;
      
    case 'default':
    default:
      // Default: by timestamp descending (most recent first)
      sorted.sort((a, b) => b.timestamp - a.timestamp);
      break;
  }
  
  return sorted;
}

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Formats a number as currency string
 * Requirement: Display Formatting (5.1)
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "Rp 1.234,00")
 */
function formatCurrency(amount) {
  // Handle invalid inputs
  if (!Number.isFinite(amount)) {
    return 'Rp 0,00';
  }
  
  // Use Indonesian locale for Rupiah formatting
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Escapes HTML special characters to prevent XSS
 * Requirement: Security - XSS Prevention (5.2)
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Generates a unique ID for transactions
 * Requirement: Transaction Management (1.1)
 * 
 * @returns {string} Unique identifier
 */
function generateUniqueId() {
  // Combine timestamp with random string for uniqueness
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${randomPart}`;
}

/**
 * ============================================
 * PERSISTENCE FUNCTIONS
 * ============================================
 */

/**
 * Saves app state to localStorage
 * Requirement: Data Persistence (5.3)
 */
function saveData() {
  try {
    const dataToSave = JSON.stringify(AppState.transactions);
    localStorage.setItem('expenseApp_transactions', dataToSave);
    console.log('Data saved successfully to localStorage');
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded:', error);
    } else if (error.name === 'SecurityError') {
      console.error('Cannot access localStorage (private browsing mode?):', error);
    } else {
      console.error('Error saving data to localStorage:', error);
    }
  }
}

/**
 * Loads app state from localStorage
 * Requirement: Data Persistence (5.3)
 */
function loadData() {
  try {
    const data = localStorage.getItem('expenseApp_transactions');
    
    if (!data) {
      // Initialize with empty array if not found
      AppState.transactions = [];
      console.log('No saved data found, initialized with empty array');
      return;
    }
    
    // Parse JSON
    const parsed = JSON.parse(data);
    
    // Validate structure
    if (Array.isArray(parsed)) {
      AppState.transactions = parsed;
      console.log('Data loaded successfully from localStorage');
    } else {
      console.warn('Invalid data structure in localStorage, initializing with empty array');
      AppState.transactions = [];
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Error parsing localStorage data (corrupt data):', error);
    } else {
      console.error('Error loading data from localStorage:', error);
    }
    AppState.transactions = [];
  }
}

/**
 * Loads theme preference from localStorage
 * Requirement: Theme Persistence (4.2)
 * 
 * @returns {string} Saved theme ('light' or 'dark')
 */
function loadThemePreference() {
  try {
    const saved = localStorage.getItem('expenseApp_theme');
    
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    
    // Default to light theme
    return 'light';
  } catch (error) {
    console.warn('Error loading theme preference:', error);
    return 'light';
  }
}

/**
 * Saves theme preference to localStorage
 * Requirement: Theme Persistence (4.2)
 * 
 * @param {string} theme - Theme to save ('light' or 'dark')
 */
function saveThemePreference(theme) {
  try {
    if (theme === 'light' || theme === 'dark') {
      localStorage.setItem('expenseApp_theme', theme);
      console.log(`Theme preference saved: ${theme}`);
    }
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}

/**
 * ============================================
 * EVENT LISTENERS & INITIALIZATION
 * ============================================
 */

/**
 * Sets up all event listeners for the application
 * Requirement: Event Handling (6.1)
 */
function setupEventListeners() {
  // Form submit listener
  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Theme toggle listener
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
  }
  
  // Sort selector listener
  const sortSelector = document.getElementById('sortSelector');
  if (sortSelector) {
    sortSelector.addEventListener('change', handleSortChange);
  }
  
  // Delegated delete button listener
  const transactionList = document.getElementById('transactionList');
  if (transactionList) {
    transactionList.addEventListener('click', handleDeleteClick);
  }
  
  // Clear error messages on form input focus
  const itemNameInput = document.getElementById('itemName');
  const amountInput = document.getElementById('amount');
  const categorySelect = document.getElementById('category');
  
  if (itemNameInput) {
    itemNameInput.addEventListener('focus', () => clearFieldError('itemName'));
  }
  if (amountInput) {
    amountInput.addEventListener('focus', () => clearFieldError('amount'));
  }
  if (categorySelect) {
    categorySelect.addEventListener('focus', () => clearFieldError('category'));
  }
}

/**
 * Handles the form submission event
 * Requirement: Form Submission (2.1)
 * 
 * @param {Event} event - The submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  // Get form values
  const itemName = document.getElementById('itemName').value;
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  
  // Clear all previous errors
  clearAllErrors();
  
  // Validate and add transaction
  const result = addTransaction(itemName, amount, category);
  
  if (result.error) {
    // Display validation errors
    displayErrors(result.errors);
  } else {
    // Success - clear form and update displays
    document.getElementById('expenseForm').reset();
    document.getElementById('itemName').focus();
    
    // Update all displays
    updateBalance();
    updateMonthlySummary();
    updateChart();
    renderTransactions();
    
    // Show success notification
    showNotification('Expense added successfully!', 3000);
  }
}

/**
 * Handles the sort selector change event
 * Requirement: Sort Transactions (2.5)
 * 
 * @param {Event} event - The change event
 */
function handleSortChange(event) {
  const sortOption = event.target.value;
  AppState.sortOption = sortOption;
  renderTransactions();
}

/**
 * Handles delete button clicks (delegated)
 * 
 * @param {Event} event - The click event
 */
function handleDeleteClick(event) {
  const deleteBtn = event.target.closest('.delete-button');
  
  if (deleteBtn) {
    const card = deleteBtn.closest('.transaction-card');
    if (card) {
      const transactionId = card.getAttribute('data-id');
      
      if (transactionId) {
        // Delete transaction
        const success = deleteTransaction(transactionId);
        
        if (success) {
          // Update all displays
          updateBalance();
          updateMonthlySummary();
          updateChart();
          renderTransactions();
          
          showNotification('Transaction deleted', 2000);
        }
      }
    }
  }
}

/**
 * Handles theme toggle button click
 * Requirement: Theme Toggle (4.1)
 */
function handleThemeToggle() {
  toggleTheme();
}

/**
 * Shows success notification for user feedback
 * Requirement: User Feedback (6.2)
 * 
 * @param {string} message - Message to display
 * @param {number} duration - Duration to show (ms)
 */
function showNotification(message, duration = 3000) {
  const notification = document.getElementById('successNotification');
  if (!notification) {
    return;
  }
  
  const messageSpan = notification.querySelector('.notification-message');
  if (messageSpan) {
    messageSpan.textContent = message;
  }
  
  // Show notification
  notification.classList.add('show');
  
  // Auto-hide after duration
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

/**
 * Displays validation errors in the form
 * Requirement: Error Display (6.3)
 * 
 * @param {array} errors - Array of error objects
 */
function displayErrors(errors) {
  errors.forEach(error => {
    const errorElement = document.getElementById(`${error.field}Error`);
    const inputElement = document.getElementById(error.field);
    
    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.classList.add('show');
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
    }
  });
}

/**
 * Clears all form errors
 */
function clearAllErrors() {
  const errorElements = document.querySelectorAll('.error-msg');
  errorElements.forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
}

/**
 * Clears error for a specific field
 * 
 * @param {string} fieldName - Name of the field
 */
function clearFieldError(fieldName) {
  const errorElement = document.getElementById(`${fieldName}Error`);
  const inputElement = document.getElementById(fieldName);
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
  
  if (inputElement) {
    inputElement.classList.remove('error');
  }
}

/**
 * Initializes the entire application
 * Requirement: App Initialization (1.0)
 */
function initializeApp() {
  console.log('Initializing Expense & Budget Visualizer...');
  
  try {
    // Load saved data from localStorage
    loadData();
    
    // Load and apply theme preference
    const savedTheme = loadThemePreference();
    AppState.theme = savedTheme;
    applyTheme(savedTheme);
    
    // Initialize chart
    initChart();
    
    // Render initial state
    renderTransactions();
    updateBalance();
    updateMonthlySummary();
    updateChart();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Focus to form input for accessibility
    const itemNameInput = document.getElementById('itemName');
    if (itemNameInput) {
      itemNameInput.focus();
    }
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

/**
 * ============================================
 * APPLICATION START
 * ============================================
 */

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded
  initializeApp();
}

// Save data before closing window
window.addEventListener('beforeunload', saveData);
