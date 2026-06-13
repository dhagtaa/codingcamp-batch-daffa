# Requirements Document: Expense & Budget Visualizer

## Introduction

Expense & Budget Visualizer adalah aplikasi web mobile-friendly untuk mencatat dan memvisualisasikan pengeluaran harian. Aplikasi ini memungkinkan pengguna untuk membuat catatan pengeluaran dengan kategori tertentu, melihat total pengeluaran, dan menganalisis distribusi pengeluaran melalui pie chart interaktif. Data disimpan secara lokal menggunakan Local Storage API untuk akses offline dan persistensi data.

## Glossary

- **Application**: Expense & Budget Visualizer web application
- **Transaction**: Catatan pengeluaran yang berisi item name, amount, dan category
- **Local Storage**: Browser API untuk menyimpan data persistently di client-side
- **Chart**: Visualisasi pie chart menggunakan Chart.js untuk menampilkan distribusi pengeluaran per kategori
- **Balance**: Total akumulasi semua pengeluaran yang tercatat
- **Category**: Klasifikasi pengeluaran (Food, Transport, Fun)
- **Form Validation**: Proses verifikasi bahwa semua field input sesuai dengan kriteria yang ditentukan
- **Transaction List**: Daftar tampilan semua transaksi yang telah dicatat dengan fitur delete
- **Responsive Design**: Desain yang menyesuaikan dengan berbagai ukuran layar perangkat
- **Persistent Data**: Data yang tetap tersimpan meskipun browser ditutup atau halaman di-refresh

## Requirements

### Requirement 1: Input Form untuk Pencatatan Pengeluaran

**User Story:** Sebagai pengguna, saya ingin memasukkan detail pengeluaran (nama item, jumlah, kategori) melalui form, sehingga saya dapat mencatat pengeluaran harian dengan mudah.

#### Acceptance Criteria

1. THE Application SHALL display an input form with three fields: Item Name, Amount, and Category dropdown
2. THE Category dropdown SHALL provide exactly three options: Food, Transport, and Fun
3. WHEN a user clicks the submit button without filling any field, THE Application SHALL display validation error messages for empty fields
4. WHEN a user enters a negative or non-numeric value in the Amount field, THE Application SHALL display an error message "Amount must be a positive number"
5. WHEN a user enters zero in the Amount field, THE Application SHALL display an error message "Amount must be greater than zero"
6. WHEN all fields are valid and the user clicks the submit button, THE Application SHALL add the transaction to Local Storage and clear all form fields
7. WHEN a transaction is successfully added, THE Application SHALL display a success notification or visual confirmation
8. THE Application SHALL prevent form submission when any validation error exists

---

### Requirement 2: Penyimpanan Data ke Local Storage

**User Story:** Sebagai pengguna, saya ingin data pengeluaran saya disimpan secara permanen, sehingga saya dapat mengakses riwayat pengeluaran bahkan setelah menutup browser.

#### Acceptance Criteria

1. WHEN a valid transaction is submitted, THE Application SHALL save the transaction data to Local Storage using a transactions array
2. WHEN the Application loads, THE Application SHALL retrieve all saved transactions from Local Storage and restore them to memory
3. WHEN Local Storage is empty, THE Application SHALL initialize with an empty transactions array
4. WHEN a user deletes a transaction, THE Application SHALL immediately update Local Storage to reflect the deletion
5. THE Application SHALL store each transaction with the following properties: id (unique identifier), itemName, amount (in numeric format), category, and timestamp
6. WHEN a user performs a hard refresh (Ctrl+F5), THE Application SHALL maintain all previously saved transactions

---

### Requirement 3: Transaction List Display

**User Story:** Sebagai pengguna, saya ingin melihat daftar semua pengeluaran yang telah dicatat, sehingga saya dapat melacak riwayat pengeluaran saya dengan jelas.

#### Acceptance Criteria

