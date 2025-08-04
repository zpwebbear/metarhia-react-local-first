# Entities

This app contains two entities: `Expense` and `Category`.

## Expense

An `Expense` entity represents a financial transaction. It has the following properties:

- `id`: Unique identifier for the expense.
- `name`: The name of the expense.
- `amount`: The amount of the expense. Number type.
- `date`: The date when the expense occurred (by default, it is set to the current date).
- `categoryId`: The identifier of the category to which this expense belongs.
- `description`: A brief description of the expense. By default, it is set to an empty string.
- `createdAt`: The date when the expense was created (by default, it is set to the current date).
- `updatedAt`: The date when the expense was last updated (by default, it is set to the current date).

## Category

A `Category` entity represents a classification for expenses. It has the following properties:

- `id`: Unique identifier for the category.
- `name`: The name of the category.
- `createdAt`: The date when the category was created (by default, it is set to the current date).
- `updatedAt`: The date when the category was last updated (by default, it is set to the current date).
