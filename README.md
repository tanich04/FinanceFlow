# Finance Flow- Finance Dashboard UI

A clean, responsive, and interactive **Finance Dashboard** built to visualize and manage personal financial data. This project demonstrates frontend engineering skills including UI design, state management, and data visualization.

---

## Live Demo

*(Add your deployed link here)*

---

## Overview

This dashboard allows users to:

* View a summary of financial data (balance, income, expenses)
* Explore and manage transactions
* Understand spending patterns through charts
* Gain insights from financial activity
* Experience different UI behavior based on user roles (Viewer/Admin)

---

## Tech Stack

* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **UI Components:** Radix UI
* **Charts:** Recharts
* **State Management:** Zustand
* **Animations:** Framer Motion

---

## Features

### Dashboard Overview

* Summary cards:

  * Total Balance
  * Total Income
  * Total Expenses
* Time-based visualization (balance trend)
* Category-based visualization (spending breakdown)

---

### Transactions

* View all transactions with:

  * Date
  * Amount
  * Category
  * Type (Income/Expense)
* Add and edit transactions (Admin only)
* Search transactions
* Filter by category/type
* Sort by date or amount

---

### Role-Based UI (Simulated)

* **Viewer**

  * Can only view data
* **Admin**

  * Can add/edit transactions

Switch roles using a dropdown toggle.

---

### Insights

* Highest spending category
* Monthly comparison
* Key financial observations

---

### UI/UX

* Fully responsive design
* Clean and modern interface
* Smooth animations
* Handles empty states gracefully

---

## Enhancements Implemented

* Dark mode support
* Animated UI transitions
* Component-based scalable architecture
* Export to CSV/JSON

---

## State Management

Zustand is used to manage:

* Transactions data
* Filters and search
* User role
* UI state

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/tanich04/FinanceFlow

# Navigate to project
cd FinanceFlow

# Install dependencies
npm install

# Run development server
npm run dev
```

Open: `http://localhost:3000`