1. THE Application SHALL display all transactions in a scrollable list format below the input form
2. EACH transaction item SHALL display: item name, amount (formatted as currency), category, and a delete button
3. WHEN transactions exceed the visible area, THE Application SHALL enable vertical scrolling for the transaction list
4. WHEN no transactions exist, THE Application SHALL display a placeholder message "No transactions yet"
5. WHEN a new transaction is added, THE Application SHALL immediately append it to the top of the transaction list
6. EACH transaction item SHALL be presented in a card layout with rounded corners and visual distinction from other cards
7. WHEN a user hovers over a transaction card, THE Application SHALL provide visual feedback (e.g., highlight or shadow change)

---

### Requirement 4: Delete Transaction Functionality

**User Story:** Sebagai pengguna, saya ingin dapat menghapus transaksi yang salah atau tidak diperlukan, sehingga data pengeluaran saya selalu akurat.

#### Acceptance Criteria

1. EACH transaction card SHALL have a clearly visible delete button
2. WHEN a user clicks the delete button, THE Application SHALL remove the transaction from Local Storage
3. WHEN a transaction is deleted, THE Application SHALL immediately remove it from the transaction list display
4. WHEN a transaction is deleted, THE Application SHALL automatically update the Total Balance and re-render the Chart
5. WHEN a user deletes a transaction, THE Application SHALL provide visual confirmation (e.g., animation or toast notification)
6. IF a user wants to restore a deleted transaction, THE Application MAY display an undo option for 5 seconds after deletion (optional enhancement)

---

### Requirement 5: Total Balance Display dan Update

**User Story:** Sebagai pengguna, saya ingin melihat total pengeluaran secara real-time, sehingga saya tahu berapa banyak uang yang telah saya keluarkan.

#### Acceptance Criteria

1. THE Application SHALL display the total balance in a prominent location at the top of the page
2. THE Balance display SHALL show the sum of all amounts from all transactions
3. WHEN a transaction is added, THE Application SHALL update and re-render the balance immediately
4. WHEN a transaction is deleted, THE Application SHALL update and re-render the balance immediately
5. THE Balance SHALL be formatted as currency with appropriate decimal places (e.g., Rp 150.000,00)
6. WHEN no transactions exist, THE Balance display SHALL show zero or "Rp 0,00"
7. THE Balance display SHALL have clear typography and sufficient contrast for readability on all devices

---

### Requirement 6: Pie Chart Visualization untuk Distribusi Pengeluaran

**User Story:** Sebagai pengguna, saya ingin melihat pie chart yang menampilkan distribusi pengeluaran per kategori, sehingga saya dapat menganalisis pola pengeluaran saya dengan visual yang mudah dipahami.

#### Acceptance Criteria

1. THE Application SHALL render a pie chart using Chart.js library
2. THE Chart SHALL display three segments representing the three categories: Food, Transport, and Fun
3. THE Chart SHALL display the amount and percentage for each category in the legend or tooltip
4. WHEN a transaction is added, THE Application SHALL update the Chart to reflect the new distribution
5. WHEN a transaction is deleted, THE Application SHALL update the Chart to reflect the new distribution
6. IF all transactions in a category are deleted, THE Chart SHALL display that category with zero value
7. WHEN a user hovers over a pie segment, THE Chart SHALL display detailed information (category name, amount, percentage)
8. THE Chart container SHALL be responsive and maintain proper aspect ratio on all screen sizes

---

### Requirement 7: Responsive Design dan Mobile-Friendly Interface

**User Story:** Sebagai pengguna mobile, saya ingin aplikasi dapat digunakan dengan nyaman di berbagai ukuran layar, sehingga saya dapat mencatat pengeluaran dari perangkat apapun.

#### Acceptance Criteria

1. THE Application layout SHALL adapt properly to screen sizes ranging from 320px (mobile) to 1920px (desktop) width
2. WHILE the application is displayed on mobile devices (width < 768px), THE layout SHALL stack vertically with single-column design
3. WHILE the application is displayed on tablet devices (768px ≤ width ≤ 1024px), THE layout SHALL present balanced multi-column arrangement
4. WHILE the application is displayed on desktop devices (width > 1024px), THE layout SHALL utilize full width with optimized spacing
5. ALL form fields and buttons SHALL be large enough for touch interaction on mobile (minimum 44px height)
6. THE Transaction list SHALL be scrollable without affecting the visibility of the input form on mobile devices
7. THE Chart SHALL scale appropriately and remain readable on all device sizes
8. ALL text SHALL be readable without zooming on mobile devices without horizontal scrolling for the main content

