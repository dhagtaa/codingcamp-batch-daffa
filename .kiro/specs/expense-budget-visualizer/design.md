# Design Document: Expense & Budget Visualizer

## Overview

Expense & Budget Visualizer adalah aplikasi web vanilla JavaScript yang menyediakan interface intuitif untuk mencatat, mengelola, dan memvisualisasikan pengeluaran harian. Aplikasi ini dibangun dengan arsitektur modular yang memisahkan tanggung jawab antara data management, DOM manipulation, dan event handling. 

**Key Principles:**
- Client-side first dengan Local Storage sebagai data persistence layer
- Vanilla JavaScript (no frameworks) untuk performa optimal dan minimal dependencies
- Responsive design yang mendukung mobile, tablet, dan desktop
- Real-time UI updates menggunakan event-driven architecture
- Accessibility compliance dengan semantic HTML dan ARIA attributes

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Header  │  │ Dashboard│  │   Form   │  │ Transaction  │   │
│  │Component │  │Component │  │Component │  │ List         │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT HANDLER LAYER                          │
│  • Form submit events                                           │
│  • Delete button clicks                                         │
│  • Sort selector changes                                        │
│  • Theme toggle clicks                                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER (Core Functions)          │
│  • addTransaction()         • updateChart()                     │
│  • deleteTransaction()       • calculateCategoryTotals()        │
│  • updateBalance()          • sortTransactions()                │
│  • validateForm()           • toggleTheme()                     │
│  • formatCurrency()         • getMonthlyData()                  │
│  • renderTransactions()                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  In-Memory State: transactions[], theme, sortOption      │  │
│  │  Chart.js Instance Reference                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Local Storage API                                       │  │
│  │  • expenseApp_transactions (JSON stringified array)      │  │
│  │  • expenseApp_theme (light/dark)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
USER ACTION (Form Submit)
        │
        ▼
  validateForm()
        │
        ├─ valid ─►  addTransaction()
        │                   │
        │                   ▼
        │            Create Transaction Object
        │                   │
        │                   ▼
        │            transactions.push()
        │                   │
        │                   ▼
        │            saveData() → localStorage
        │                   │
        │              ┌────┴────┐
        │              ▼         ▼
        │          updateBalance()  renderTransactions()
        │              │              │
        │              └────┬─────────┘
        │                   ▼
        │              updateChart()
        │                   │
        │                   ▼
        │              ✓ UI Updated
        │
        └─ invalid ─► Display Error Messages
```

### State Management

```javascript
// Global Application State
const AppState = {
  // In-memory transactions array
  transactions: [],
  
  // UI preferences
  theme: 'light', // 'light' or 'dark'
  sortOption: 'default', // 'default', 'amountDesc', 'amountAsc', 'category'
  
  // Chart.js instance
  chartInstance: null,
  
  // Chart configuration
  chartColors: {
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Fun: '#FFE66D'
  }
};
```

### Interaksi Antar Komponen

1. **Form ↔ Transaction List**: Ketika transaksi ditambahkan, list diperbarui dan ditampilkan ulang
2. **Transaction List ↔ Balance Display**: Setiap perubahan list memicu update balance
3. **Balance ↔ Chart**: Setiap update balance juga memicu update chart
4. **Sort Selector ↔ Transaction List**: Perubahan sort criteria merender ulang list dengan urutan baru
5. **Theme Toggle ↔ All Components**: Perubahan theme diterapkan ke semua elemen

---

## Components dan Interfaces

### 1. Header Component

**Responsibility**: Menampilkan judul aplikasi dan tema toggle

```javascript
// HTML Structure
<header id="header" class="header">
  <div class="header-container">
    <h1 class="app-title">💰 Expense & Budget Visualizer</h1>
    <button id="themeToggle" class="theme-toggle" 
            aria-label="Toggle dark/light mode">
      <span class="theme-icon">🌙</span>
    </button>
  </div>
</header>

// Interface
HeaderComponent = {
  render: () => void,
  toggleTheme: () => void,
  updateThemeIcon: (theme: 'light' | 'dark') => void,
  attachEventListeners: () => void
}
```

**Pseudocode:**
```
function HeaderComponent.render():
  - Find header element by ID
  - Ensure theme toggle button exists
  - Attach click listener to toggle button
  - Initialize theme icon based on current AppState.theme

function HeaderComponent.toggleTheme():
  - Call toggleTheme() from core functions
  - Update theme icon display
  - Apply CSS classes to document root
  - Save preference to localStorage
```

### 2. Dashboard Component

**Responsibility**: Menampilkan total balance dan pie chart

```javascript
// HTML Structure
<section id="dashboard" class="dashboard">
  <div class="dashboard-container">
    <!-- Balance Card -->
    <div class="balance-card">
      <h2 class="balance-label">Total Balance</h2>
      <p id="totalBalance" class="balance-amount">Rp 0,00</p>
    </div>
    
    <!-- Monthly Summary Card -->
    <div class="monthly-summary-card">
      <h3 class="summary-title">Monthly Summary</h3>
      <p id="currentMonth" class="month-label"></p>
      <p id="monthlyTotal" class="monthly-amount">Rp 0,00</p>
      <p id="transactionCount" class="transaction-count">0 transactions</p>
    </div>
  </div>
  
  <!-- Chart Container -->
  <div class="chart-container">
    <canvas id="expenseChart"></canvas>
  </div>
</section>

// Interface
DashboardComponent = {
  renderBalance: (amount: number) => void,
  renderMonthlyData: (total: number, count: number) => void,
  initChart: () => Chart.js instance,
  updateChart: (categoryTotals: {Food, Transport, Fun}) => void,
  getChartInstance: () => Chart.js instance
}
```

**Pseudocode:**
```
function DashboardComponent.renderBalance(amount):
  - Format amount as Rp currency
  - Update DOM element with formatted amount
  - Add animation class if amount changed

function DashboardComponent.renderMonthlyData(total, count):
  - Display current month (e.g., "December 2024")
  - Format monthly total as currency
  - Display transaction count

