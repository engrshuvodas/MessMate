# Mess Expense Tracker - User Manual

Welcome to **Mess Expense Tracker**, a simple and powerful tool for bachelors sharing a mess to track their monthly grocery (bajar) expenses and divide costs fairly.

## 🚀 Getting Started

To run the application locally:

1.  Navigate to the project directory: `cd MessMate`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`
4.  Open your browser at: `http://localhost:5173`

## 🛠 Features

### 1. Dashboard (Home)
- **Summary Cards**: Instantly see the total mess expenses for the selected period and the share per person.
- **Expense Table**: A detailed list of all shopping records including date, items bought, total cost, and who added the record.
- **Date Filtering**: Use the date range picker to filter records by month or specific dates.
- **Search**: Quickly find specific items or records by typing in the search bar.
- **Excel Export**: Download the current filtered view as a professionally formatted Excel file (`.xlsx`) including total and per-person summaries at the bottom.

### 2. Add Expense
- Use the **Add Expense** page to record new shopping trips.
- Enter the date, a detailed description (e.g., "Rice, Chicken, Oil"), and the total cost.
- **Added By**: You can select one or multiple members who contributed or were present during the shopping.
- Validation ensures that you don't miss any required fields or enter invalid amounts.

### 3. Manage Members
- Keep track of everyone living in the mess.
- **Add New Member**: Click the button to add a new person.
- **Edit/Delete**: Update member names or remove them if they leave.
- **Dynamic Calculation**: Adding or removing members automatically updates the "Per Person Share" calculation on the dashboard.

## 💻 Tech Stack
- **Frontend**: React.js
- **UI Library**: Ant Design (Antd)
- **Icons**: Ant Design Icons
- **Date Handling**: Day.js
- **Exporting**: SheetJS (XLSX)
- **State Management**: React Context API

## 📝 Important Notes
- This is a frontend-only implementation. Data is stored in memory and will reset when the page is refreshed.
- In a real-world scenario, the `axios` placeholders in `AppContext.jsx` would be replaced with actual API endpoints.
- The app uses **Ant Design** components for a responsive and premium feel.

---
Created by **Antigravity** for **MessMate**.
