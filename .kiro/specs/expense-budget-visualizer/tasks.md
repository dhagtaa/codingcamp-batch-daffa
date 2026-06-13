# Tasks: Expense & Budget Visualizer

## Setup & Foundation

### 1.1 Create project structure
- Create `/css` folder for stylesheets
- Create `/js` folder for JavaScript files
- Create `/assets` folder for resources
- Create `index.html` at root
- Create `js/script.js` for main application
- References: Requirements 12.1, 14.4

### 1.2 Create index.html with boilerplate
- Add HTML5 doctype and semantic structure
- Include meta tags (charset, viewport)
- Link CSS and JavaScript files
- Add Chart.js CDN link
- References: Requirements 1.1, 7.1, 14.1

### 1.3 Create CSS variables and reset styles
- Define light mode color palette variables
- Define dark mode color palette variables
- Setup typography hierarchy (h1-h4)
- Setup spacing scale (8px, 16px, 24px, 32px)
- References: Requirements 8.1, 8.2, 8.4, 9.5, 9.6

### 1.4 Initialize AppState object and global structure
- Define AppState with: transactions[], theme, sortOption, chartInstance, chartColors
- Setup event listener initialization function
- Export core function signatures
- References: Requirements 12.1, 13.1, 13.5

---

## HTML Structure

### 2.1 Implement Header component
- Create `<header>` with app title (💰 Expense & Budget Visualizer)
- Add theme toggle button with aria-label
- Add semantic markup and accessibility attributes
- References: Requirements 8.3, 14.1

### 2.2 Implement Dashboard component
- Create balance card with `id="totalBalance"`
- Create monthly summary card (month, total, count)
- Create chart container with `<canvas id="expenseChart">`
- References: Requirements 5.1, 6.1, 11.1, 11.2, 11.3

### 2.3 Implement Form component
- Create form with `id="expenseForm"`
- Add itemName input field
- Add amount input field (type="number")
- Add category select with Food, Transport, Fun options
- Add error message spans for each field
- Add submit button
- References: Requirements 1.1, 1.2, 8.5, 14.6

### 2.4 Implement Transaction List component
- Create section with sort controls
- Add sort selector with Default, Amount Desc, Amount Asc, Category options
- Add `id="transactionList"` container
- Add empty state placeholder
- References: Requirements 3.1, 3.4, 10.1, 14.1

### 2.5 Add success notification element
- Create notification div with `class="notification success-notification"`
- Add success message text
- Setup for hidden by default
- References: Requirements 1.7

---

## CSS Styling

### 3.1 Implement base styles and CSS variables
- Setup CSS variable structure for colors (light/dark)
- Create root selector with light mode defaults
- Create data-theme="dark" selector for dark mode
- Setup typography base styles
- References: Requirements 8.1, 8.2, 8.4, 9.5

### 3.2 Implement component-specific styles
- Style form inputs (border, padding, 4-8px radius)
- Style transaction cards (rounded corners, shadow)
- Style buttons with hover/focus/active states
- Style category badges and labels
- References: Requirements 8.2, 8.3, 8.5, 8.6

### 3.3 Implement responsive design for mobile
- Single-column layout for width < 768px
- Minimum 44px height for touch targets
- Prevent horizontal scrolling
- Stack form and list vertically
- References: Requirements 7.1, 7.2, 7.5, 8.8

### 3.4 Implement responsive design for tablet
- Balanced two-column layout for 768-1024px
- Adjust spacing and sizing for tablet
- Optimize chart dimensions
- References: Requirements 7.1, 7.3

### 3.5 Implement responsive design for desktop
- Optimize layout for width > 1024px
- Full-width optimization with max-width constraint
- Enhanced spacing and visual hierarchy
- References: Requirements 7.1, 7.4

### 3.6 Verify CSS renders correctly
- Ensure all components display correctly
- Verify responsive breakpoints work
- Verify colors accessible in both themes
- Verify no horizontal scroll on mobile
- References: Requirements 7.1-7.4, 8.1-8.6, 9.5-9.7

---

## Utility Functions

### 4.1 Implement formatCurrency() function
- Accept numeric amount parameter
- Return string formatted as "Rp X.XXX,XX"
- Handle zero, positive, and large numbers
- Handle invalid inputs gracefully
- References: Requirements 5.5, 12.1

### 4.2 Property test: formatCurrency() consistency
- **Validates: Requirement 5.5**
- **Property: Balance currency formatting is consistent**
- Test with 100+ random amounts
- Verify format consistency for same amount

### 4.3 Implement escapeHtml() utility
- Accept string parameter
- Escape HTML special characters (prevent XSS)
- Return safe HTML string
- References: Requirements 14.2