function DashboardComponent.initChart():
  - Get canvas element by ID
  - Create Chart.js instance with pie chart type
  - Configure chart with category colors
  - Store instance in AppState.chartInstance
  - Return instance

function DashboardComponent.updateChart(categoryTotals):
  - If no chart instance, initialize it
  - Update chart data with categoryTotals
  - Recalculate percentages
  - Call chart.update() to re-render
```

### 3. Form Component

**Responsibility**: Menampilkan input form dan mengelola form submission

```javascript
// HTML Structure
<section id="formSection" class="form-section">
  <form id="expenseForm" class="expense-form">
    <div class="form-group">
      <label for="itemName" class="form-label">Item Name</label>
      <input 
        id="itemName" 
        type="text" 
        class="form-input"
        placeholder="e.g., Coffee, Taxi fare, Movie ticket"
        required
      />
      <span id="itemNameError" class="error-message"></span>
    </div>
    
    <div class="form-group">
      <label for="amount" class="form-label">Amount</label>
      <input 
        id="amount" 
        type="number" 
        class="form-input"
        placeholder="0"
        step="1"
        required
      />
      <span id="amountError" class="error-message"></span>
    </div>
    
    <div class="form-group">
      <label for="category" class="form-label">Category</label>
      <select id="category" class="form-select" required>
        <option value="">Select a category</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Fun">Fun</option>
      </select>
      <span id="categoryError" class="error-message"></span>
    </div>
    
    <button type="submit" class="submit-button">Add Expense</button>
  </form>
  
  <!-- Success notification -->
  <div id="successNotification" class="notification success-notification">
    Transaction added successfully!
  </div>
</section>

// Interface
FormComponent = {
  getFormValues: () => {itemName, amount, category},
  clearForm: () => void,
  displayErrors: (errors: {field: string}[]) => void,
  clearErrors: () => void,
  showSuccessNotification: () => void,
  attachSubmitListener: (handler: Function) => void
}
```

**Pseudocode:**
```
function FormComponent.getFormValues():
  - Get value from itemName input
  - Get value from amount input (convert to number)
  - Get value from category select
  - Return object {itemName, amount, category}

function FormComponent.clearForm():
  - Set all form inputs to empty string
  - Clear all error messages
  - Focus on itemName input

function FormComponent.displayErrors(errors):
  - Clear all previous errors first
  - For each error in errors array:
    - Find error span for that field
    - Set error message text
    - Add error class to input element

function FormComponent.showSuccessNotification():
  - Get notification element
  - Show element (add active class)
  - Set timeout to hide after 3 seconds
```

### 4. Transaction List Component

**Responsibility**: Menampilkan daftar semua transaksi dengan kemampuan delete dan sort

```javascript
// HTML Structure
<section id="transactionSection" class="transaction-section">
  <div class="transaction-header">
    <h2 class="section-title">Transactions</h2>
    <div class="sort-controls">
      <label for="sortSelector" class="sort-label">Sort by:</label>
      <select id="sortSelector" class="sort-select">
        <option value="default">Default (Most Recent)</option>
        <option value="amountDesc">Amount (Highest to Lowest)</option>
        <option value="amountAsc">Amount (Lowest to Highest)</option>
        <option value="category">Category (A-Z)</option>
      </select>
    </div>
  </div>
  
  <div id="transactionList" class="transaction-list">
    <!-- Transaction cards will be rendered here -->
  </div>
  
  <!-- Empty state placeholder -->
  <div id="emptyState" class="empty-state">
    <p>No transactions yet. Start by adding your first expense!</p>
  </div>
</section>

// Individual Transaction Card HTML
<div class="transaction-card" data-id="{transactionId}">
  <div class="card-content">
    <div class="card-info">
      <h3 class="transaction-name">{itemName}</h3>
      <span class="transaction-category category-{category}">{category}</span>
      <p class="transaction-date">{formatted timestamp}</p>
    </div>
    <p class="transaction-amount">{formatted amount}</p>
  </div>
  <button class="delete-button" aria-label="Delete transaction">
    ✕
  </button>
</div>

// Interface
TransactionListComponent = {
  renderTransactions: (transactions: Transaction[], sortOption?: string) => void,
  appendTransaction: (transaction: Transaction) => void,
  removeTransaction: (id: string) => void,
  clearList: () => void,
  showEmptyState: () => void,
  hideEmptyState: () => void,
  attachDeleteListeners: (handler: Function) => void,
  attachSortListener: (handler: Function) => void
}
```

**Pseudocode:**
```
function TransactionListComponent.renderTransactions(transactions, sortOption):
  - Sort transactions based on sortOption
  - Clear existing transaction cards
  - For each transaction:
    - Create card HTML with all required fields
    - Format amount as currency
    - Format timestamp as readable date
    - Apply category-specific CSS class
    - Append card to transaction list
  - If list is empty, show empty state
  - Else hide empty state
  - Attach delete listeners to all delete buttons

function TransactionListComponent.removeTransaction(id):
  - Find card element with data-id = id
  - Add animation class
  - After animation completes (300ms):
    - Remove card from DOM
  - If no cards remain, show empty state

function TransactionListComponent.attachDeleteListeners(handler):
  - Find all delete buttons
  - Add click listeners to each
  - On click, extract transaction ID and call handler
```

### 5. Monthly Summary Component

**Responsibility**: Menampilkan ringkasan pengeluaran bulan berjalan

```javascript
// HTML Structure (included in Dashboard Component)
<div class="monthly-summary-card">
  <h3 class="summary-title">📅 Monthly Summary</h3>
  <p id="currentMonth" class="month-label">December 2024</p>
  <div class="summary-details">
    <div class="summary-item">
      <span class="label">Total Spending</span>
      <p id="monthlyTotal" class="amount">Rp 0,00</p>
    </div>
    <div class="summary-item">
      <span class="label">Transactions</span>
      <p id="transactionCount" class="count">0</p>
    </div>
  </div>
</div>

