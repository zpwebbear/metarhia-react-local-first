# API

This application proviedes a RESTful API for managing expenses and categories. Also it provides an endpoint for the statistics of expenses.
Statistics endpoint should return the total amount of expenses grouped by categories. Also we can filter statistics by date range. Also we can show statistics for a specific category filtered by date range.

## Endpoints

### Expenses

- `GET /expenses`: Get all expenses.
- `POST /expenses`: Create a new expense.
  The request body should contain the following fields:
  - `name`: The name of the expense.
  - `amount`: The amount of the expense.
  - `date`: The date when the expense occurred (optional, defaults to current date).
  - `categoryId`: The identifier of the category to which this expense belongs.
  - `description`: A brief description of the expense (optional, defaults to an empty string).
- `GET /expenses/:id`: Get an expense by ID.
- `PATCH /expenses/:id`: Update an expense by ID.
- `DELETE /expenses/:id`: Delete an expense by ID.

### Categories

- `GET /categories`: Get all categories.
- `POST /categories`: Create a new category.
  The request body should contain the following fields:
  - `name`: The name of the category.
- `GET /categories/:id`: Get a category by ID.
- `PATCH /categories/:id`: Update a category by ID.
- `DELETE /categories/:id`: Delete a category by ID.

### Statistics

- `GET /statistics`: Get statistics of expenses.
  The query parameters can include:
  - `from`: The start date for filtering expenses (optional).
  - `to`: The end date for filtering expenses (optional).
  - `categoryId`: The identifier of the category to filter statistics (optional).
  The response will include the total amount of expenses grouped by categories, optionally filtered by date range and category.

  ```json
  {
    "total": 1000,
    "categories": [
      {
        "categoryId": 1,
        "categoryName": "Food",
        "amount": 500
      },
      {
        "categoryId": 2,
        "categoryName": "Transport",
        "amount": 300
      }
    ]
  }
  ```