### 4.4 Implement generateUniqueId() function
- Generate unique ID for each transaction
- Use timestamp-based or UUID approach
- Ensure no duplicate IDs
- References: Requirements 13.3

### 4.5 Implement validateForm() function
- Accept itemName, amount, category parameters
- Validate itemName (not empty/whitespace)
- Validate amount (positive number, > 0)
- Validate category (Food, Transport, or Fun)
- Return { valid: boolean, errors: [] }
- References: Requirements 1.3, 1.4, 1.5, 1.8, 12.1

### 4.6 Property test: validateForm() rejects invalid input
- **Validates: Requirements 1.3, 1.4, 1.5, 1.8**
- **Property: Form validation rejects all invalid input**
- Test with 100+ combinations of invalid inputs
- Verify all error types are caught

---

## Data Management Functions

### 5.1 Implement addTransaction() function
- Accept itemName, amount, category parameters
- Validate using validateForm()
- Create transaction object with id, itemName, amount, category, timestamp
- Push to AppState.transactions
- Call saveData() for persistence
- Return transaction on success or error object on failure
- References: Requirements 2.1, 12.1, 13.3, 13.4

### 5.2 Property test: addTransaction() round-trip safety
- **Validates: Requirements 1.6, 2.1, 2.2, 2.5**
- **Property: Valid transaction addition is round-trip safe**
- Test valid transaction added and saved
- Verify retrieval after reload simulation
- Run with 100+ random valid transactions

### 5.3 Implement deleteTransaction() function
- Accept transaction ID parameter
- Remove transaction from AppState.transactions
- Call saveData() for persistence
- Return success/failure status
- References: Requirements 4.1, 4.2, 4.3, 4.4, 2.4

### 5.4 Property test: deleteTransaction() atomicity
- **Validates: Requirements 4.2, 4.3, 4.4, 2.4**
- **Property: Transaction deletion is atomic and complete**
- Test transaction removed from array and storage
- Verify deletion affects all dependent displays

### 5.5 Implement calculateTotalBalance() function
- Accept optional transactions array (default to AppState.transactions)
- Calculate sum of all transaction amounts
- Return numeric total
- Handle empty array (return 0)
- References: Requirements 5.2, 13.1

### 5.6 Property test: calculateTotalBalance() accuracy
- **Validates: Requirements 5.2, 5.3, 5.4**
- **Property: Balance always equals sum of all amounts**
- Test with 200+ random transaction arrays
- Verify calculated balance matches mathematical sum

### 5.7 Implement calculateCategoryTotals() function
- Accept optional transactions array
- Calculate sum for each category (Food, Transport, Fun)
- Return { Food, Transport, Fun } object
- Handle missing categories (return 0)
- References: Requirements 6.2, 6.3, 6.4, 6.5

### 5.8 Property test: calculateCategoryTotals() accuracy
- **Validates: Requirements 6.2, 6.3, 6.4, 6.5**
- **Property: Category total calculations are accurate**
- Test with mixed category transactions
- Verify per-category totals correct

---

## Storage & Persistence Functions

### 6.1 Implement saveData() function
- Accept optional transactions array (default to AppState.transactions)
- Convert to JSON and save to localStorage with key 'expenseApp_transactions'
- Wrap in try-catch for quota exceeded errors
- Log errors without crashing app
- References: Requirements 2.1, 2.4, 2.5

### 6.2 Implement loadData() function
- Retrieve from localStorage key 'expenseApp_transactions'
- Parse JSON to array
- Handle missing or corrupt data (return empty array)
- Update AppState.transactions
- Handle JSON parse errors gracefully
- References: Requirements 2.2, 2.3, 13.4

### 6.3 Property test: persistence round-trip safety
- **Validates: Requirements 2.1, 2.2, 2.5**
- **Property: Valid transaction addition is round-trip safe (partial)**
- Test save/load maintains data integrity
- Verify no data loss across cycles

### 6.4 Implement saveThemePreference() function
- Accept theme parameter ('light' or 'dark')
- Save to localStorage with key 'expenseApp_theme'
- References: Requirements 9.3

### 6.5 Implement loadThemePreference() function
- Retrieve from localStorage key 'expenseApp_theme'
- Return 'light' as default if not set
- References: Requirements 9.4

---

## Display Update Functions

### 7.1 Implement updateBalance() function
- Calculate total using calculateTotalBalance()
- Format using formatCurrency()
- Update DOM element with id='totalBalance'
- Add optional animation class for feedback
- References: Requirements 5.3, 5.4, 5.6, 5.7

### 7.2 Property test: balance display accuracy
- **Validates: Requirements 5.2, 5.3, 5.4**
- **Property: Balance always equals sum of all amounts (partial)**
- Test balance updates after add/delete
- Verify zero display correct