// Interface
MonthlySummaryComponent = {
  getMonthlyData: (transactions: Transaction[]) => {total, count, month},
  updateMonthlySummary: (total: number, count: number, month: string) => void,
  getTransactionsInCurrentMonth: () => Transaction[]
}
```

**Pseudocode:**
```
function MonthlySummaryComponent.getMonthlyData(transactions):
  - Get current date
  - Extract current month and year
  - Filter transactions for current month only
  - Calculate sum of filtered transactions
  - Count filtered transactions
  - Return {total, count, month}

function MonthlySummaryComponent.updateMonthlySummary(total, count, month):
  - Update currentMonth element with month string
  - Format and display total as currency
  - Display transaction count
```

---

## Data Models

### Transaction Object

```javascript
/**
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier (timestamp-based or UUID)
 * @property {string} itemName - Name of the expense item
 * @property {number} amount - Amount in numeric format (always positive)
 * @property {string} category - Category: 'Food', 'Transport', or 'Fun'
 * @property {number} timestamp - JavaScript timestamp (Date.now())
 */

// Example transaction
const transaction = {
  id: '1702425600000',
  itemName: 'Coffee at Starbucks',
  amount: 65000,
  category: 'Food',
  timestamp: 1702425600000
};
```

### AppState Object

```javascript
/**
 * @typedef {Object} AppState
 * @property {Transaction[]} transactions - All recorded transactions
 * @property {string} theme - Current theme ('light' or 'dark')
 * @property {string} sortOption - Current sort option
 * @property {Chart|null} chartInstance - Chart.js instance reference
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
```

### Validation Error Object

```javascript
/**
 * @typedef {Object} ValidationError
 * @property {boolean} valid - Whether validation passed
 * @property {Array<{field: string, message: string}>} errors - Array of errors
 */

const validationResult = {
  valid: false,
  errors: [
    { field: 'itemName', message: 'Item name cannot be empty' },
    { field: 'amount', message: 'Amount must be a positive number' }
  ]
};
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form Validation Rejects All Invalid Input

*For any* combination of form inputs where at least one field is empty or invalid (negative/zero amount, non-numeric amount, empty category), the form validation SHALL reject the input and prevent submission.

**Validates: Requirements 1.3, 1.4, 1.5, 1.8**

### Property 2: Valid Transaction Addition is Round-Trip Safe

*For any* valid transaction input (non-empty item name, positive numeric amount, valid category), adding the transaction SHALL result in:
1. Transaction being saved to Local Storage
2. Transaction appearing in the in-memory transactions array
3. Form being cleared for the next entry
4. Transaction being retrievable from storage after page reload

**Validates: Requirements 1.6, 2.1, 2.2, 2.5**

### Property 3: Balance Always Equals Sum of All Amounts

*For any* set of transactions in the application, the displayed balance SHALL equal the mathematical sum of all transaction amounts, maintained consistently through add/delete operations.

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 4: Transaction Deletion is Atomic and Complete

*For any* transaction in the list, when deleted:
1. Transaction SHALL be removed from Local Storage
2. Transaction SHALL be removed from the in-memory array
3. Transaction SHALL be removed from the DOM display
4. Total balance SHALL be updated (decreased by amount)
5. Chart visualization SHALL be updated

**Validates: Requirements 4.2, 4.3, 4.4, 2.4**

### Property 5: Balance Currency Formatting is Consistent

*For any* numeric amount (zero, positive integer, or decimal), the formatted currency display SHALL:
1. Include the "Rp " prefix
2. Use appropriate decimal places (exactly 2 after decimal point)
3. Use thousands separator (comma)
4. Produce consistent output for identical amounts

**Validates: Requirement 5.5**

### Property 6: Rendered Transaction Display Contains All Required Fields

*For any* transaction in the display list, the rendered transaction card SHALL contain all required information:
1. Item name
2. Amount (formatted as currency)
3. Category label
4. Delete button

**Validates: Requirement 3.2**

### Property 7: New Transactions Appear at Top of List

*For any* newly added transaction (when sortOption is 'default'), the transaction SHALL appear at the top of the transaction list immediately after addition.

**Validates: Requirement 3.5**

### Property 8: Sort Order is Applied Consistently to All Transactions

*For any* selected sort criteria (amountDesc, amountAsc, category):
1. All transactions SHALL be re-ordered according to the criteria
2. The sort order SHALL be maintained when new transactions are added
3. The same sort order SHALL produce consistent results across multiple sorts

**Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**

### Property 9: Theme Toggle Updates All Elements Atomically

*For any* theme toggle action (light→dark or dark→light):
1. Theme preference SHALL be saved to Local Storage
2. All UI elements SHALL be updated to reflect the new theme
3. The saved theme SHALL persist after page reload
4. No elements SHALL display incorrect theme

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 10: Category Total Calculations are Accurate

*For any* set of transactions across the three categories, the calculated totals for each category (Food, Transport, Fun) SHALL:
1. Equal the sum of all transaction amounts in that category
2. Be correctly represented in the pie chart
3. Update atomically when transactions are added/deleted

**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

### Property 11: Monthly Summary Excludes Previous Month Transactions

*For any* set of transactions that includes both current-month and previous-month transactions:
1. Monthly summary total SHALL only include current month transactions
2. Monthly summary count SHALL only include current month transactions
3. Previous-month transactions SHALL be excluded from calculation

**Validates: Requirement 11.4**

### Property 12: Monthly Summary Updates on Every Transaction Change

*For any* add or delete operation:
1. If the transaction is in the current month, monthly summary SHALL be updated
2. If the transaction is in a previous month, monthly summary SHALL remain unchanged
3. Summary updates SHALL happen immediately (no delay)

**Validates: Requirements 11.5, 11.6**

### Property 13: Empty State Display is Contextually Correct

*For any* transaction list state:
1. When list is empty, placeholder message SHALL be visible
2. When list has 1 or more transactions, placeholder message SHALL be hidden
3. Empty state display SHALL reflect accurately after add/delete operations

**Validates: Requirement 3.4**

### Property 14: Chart Visualization Reflects Current Transaction State

*For any* set of transactions:
1. Chart SHALL have exactly 3 segments (one per category)
2. Each segment SHALL represent the percentage of total for that category
3. Chart SHALL update within 200ms of transaction add/delete
4. Chart rendering SHALL not crash on any valid transaction data