---

### Requirement 8: Modern dan Minimalis Design

**User Story:** Sebagai pengguna, saya ingin menggunakan aplikasi dengan interface yang modern, bersih, dan menyenangkan, sehingga pengalaman pengguna saya optimal.

#### Acceptance Criteria

1. THE Application color scheme SHALL use a modern palette with clear contrast between background, primary, and accent colors
2. ALL form inputs and buttons SHALL have rounded corners with 4-8px border radius
3. EACH card element (transaction cards, main containers) SHALL have 8-16px rounded corners and subtle shadow effect
4. THE typography SHALL follow a clear hierarchy with appropriate font sizes for headings, labels, and body text
5. THE spacing and padding between elements SHALL be consistent using a logical spacing scale (e.g., 8px, 16px, 24px, 32px)
6. ALL interactive elements (buttons, inputs, cards) SHALL have clear visual feedback for hover, focus, and active states
7. THE Application layout SHALL not display any unnecessary elements, icons, or decorations that reduce clarity

---

### Requirement 9: Dark Mode dan Light Mode Toggle (Optional)

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara dark mode dan light mode, sehingga saya dapat menggunakan aplikasi sesuai preferensi dan kondisi pencahayaan.

#### Acceptance Criteria

1. WHERE dark mode is available, THE Application SHALL provide a toggle button to switch between dark and light themes
2. WHEN a user toggles the theme, THE Application SHALL immediately apply the new theme to all elements
3. WHEN a user selects a theme preference, THE Application SHALL save the preference to Local Storage
4. WHEN the Application loads, THE Application SHALL apply the previously saved theme preference, or system default if none is saved
5. WHILE in dark mode, THE Application color palette SHALL use dark backgrounds with light text for comfortable viewing in low-light conditions
6. WHILE in light mode, THE Application color palette SHALL use light backgrounds with dark text for clear visibility in bright conditions
7. ALL content SHALL maintain sufficient contrast and readability in both dark and light modes

---

### Requirement 10: Sort Transaction Functionality (Optional)

**User Story:** Sebagai pengguna, saya ingin dapat mengurutkan transaksi berdasarkan berbagai kriteria, sehingga saya dapat menemukan dan menganalisis pengeluaran dengan lebih mudah.

#### Acceptance Criteria

1. WHERE sort functionality is available, THE Application SHALL provide a sort options selector with at least three criteria: Amount (Highest to Lowest), Amount (Lowest to Highest), and Category
2. WHEN a user selects a sort criteria, THE Application SHALL re-arrange the transaction list according to the selected criteria
3. WHEN a transaction is added, THE Application SHALL maintain the currently selected sort order
4. WHEN sorting by amount, THE Application SHALL order transactions numerically in descending or ascending order
5. WHEN sorting by category, THE Application SHALL group transactions by category (Food, Transport, Fun) in alphabetical order
6. WHEN a user selects "Default" sort option, THE Application SHALL display transactions in the order they were added (most recent first)

---

### Requirement 11: Monthly Summary Display (Optional)

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan pengeluaran bulan ini, sehingga saya dapat memantau budget bulanan saya.

#### Acceptance Criteria

1. WHERE monthly summary is available, THE Application SHALL display a section showing the current month and year
2. THE Monthly Summary SHALL show total spending for the current month
3. THE Monthly Summary SHALL show the number of transactions recorded in the current month
4. WHEN transactions from previous months exist, THE Application SHALL exclude them from the monthly summary calculation
5. WHEN a transaction is added in the current month, THE Application SHALL update the monthly summary immediately
6. WHEN a transaction is deleted, THE Application SHALL update the monthly summary immediately
7. THE Monthly Summary display SHALL be visually distinct from other sections and easy to scan

---

### Requirement 12: Core Functionality - Transaction Management Functions