### 7.3 Implement renderTransactions() function
- Accept optional transactions array and sortOption
- Sort before rendering using sortOption
- Clear existing transaction cards
- Create card HTML for each transaction
- Format amount as currency
- Set data-id attribute
- Show empty state if no transactions
- References: Requirements 3.1, 3.2, 3.5, 14.3

### 7.4 Property test: transaction rendering completeness
- **Validates: Requirement 3.2**
- **Property: Rendered transaction display contains all required fields**
- Test rendered cards have itemName, amount, category, delete button
- Verify with 0, 1, multiple transactions

### 7.5 Implement updateMonthlySummary() function
- Get current month and year
- Filter transactions for current month only
- Calculate total of filtered transactions
- Count filtered transactions
- Update DOM elements (currentMonth, monthlyTotal, transactionCount)
- References: Requirements 11.2, 11.3, 11.5

### 7.6 Property test: monthly summary exclusion
- **Validates: Requirement 11.4**
- **Property: Monthly summary excludes previous month transactions**
- Test with mix of current and previous month transactions
- Verify summary only includes current month

---

## Chart Integration Functions

### 8.1 Implement initChart() function
- Get canvas element with id='expenseChart'
- Create Chart.js pie chart instance
- Set labels: Food, Transport, Fun
- Set backgroundColor from AppState.chartColors
- Configure options (responsive, maintainAspectRatio)
- Store in AppState.chartInstance
- Return chart instance
- References: Requirements 6.1, 6.2

### 8.2 Implement updateChart() function
- Get category totals using calculateCategoryTotals()
- Initialize chart if not exists
- Update chart data with new amounts
- Handle zero-value categories
- Call chart.update() to re-render
- References: Requirements 6.4, 6.5

### 8.3 Property test: chart data consistency
- **Validates: Requirements 6.1, 6.2, 6.4, 6.5**
- **Property: Chart visualization reflects current transaction state**
- Test chart updates after add/delete
- Verify chart data matches category totals
- Verify 3 segments present

---

## Theme Management Functions

### 9.1 Implement toggleTheme() function
- Toggle AppState.theme between 'light' and 'dark'
- Call applyTheme() to apply to DOM
- Call saveThemePreference() for persistence
- References: Requirements 9.1, 9.2, 9.3

### 9.2 Implement applyTheme() function
- Apply data-theme attribute to document.documentElement
- Update theme toggle button icon (🌙 for light, ☀️ for dark)
- Apply theme to all elements
- References: Requirements 9.2, 9.5, 9.6

### 9.3 Property test: theme persistence and atomicity
- **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
- **Property: Theme toggle updates all elements atomically**
- Test theme saves and loads correctly
- Verify theme applies to all elements

---

## Sort Functionality

### 10.1 Implement sortTransactionsList() function
- Accept transactions array and sortOption parameter
- Implement sorting for each option:
  - 'default': by timestamp descending (most recent first)
  - 'amountDesc': by amount descending
  - 'amountAsc': by amount ascending
  - 'category': by category alphabetically
- Return sorted array (do NOT mutate original)
- References: Requirements 10.2, 10.3, 10.4, 10.5, 10.6

### 10.2 Property test: sort consistency
- **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**
- **Property: Sort order is applied consistently to all transactions**
- Test each sort option with 100+ random datasets
- Verify consistent results across multiple sorts

---

## Event Handling

### 11.1 Setup form submit event listener
- Add listener to form with id='expenseForm'
- Prevent default submission
- Get form values (itemName, amount, category)
- Validate using validateForm()
- If valid: add transaction, clear form, show success notification, update displays
- If invalid: display error messages
- References: Requirements 1.6, 12.1, 14.1, 14.6

### 11.2 Setup delete button listeners (delegated)
- Add click listener to transaction list container
- Detect clicks on delete buttons
- Extract transaction ID from data-id
- Call deleteTransaction()
- Update all displays after deletion
- Show deletion visual feedback
- References: Requirements 4.1, 4.2, 4.3, 4.4

### 11.3 Setup sort selector event listener
- Add change listener to sort selector
- Get selected value
- Update AppState.sortOption
- Call renderTransactions() with new sort
- References: Requirements 10.2, 10.3

### 11.4 Setup theme toggle event listener
- Add click listener to theme toggle button
- Call toggleTheme() function
- References: Requirements 9.1, 9.2

### 11.5 Setup window load event listener
- On load: loadData(), loadTheme(), renderTransactions(), updateBalance(), updateMonthlySummary()
- Initialize chart if transactions exist
- References: Requirements 2.2, 9.4, 14.2