**Validates: Requirements 6.1, 6.2, 6.4, 6.5**

### Property 15: Transaction Array Data Integrity

*For any* sequence of add/delete operations:
1. Each transaction in the array SHALL have all required properties (id, itemName, amount, category, timestamp)
2. Each transaction ID SHALL be unique
3. The in-memory array SHALL match the Local Storage array
4. Array order SHALL be preserved correctly across operations

**Validates: Requirements 2.5, 13.1, 13.2, 13.5, 13.6**

---

## Error Handling

### Form Validation Errors

```javascript
/**
 * Validation Errors Map:
 * - EMPTY_FIELD: "This field is required"
 * - INVALID_AMOUNT: "Amount must be a positive number"
 * - ZERO_AMOUNT: "Amount must be greater than zero"
 * - INVALID_CATEGORY: "Please select a valid category"
 */

Handling Strategy:
1. Validate each field independently
2. Collect all errors before displaying
3. Display error message inline near the field
4. Add error class to form input
5. Prevent form submission if any error exists
6. Clear errors when user starts typing
```

### Local Storage Errors

```javascript
/**
 * Local Storage Errors:
 * - QUOTA_EXCEEDED: Storage limit reached (rare, > 5MB)
 * - ACCESS_DENIED: Private browsing or restricted access
 * - NOT_AVAILABLE: localStorage not supported
 */

Handling Strategy:
1. Wrap all localStorage operations in try-catch
2. Log error to console with context
3. Show user-friendly notification (not technical details)
4. Continue app in memory if localStorage unavailable
5. Attempt to recover on next operation
```

### Chart Rendering Errors

```javascript
/**
 * Chart Errors:
 * - INVALID_DATA: NaN, null, or undefined values
 * - MISSING_CONTEXT: Canvas element not found
 * - INSUFFICIENT_DATA: No transactions recorded
 */

Handling Strategy:
1. Validate transaction data before passing to chart
2. Check canvas element exists before initializing
3. Gracefully show placeholder if no data
4. Destroy and recreate chart on data errors
5. Log errors for debugging
```

### Graceful Fallbacks

```javascript
// If Chart.js fails to load
if (!window.Chart) {
  console.warn('Chart.js not loaded, displaying fallback');
  DisplayChartFallback(); // Show basic text summary instead
}

// If localStorage unavailable
if (!window.localStorage) {
  console.warn('localStorage unavailable, using in-memory only');
  ShowWarningBanner('Your data will not persist after refresh');
}

// If calculations result in NaN
const safeCurrencyFormat = (amount) => {
  if (!Number.isFinite(amount)) {
    console.error('Invalid amount:', amount);
    return 'Rp 0,00';
  }
  return formatCurrency(amount);
};
```

---

## Testing Strategy

### Dual Testing Approach

This feature combines **property-based testing** and **example-based unit tests** for comprehensive coverage.

#### Property-Based Testing

Property-based testing verifies that universal rules hold across all valid inputs. This feature is highly suitable for PBT because:
- Core functions are pure (input → output with no side effects)
- Business logic is deterministic (same input always produces same output)
- Behavior should hold for infinite input variations
- Edge cases can be discovered through randomization

**Property Tests to Implement:**
- Properties 1-15 (all defined above)
- Each property runs **minimum 100 iterations** with randomly generated inputs
- Test data includes edge cases (empty strings, zero amounts, special characters, etc.)