**User Story:** Sebagai developer, saya ingin memiliki fungsi-fungsi inti yang terstruktur dengan baik, sehingga kode dapat di-maintain dan di-extend dengan mudah.

#### Acceptance Criteria

1. THE Application SHALL implement an addTransaction() function that validates input, creates a transaction object, and saves to Local Storage
2. THE Application SHALL implement a deleteTransaction(id) function that removes a transaction by ID and updates all related displays
3. THE Application SHALL implement an updateBalance() function that recalculates total from all transactions and updates the display
4. THE Application SHALL implement an updateChart() function that re-renders the pie chart with current transaction data
5. THE Application SHALL implement a saveData() function that persists the current transactions array to Local Storage
6. THE Application SHALL implement a loadData() function that retrieves transactions from Local Storage during application initialization
7. THE Application SHALL implement a renderTransactions() function that generates and displays all transaction items in the transaction list
8. WHEN any function is called, THE Application SHALL handle errors gracefully and log them to console without crashing

---

### Requirement 13: Data Structure dan Array Management

**User Story:** Sebagai pengguna, saya ingin aplikasi mengelola data transaksi dengan struktur yang konsisten dan efisien, sehingga operasi penambahan, penghapusan, dan pencarian berjalan dengan baik.

#### Acceptance Criteria

1. THE Application SHALL maintain a transactions array in memory containing all transaction objects
2. EACH transaction object in the array SHALL have the following properties: id (unique string or number), itemName (string), amount (number), category (string), timestamp (date/time)
3. WHEN a new transaction is created, THE Application SHALL generate a unique ID for that transaction
4. WHEN the application initializes, THE Application SHALL load the transactions array from Local Storage or create an empty array
5. THE transactions array SHALL be the single source of truth for all transaction data in the application
6. WHEN iterating through transactions for display or calculation, THE Application SHALL use array methods (map, filter, reduce) appropriately

---

### Requirement 14: DOM Manipulation dan Event Handling

**User Story:** Sebagai pengguna, saya ingin interaksi dengan aplikasi berjalan dengan mulus dan responsif, sehingga pengalaman pengguna terasa natural dan cepat.

#### Acceptance Criteria

1. THE Application SHALL use addEventListener() to attach event listeners to form submit button, delete buttons, and sort selector
2. WHEN a user interacts with the application, THE Application SHALL update the DOM to reflect changes without requiring a page refresh
3. WHEN updating the transaction list display, THE Application SHALL clear existing elements and re-render only when necessary
4. THE Application SHALL use efficient DOM querying methods (getElementById, querySelector) to target specific elements
5. WHEN a user performs an action, THE Application response time SHALL be less than 100ms for visual feedback
6. THE Application SHALL prevent default browser behavior for form submission and implement custom form handling
7. WHEN updating multiple sections (balance, list, chart), THE Application SHALL batch updates to minimize reflows and repaints

---

## Fitur Pilihan yang Dipilih

Berdasarkan kebutuhan pengguna, tiga fitur optional berikut dipilih untuk implementasi:

1. **Dark/Light Mode Toggle** - Meningkatkan user experience dengan opsi tema sesuai preferensi
2. **Sort Transaction** - Memudahkan pengguna dalam menganalisis pengeluaran
3. **Monthly Summary** - Membantu pengguna memantau budget bulanan secara efektif

---

## Technical Stack

- **HTML**: Struktur dan semantic markup
- **CSS**: Styling, responsive design, dan themes (dark/light mode)
- **JavaScript (Vanilla)**: Logic, DOM manipulation, dan event handling tanpa framework
- **Local Storage API**: Penyimpanan data persistently
- **Chart.js**: Library untuk visualisasi pie chart
- **Target Browser**: Modern browsers dengan ES6+ support

---

## Non-Functional Requirements

### Performance
- Application initialization time: < 500ms
- Transaction addition/deletion: < 100ms
- Chart re-render: < 200ms

### Compatibility
- Chrome, Firefox, Safari, Edge (latest versions)
- iOS Safari 12+
- Android Chrome 60+

### Browser Storage
- Minimum Local Storage allocation: 5MB (adequate untuk ribuan transaksi)