### 11.6 Setup form field focus listeners
- Add focus listeners to all form inputs
- Clear error messages on focus
- Remove error classes from inputs
- References: Requirements 1.3, 1.8

---

## Error Handling

### 12.1 Implement inline error message display
- For each validation error, find error message span
- Set error message text
- Add error class to input
- Show error message
- References: Requirements 1.3, 1.8

### 12.2 Implement form field error clearing
- On field focus or value change: clear error
- Remove error class from input
- References: Requirements 1.8

### 12.3 Implement localStorage error handling
- Wrap localStorage operations in try-catch
- Handle quota exceeded errors
- Handle access denied errors
- Show user-friendly notifications
- References: Requirements 2.1, 2.2

### 12.4 Implement graceful fallbacks
- If Chart.js not loaded: show text summary fallback
- If localStorage unavailable: show warning banner
- If calculation results in NaN: return "Rp 0,00"
- References: Requirements 12.8

---

## Property-Based Testing

### 13.1 Setup fast-check testing framework
- Install fast-check library
- Create test configuration
- Setup test runner (Jest, Vitest, or Mocha)
- References: Design Document Testing Strategy

### 13.2 Implement Property 7: New transactions at top
- **Validates: Requirement 3.5**
- **Property: New transactions appear at top of list**
- Test with default sort option
- Verify newest transaction always at top

### 13.3 Implement Property 12: Monthly summary updates
- **Validates: Requirements 11.5, 11.6**
- **Property: Monthly summary updates on every transaction change**
- Test add/delete operations
- Verify summary updates immediately

### 13.4 Implement Property 13: Empty state correctness
- **Validates: Requirement 3.4**
- **Property: Empty state display is contextually correct**
- Test visibility when no transactions
- Test visibility when transactions present

### 13.5 Implement Property 15: Array data integrity
- **Validates: Requirements 2.5, 13.1, 13.2, 13.5, 13.6**
- **Property: Transaction array data integrity**
- Test all required properties present
- Verify all IDs unique
- Test in-memory array matches localStorage

---

## Integration Testing

### 14.1 Integration test: complete add-delete-sort workflow
- Add multiple transactions with different categories
- Verify balance updates after each add
- Verify chart updates
- Sort with different criteria
- Delete transaction
- Verify all displays update atomically
- References: Requirements 1.6, 4.3, 10.3, 14.7

### 14.2 Integration test: theme persistence
- Toggle light to dark mode
- Verify all elements updated
- Reload page
- Verify theme persisted from localStorage
- References: Requirements 9.1, 9.2, 9.3, 9.4

### 14.3 Integration test: responsive design
- Simulate mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Verify layouts correct at each breakpoint
- Verify no horizontal scrolling on mobile
- References: Requirements 7.1, 7.2, 7.3, 7.4

### 14.4 Integration test: data persistence
- Add multiple transactions
- Verify saved to localStorage
- Simulate page reload
- Verify transactions loaded back
- Verify balance and chart correct
- References: Requirements 2.1, 2.2, 2.5, 2.6

---

## Final Polish & QA

### 15.1 Add code documentation
- Add JSDoc comments to all functions
- Add inline comments for complex logic
- Document all global variables and data structures
- References: Requirements 12.1, 12.2

### 15.2 Verify HTML semantic structure
- Validate HTML with W3C validator
- Verify semantic elements (header, section, etc.)
- Verify accessibility attributes
- References: Requirements 14.1, 14.3, 14.4

### 15.3 Performance testing and optimization
- Test initialization time (target: < 500ms)
- Test transaction add/delete time (target: < 100ms)
- Test chart re-render time (target: < 200ms)
- Optimize DOM operations if needed
- References: Performance Requirements

### 15.4 Cross-browser compatibility testing
- Test in Chrome, Firefox, Safari, Edge
- Verify all features working
- Test on iOS Safari 12+ and Android Chrome 60+
- References: Compatibility Requirements

### 15.5 Final visual and functionality testing
- Test light and dark modes
- Test empty state and various transaction counts
- Test responsive design at all breakpoints
- Test all hover/focus/active states
- Verify smooth animations and transitions
- References: Requirements 8.1, 8.6, 7.1

---

## Final Verification

### 16.1 Verify all tests passing
- All 15 property tests pass with 100+ iterations each
- All unit tests passing
- All integration tests passing
- All tests have proper error handling
- References: Design Document Testing Strategy

### 16.2 Final functionality checkpoint
- Form validation working correctly
- Transaction add/delete/sort working
- Balance and chart updating correctly
- Theme persistence working
- Data persistence across reload
- Monthly summary correct
- Responsive design working
- All error handling working
- Performance targets met
- Cross-browser compatibility verified