**Property Test Framework:** [fast-check](https://github.com/dubzzz/fast-check) for JavaScript
- Provides powerful generators for transactions, categories, amounts
- Generates shrunk counterexamples on failure
- Easy property composition

#### Example-Based Unit Tests

Example-based tests verify specific scenarios and integration points.

**Categories:**
1. **Specific Examples**: Concrete test cases with known inputs/outputs
2. **Integration Tests**: Multi-component interactions
3. **UI Tests**: DOM rendering and event handling

### Test Structure

```javascript
// Example: Property-based test for Property 3 (Balance calculation)
import { fc } from 'fast-check';

describe('Property 3: Balance always equals sum of amounts', () => {
  it('should maintain invariant: balance === sum(amounts)', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTransaction(), { minLength: 0, maxLength: 100 }),
        (transactions) => {
          AppState.transactions = transactions;
          const balance = calculateTotalBalance();
          const expectedSum = transactions.reduce((sum, t) => sum + t.amount, 0);
          
          expect(balance).toBe(expectedSum);
        }
      ),
      { numRuns: 200 } // Run 200 times with different random data
    );
  });
});

// Example: Unit test for specific scenario
describe('Form validation', () => {
  it('should reject form with empty item name', () => {
    const result = validateForm('', 50000, 'Food');
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'itemName',
      message: expect.stringContaining('required')
    });
  });
});
```

### Test Configuration

```javascript
// Property test configuration
{
  numRuns: 100,              // Minimum iterations per property
  seed: 12345,               // Reproducible randomization
  verbose: true,             // Show generated values on failure
  shrinks: 1000,             // Maximum shrinking attempts
  timeout: 5000              // 5 second timeout per test
}

// Test tags for CI/CD
// Feature: expense-budget-visualizer, Property 1: Form validation rejects invalid input
// Feature: expense-budget-visualizer, Property 3: Balance equals sum of amounts
```

### Test Coverage Goals

- **Core Functions**: 100% coverage (all business logic must be tested)
- **Properties**: All 15 correctness properties implemented
- **Edge Cases**: Boundary conditions (zero, maximum, minimum values)
- **Error Scenarios**: Invalid inputs, missing data, storage failures

### Integration Test Strategy

```javascript
// Full integration test: Add transaction → Update balance → Update chart → Sort
describe('Integration: Complete transaction workflow', () => {
  it('should maintain consistency through add-delete-sort cycle', () => {
    // Setup
    loadData(); // Initialize with empty or existing data
    
    // Add multiple transactions
    const tx1 = addTransaction('Coffee', 50000, 'Food');
    const tx2 = addTransaction('Taxi', 75000, 'Transport');
    const tx3 = addTransaction('Movie', 120000, 'Fun');
    
    // Verify all updates happened atomically
    expect(AppState.transactions.length).toBe(3);
    expect(calculateTotalBalance()).toBe(245000);
    expect(document.querySelectorAll('.transaction-card').length).toBe(3);
    
    // Sort and verify
    sortTransactions('amountDesc');
    const cards = document.querySelectorAll('.transaction-card');
    expect(cards[0]).toHaveData('id', tx3.id); // Movie (120000) should be first
    
    // Delete and verify cascade update
    deleteTransaction(tx2.id);
    expect(AppState.transactions.length).toBe(2);
    expect(calculateTotalBalance()).toBe(170000);
    expect(document.querySelectorAll('.transaction-card').length).toBe(2);
  });
});
```

### Performance Benchmarks

```javascript
// Benchmarking key operations
Benchmark.measure('addTransaction', () => {
  addTransaction('Test Item', 50000, 'Food');
}, 1000); // Should be < 10ms average

Benchmark.measure('renderTransactions', () => {
  renderTransactions(AppState.transactions);
}, 500); // Should be < 50ms average

Benchmark.measure('updateChart', () => {
  updateChart(calculateCategoryTotals());
}, 200); // Should be < 200ms average
```

---

## Core Functions Design

### Data Management Functions

```javascript
/**
 * Adds a new transaction to the application
 * @param {string} itemName - Name of the expense item
 * @param {number} amount - Amount in numeric format
 * @param {string} category - Category: 'Food', 'Transport', or 'Fun'
 * @returns {Transaction} The created transaction object
 * @throws {Error} If validation fails or storage fails
 */
function addTransaction(itemName, amount, category) {
  // 1. Validate inputs
  const validation = validateForm(itemName, amount, category);
  if (!validation.valid) {
    throw new Error(validation.errors[0].message);
  }
  
  // 2. Create transaction object
  const transaction = {
    id: generateUniqueId(),
    itemName: itemName.trim(),
    amount: Number(amount),
    category: category,
    timestamp: Date.now()
  };
  
  // 3. Add to in-memory array
  AppState.transactions.unshift(transaction); // Add to top
  
  // 4. Persist to local storage
  saveData();
  
  // 5. Update all dependent displays
  renderTransactions(AppState.transactions, AppState.sortOption);
  updateBalance();
  updateChart();
  
  return transaction;
}

/**
 * Deletes a transaction by ID
 * @param {string} id - Transaction ID to delete
 * @returns {void}
 */
function deleteTransaction(id) {
  // 1. Find transaction in array
  const index = AppState.transactions.findIndex(t => t.id === id);
  if (index === -1) {
    console.error('Transaction not found:', id);
    return;
  }
  
  // 2. Remove from array
  AppState.transactions.splice(index, 1);
  
  // 3. Persist changes
  saveData();
  
  // 4. Update all displays
  renderTransactions(AppState.transactions, AppState.sortOption);
  updateBalance();
  updateChart();
  
  // 5. Show visual confirmation
  showDeleteConfirmation();
}

/**
 * Validates form input
 * @param {string} itemName
 * @param {string|number} amount
 * @param {string} category
 * @returns {{valid: boolean, errors: Array}}
 */
function validateForm(itemName, amount, category) {
  const errors = [];
  
  // Item name validation
  if (!itemName || itemName.trim() === '') {
    errors.push({
      field: 'itemName',
      message: 'Item name is required'
    });
  }
  
  // Amount validation
  if (!amount || amount === '') {
    errors.push({
      field: 'amount',
      message: 'Amount is required'
    });
  } else if (isNaN(Number(amount))) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a positive number'
    });
  } else if (Number(amount) <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than zero'
    });
  }
  
  // Category validation
  const validCategories = ['Food', 'Transport', 'Fun'];
  if (!category || !validCategories.includes(category)) {
    errors.push({
      field: 'category',
      message: 'Please select a valid category'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Generates unique ID for transactions
 * @returns {string} Unique ID
 */
function generateUniqueId() {
  // Use timestamp + random component for uniqueness
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Display Update Functions

```javascript
/**
 * Recalculates and updates the total balance display
 * @returns {number} The calculated balance
 */
function updateBalance() {
  const balance = AppState.transactions.reduce((sum, t) => sum + t.amount, 0);
  const balanceElement = document.getElementById('totalBalance');
  
  if (balanceElement) {
    const formatted = formatCurrency(balance);
    balanceElement.textContent = formatted;
    
    // Add animation class for visual feedback
    balanceElement.classList.add('balance-updated');
    setTimeout(() => balanceElement.classList.remove('balance-updated'), 300);
  }
  
  // Also update monthly summary
  updateMonthlySummary();
  
  return balance;
}

/**
 * Updates the pie chart visualization
 * @returns {void}
 */
function updateChart() {
  const categoryTotals = calculateCategoryTotals();
  
  if (!AppState.chartInstance) {
    initChart();
  }
  
  // Update chart data
  AppState.chartInstance.data.datasets[0].data = [
    categoryTotals.Food,
    categoryTotals.Transport,
    categoryTotals.Fun
  ];
  
  AppState.chartInstance.update('none'); // Update without animation
}

/**
 * Renders all transactions to the DOM
 * @param {Transaction[]} transactions - Transactions to render
 * @param {string} sortOption - Sort option to apply
 * @returns {void}
 */
function renderTransactions(transactions, sortOption = 'default') {
  const listElement = document.getElementById('transactionList');
  const emptyState = document.getElementById('emptyState');
  
  if (!listElement) return;
  
  // Sort transactions
  const sorted = sortTransactionsList(transactions, sortOption);
  
  // Clear existing
  listElement.innerHTML = '';
  
  if (sorted.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Render each transaction
  sorted.forEach(tx => {
    const card = createTransactionCard(tx);
    listElement.appendChild(card);
  });
  
  // Attach delete listeners
  attachDeleteListeners();
}

/**
 * Creates a transaction card element
 * @param {Transaction} transaction
 * @returns {HTMLElement}
 */
function createTransactionCard(transaction) {
  const card = document.createElement('div');
  card.className = 'transaction-card';
  card.dataset.id = transaction.id;
  
  const date = new Date(transaction.timestamp);
  const formattedDate = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  card.innerHTML = `
    <div class="card-content">
      <div class="card-info">
        <h3 class="transaction-name">${escapeHtml(transaction.itemName)}</h3>
        <span class="transaction-category category-${transaction.category}">
          ${transaction.category}
        </span>
        <p class="transaction-date">${formattedDate}</p>
      </div>
      <p class="transaction-amount">${formatCurrency(transaction.amount)}</p>
    </div>
    <button class="delete-button" aria-label="Delete transaction" data-id="${transaction.id}">
      ✕
    </button>
  `;
  
  return card;
}
```

### Calculation Functions

```javascript
/**
 * Calculates total amount per category
 * @returns {{Food: number, Transport: number, Fun: number}}
 */
function calculateCategoryTotals() {
  return AppState.transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {
    Food: 0,
    Transport: 0,
    Fun: 0
  });
}

/**
 * Formats number as Indonesian Rupiah currency
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (!Number.isFinite(amount)) return 'Rp 0,00';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Gets current month's transactions and summary
 * @returns {{total: number, count: number, month: string}}
 */
function getMonthlyData() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyTransactions = AppState.transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });
  
  const total = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  const monthName = now.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });
  
  return {
    total: total,
    count: monthlyTransactions.length,
    month: monthName
  };
}

