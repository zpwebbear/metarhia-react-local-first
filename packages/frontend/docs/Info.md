# Information

This application is a frontend part of the Expense Tracker project. It is built using React and provides a user interface for managing expenses and categories. It's a mobile first application, designed to work seamlessly on mobile devices. 

## Pages

**Home Page**: The main page of the application with a summary of expenses for the current month on the top and a list of last expenses below. It also contains a button to add a new expense.
**Expenses Page**: A page that displays all expenses. Initially it sorts expenses by date in descending order. It also contains a button to add a new expense. User can filter expenses by date range and category. User can manage expenses by editing or deleting them.
**Statistics Page**: A page that displays statistics of expenses. It shows the total amount of expenses grouped by categories. User can filter statistics by date range and category.
**Categories Page**: A page that displays all categories. It allows users to manage categories by adding, editing, or deleting them. If category is deleted, all expenses in this category will be moved to the "Others" category.

## Components (Widgets)

- **Expense List**: A component that displays a list of expenses. It allows users to filter expenses by date range and category.
- **Expense Form**: A component that provides a form for adding and editing expenses. It includes fields for the expense name, amount, date, category, and description. Category selection is done via tags input, allowing users to select existing categories or create new ones.
- **Statistics List**: A component that displays list of expenses initially grouped by category. It allows users to filter statistics by date range and category.
- **Category List**: A component that displays a list of categories. It allows users to add, edit, and delete categories. If a category is deleted, all expenses in this category will be moved to the "Others" category.
- **Category Form**: A component that provides a form for adding and editing categories. It includes a field for the category name.