/**
 * Updates monthly summary display
 * @returns {void}
 */
function updateMonthlySummary() {
  const data = getMonthlyData();
  
  const monthElement = document.getElementById('currentMonth');
  const totalElement = document.getElementById('monthlyTotal');
  const countElement = document.getElementById('transactionCount');
  
  if (monthElement) monthElement.textContent = data.month;
  if (totalElement) totalElement.textContent = formatCurrency(data.total);
  if (countElement) countElement.textContent = `${data.count} transaction${data.count !== 1 ? 's' : ''}`;
}
```

### Storage Functions

```javascript
/**
 * Saves current transactions array to Local Storage
 * @returns {void}
 */
function saveData() {
  try {
    const serialized = JSON.stringify(AppState.transactions);
    localStorage.setItem('expenseApp_transactions', serialized);
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
    // Continue app without persistence
  }
}

/**
 * Loads transactions from Local Storage into memory
 * @returns {void}
 */
function loadData() {
  try {
    const stored = localStorage.getItem('expenseApp_transactions');
    if (stored) {
      AppState.transactions = JSON.parse(stored);
    } else {
      AppState.transactions = [];
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
    AppState.transactions = []; // Start fresh
  }
}

/**
 * Saves theme preference to Local Storage
 * @param {string} theme - 'light' or 'dark'
 * @returns {void}
 */
function saveThemePreference(theme) {
  try {
    localStorage.setItem('expenseApp_theme', theme);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
}

/**
 * Loads theme preference from Local Storage
 * @returns {string} Saved theme or 'light' as default
 */
function loadThemePreference() {
  try {
    const saved = localStorage.getItem('expenseApp_theme');
    return saved || 'light';
  } catch (error) {
    console.error('Failed to load theme preference:', error);
    return 'light';
  }
}
```

### Utility Functions

```javascript
/**
 * Sorts transactions array based on selected option
 * @param {Transaction[]} transactions
 * @param {string} sortOption
 * @returns {Transaction[]} Sorted copy of array
 */
function sortTransactionsList(transactions, sortOption) {
  const sorted = [...transactions]; // Create copy
  
  switch (sortOption) {
    case 'amountDesc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'amountAsc':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'default':
    default:
      return sorted; // Already in reverse chronological order
  }
}

/**
 * Toggles between light and dark theme
 * @returns {void}
 */
function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  
  // Apply to document
  document.documentElement.setAttribute('data-theme', AppState.theme);
  
  // Update theme icon
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = AppState.theme === 'dark' ? '☀️' : '🌙';
  }
  
  // Save preference
  saveThemePreference(AppState.theme);
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Shows success notification
 * @returns {void}
 */
function showSuccessNotification() {
  const notification = document.getElementById('successNotification');
  if (!notification) return;
  
  notification.classList.add('active');
  setTimeout(() => {
    notification.classList.remove('active');
  }, 3000);
}

/**
 * Initializes Chart.js instance
 * @returns {Chart} Chart instance
 */
function initChart() {
  const canvas = document.getElementById('expenseChart');
  if (!canvas) {
    console.error('Chart canvas not found');
    return null;
  }
  
  const categoryTotals = calculateCategoryTotals();
  
  AppState.chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Food', 'Transport', 'Fun'],
      datasets: [{
        data: [categoryTotals.Food, categoryTotals.Transport, categoryTotals.Fun],
        backgroundColor: [
          AppState.chartColors.Food,
          AppState.chartColors.Transport,
          AppState.chartColors.Fun
        ],
        borderColor: ['#fff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
  
  return AppState.chartInstance;
}
```

---

## DOM Structure & Query Selectors

```javascript
// Header
const header = document.getElementById('header');
const appTitle = document.querySelector('.app-title');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');

// Dashboard
const dashboard = document.getElementById('dashboard');
const totalBalance = document.getElementById('totalBalance');
const expenseChart = document.getElementById('expenseChart');

// Monthly Summary
const currentMonth = document.getElementById('currentMonth');
const monthlyTotal = document.getElementById('monthlyTotal');
const transactionCount = document.getElementById('transactionCount');

// Form
const expenseForm = document.getElementById('expenseForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const itemNameError = document.getElementById('itemNameError');
const amountError = document.getElementById('amountError');
const categoryError = document.getElementById('categoryError');
const submitButton = document.querySelector('.submit-button');
const successNotification = document.getElementById('successNotification');

// Transaction List
const transactionSection = document.getElementById('transactionSection');
const sortSelector = document.getElementById('sortSelector');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');

// Event listeners
expenseForm.addEventListener('submit', handleFormSubmit);
themeToggle.addEventListener('click', handleThemeToggle);
sortSelector.addEventListener('change', handleSortChange);
```

---

## Event Handling Strategy

### Event Flow Diagram

```
USER INTERACTION
    │
    ├─→ Form Submit Event
    │       ├─ preventDefault()
    │       ├─ getFormValues()
    │       ├─ validateForm()
    │       ├─ IF valid → addTransaction() → emit 'transactionAdded'
    │       └─ ELSE → displayErrors()
    │
    ├─→ Delete Button Click Event
    │       ├─ extract transaction ID from data-id
    │       ├─ deleteTransaction(id)
    │       └─ emit 'transactionDeleted'
    │
    ├─→ Sort Selector Change Event
    │       ├─ getSelectedSortOption()
    │       ├─ AppState.sortOption = selected
    │       └─ renderTransactions(AppState.transactions, sortOption)
    │
    ├─→ Theme Toggle Click Event
    │       ├─ toggleTheme()
    │       ├─ saveThemePreference()
    │       └─ applyThemeToDOM()
    │
    └─→ Window Load Event
            ├─ loadThemePreference()
            ├─ loadData()
            ├─ renderTransactions()
            ├─ updateBalance()
            └─ initChart()
```

### Event Listeners Setup

```javascript
/**
 * Initializes all event listeners
 */
function initializeEventListeners() {
  // Form submission
  const form = document.getElementById('expenseForm');
  form.addEventListener('submit', handleFormSubmit);
  
  // Delete buttons (delegated)
  const transactionList = document.getElementById('transactionList');
  transactionList.addEventListener('click', (e) => {
    if (e.target.closest('.delete-button')) {
      const card = e.target.closest('.transaction-card');
      const id = card.dataset.id;
      deleteTransaction(id);
    }
  });
  
  // Sort selector
  const sortSelector = document.getElementById('sortSelector');
  sortSelector.addEventListener('change', (e) => {
    AppState.sortOption = e.target.value;
    renderTransactions(AppState.transactions, AppState.sortOption);
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  // Window events
  window.addEventListener('load', initializeApp);
  window.addEventListener('beforeunload', saveData);
  
  // Form input cleanup on focus
  const inputs = document.querySelectorAll('.form-input, .form-select');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      clearErrorsForField(input.id);
    });
  });
}

/**
 * Handles form submission
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const { itemName, amount, category } = FormComponent.getFormValues();
  
  try {
    addTransaction(itemName, amount, category);
    FormComponent.clearForm();
    showSuccessNotification();
  } catch (error) {
    console.error('Error adding transaction:', error);
    const validation = validateForm(itemName, amount, category);
    FormComponent.displayErrors(validation.errors);
  }
}

/**
 * Application initialization
 */
function initializeApp() {
  try {
    // 1. Load preferences
    AppState.theme = loadThemePreference();
    document.documentElement.setAttribute('data-theme', AppState.theme);
    
    // 2. Load data
    loadData();
    
    // 3. Render initial state
    renderTransactions(AppState.transactions, 'default');
    updateBalance();
    initChart();
    
    // 4. Setup event listeners
    initializeEventListeners();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}
```

---

## Styling Strategy

### CSS Variables untuk Theme

```css
/* Light Mode (Default) */
:root,
[data-theme="light"] {
  /* Primary Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #f1f3f5;
  
  /* Text Colors */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-light: #999999;
  
  /* Accent Colors */
  --color-accent: #007bff;
  --color-accent-hover: #0056b3;
  --color-success: #28a745;
  --color-error: #dc3545;
  
  /* Category Colors */
  --color-category-food: #FF6B6B;
  --color-category-transport: #4ECDC4;
  --color-category-fun: #FFE66D;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Borders */
  --color-border: #e0e0e0;
  --color-border-light: #f0f0f0;
}

/* Dark Mode */
[data-theme="dark"] {
  /* Primary Colors */
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-bg-tertiary: #3a3a3a;
  
  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #cccccc;
  --color-text-light: #999999;
  
  /* Accent Colors */
  --color-accent: #0a84ff;
  --color-accent-hover: #0056d6;
  --color-success: #34c759;
  --color-error: #ff3b30;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  
  /* Borders */
  --color-border: #404040;
  --color-border-light: #2a2a2a;
}
```

### Responsive Breakpoints

```css
/* Mobile First Approach */

/* Base/Mobile: < 768px */
body {
  font-size: 14px;
  padding: 16px;
}

.app-container {
  max-width: 100%;
}

.dashboard {
  grid-template-columns: 1fr;
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) {
  body {
    font-size: 15px;
    padding: 24px;
  }
  
  .dashboard {
    grid-template-columns: 1fr 1fr;
  }
  
  .chart-container {
    max-width: 400px;
    margin: 0 auto;
  }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  body {
    font-size: 16px;
    padding: 32px;
  }
  
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  
  .dashboard {
    grid-column: 1 / -1;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

### Spacing System (8px Base Unit)

```css
/* Spacing Tokens */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Usage */
.form-group {
  margin-bottom: var(--spacing-md);
}

.transaction-card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.header {
  padding: var(--spacing-lg) var(--spacing-md);
}
```

### Typography Scale

```css
/* Font Sizes */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Headings */
h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-normal);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
```

### Component Styling Examples

```css
/* Form Elements */
.form-input,
.form-select {
  border-radius: 4px;
  border: 2px solid var(--color-border-light);
  padding: 12px 16px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input.error {
  border-color: var(--color-error);
}

/* Buttons */
.submit-button {
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.submit-button:hover {
  background-color: var(--color-accent-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.submit-button:active {
  transform: translateY(0);
}

/* Transaction Cards */
.transaction-card {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.transaction-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  background-color: var(--color-bg-tertiary);
}

.delete-button {
  background: none;
  border: none;
  color: var(--color-error);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
}

.delete-button:hover {
  transform: scale(1.2);
  color: var(--color-error);
}

/* Category Badges */
.transaction-category {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: var(--font-weight-medium);
}

.category-Food {
  background-color: rgba(255, 107, 107, 0.1);
  color: var(--color-category-food);
}

.category-Transport {
  background-color: rgba(78, 205, 196, 0.1);
  color: var(--color-category-transport);
}

.category-Fun {
  background-color: rgba(255, 230, 109, 0.1);
  color: var(--color-category-fun);
}
```

---

## Local Storage Schema

```javascript
/**
 * Local Storage Structure
 */

// Key: 'expenseApp_transactions'
// Value: JSON stringified array
localStorage['expenseApp_transactions'] = JSON.stringify([
  {
    id: '1702425600000-abc123def',
    itemName: 'Coffee',
    amount: 65000,
    category: 'Food',
    timestamp: 1702425600000
  },
  {
    id: '1702425700000-xyz789abc',
    itemName: 'Taxi to Office',
    amount: 75000,
    category: 'Transport',
    timestamp: 1702425700000
  },
  // ... more transactions
]);

// Key: 'expenseApp_theme'
// Value: 'light' or 'dark'
localStorage['expenseApp_theme'] = 'dark';

/**
 * Recovery and Migration Strategy
 */

// Version check (for future migrations)
localStorage['expenseApp_version'] = '1.0';

// Data integrity check on load
function validateStoredData(data) {
  if (!Array.isArray(data)) return false;
  
  return data.every(tx => 
    typeof tx.id === 'string' &&
    typeof tx.itemName === 'string' &&
    typeof tx.amount === 'number' &&
    ['Food', 'Transport', 'Fun'].includes(tx.category) &&
    typeof tx.timestamp === 'number'
  );
}
```

---

## Chart.js Configuration

```javascript
/**
 * Chart.js Doughnut Chart Configuration
 */
const chartConfig = {
  type: 'doughnut',
  
  data: {
    labels: ['Food', 'Transport', 'Fun'],
    datasets: [{
      data: [100000, 75000, 50000], // Will be updated dynamically
      backgroundColor: [
        '#FF6B6B',  // Food
        '#4ECDC4',  // Transport
        '#FFE66D'   // Fun
      ],
      borderColor: ['#ffffff'],
      borderWidth: 2,
      borderRadius: [4, 4, 4]
    }]
  },
  
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: 500
          },
          color: 'var(--color-text-primary)',
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i];
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return {
                text: `${label}: Rp ${value.toLocaleString()} (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: 2,
                hidden: false,
                index: i
              };
            });
          }
        }
      },
      
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 600 },
        bodyFont: { size: 12 },
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        displayColors: true,
        padding: 16,
        
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return `${label}: Rp ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
      
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          return ((value / total) * 100).toFixed(0) + '%';
        }
      }
    },
    
    animation: {
      duration: 500,
      easing: 'easeInOutQuart'
    }
  }
};
```

---

## Performance Optimization

### Batch DOM Updates

```javascript
/**
 * Update multiple elements efficiently
 */
function batchUpdateUI() {
  // Use DocumentFragment to batch DOM insertions
  const fragment = document.createDocumentFragment();
  
  AppState.transactions.forEach(tx => {
    const card = createTransactionCard(tx);
    fragment.appendChild(card);
  });
  
  // Single DOM operation
  transactionList.innerHTML = '';
  transactionList.appendChild(fragment);
}

/**
 * Debounce frequent updates
 */
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedRender = debounce(() => {
  renderTransactions(AppState.transactions, AppState.sortOption);
}, 200);
```

### Efficient Array Operations

```javascript
// Use array methods correctly for performance

// ✓ Good: Single pass with reduce
const categoryTotals = transactions.reduce((acc, tx) => {
  acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
  return acc;
}, {});

// ✗ Avoid: Multiple loops
const foodTotal = transactions.filter(t => t.category === 'Food')
                              .reduce((sum, t) => sum + t.amount, 0);
const transportTotal = transactions.filter(t => t.category === 'Transport')
                                   .reduce((sum, t) => sum + t.amount, 0);

// ✓ Good: Find single element
const transaction = transactions.find(t => t.id === id);

// ✗ Avoid: Filter when finding one element
const transaction = transactions.filter(t => t.id === id)[0];
```

---

## File Structure

```
expense-budget-visualizer/
├── index.html                 # Main HTML entry point
├── css/
│   ├── style.css             # Main stylesheet with themes
│   ├── responsive.css        # Responsive design breakpoints
│   └── animations.css        # Animation classes
├── js/
│   ├── app.js                # Main application entry
│   ├── components.js         # Component definitions
│   ├── core-functions.js     # Core business logic
│   ├── event-handlers.js     # Event listener setup
│   ├── storage.js            # Local Storage utilities
│   ├── utils.js              # Utility functions
│   └── chart-config.js       # Chart.js configuration
├── assets/
│   └── favicon.ico          # App icon
├── tests/
│   ├── properties.test.js    # Property-based tests
│   ├── unit.test.js          # Unit tests
│   └── integration.test.js   # Integration tests
└── .kiro/
    └── specs/
        └── expense-budget-visualizer/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

---

## Configuration Summary

| Aspect | Value |
|--------|-------|
| **Storage Quota** | ~5MB per domain (sufficient for 10,000+ transactions) |
| **Chart Update Threshold** | Minimum 0.1 second delay to batch updates |
| **Transaction ID Strategy** | Timestamp + random string (ensures uniqueness) |
| **Locale** | Indonesian (id-ID) for date/currency formatting |
| **Default Theme** | Light mode (system preference as fallback) |
| **Animation Duration** | 300ms for UI transitions |
| **Form Validation Debounce** | 200ms for real-time validation feedback |
| **Chart Animation** | 500ms with easeInOutQuart easing |

---

## Next Steps

This design document provides a comprehensive blueprint for implementation. The next phase will include:

1. **Task Creation**: Breaking down requirements into actionable development tasks
2. **Component Implementation**: Building each component according to specifications
3. **Testing**: Implementing property-based and unit tests
4. **Integration**: Wiring all components together
5. **Optimization**: Performance tuning and accessibility improvements

All implementations will follow this design document strictly to ensure consistency and correctness across the application.
