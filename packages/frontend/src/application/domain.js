import { Application, generateId } from './pwa.js';

class Logger {
  #output;

  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${lines.join(' ')}\n`;
    this.#output.textContent += logEntry;
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  clear() {
    this.#output.textContent = '';
  }

  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

class ExpenseTrackerApplication extends Application {
  constructor(config = {}) {
    super(config);
    this.syncTimeout = null;
    this.config = config;
    this.stateVersion = 0;
    this.#init();
  }

  #init() {
    this.state.set('expense', new Map());
    this.state.set('category', new Map());
  }

  async createExpense(createExpenseDto) {
    const delta = this.addExpense(createExpenseDto);
    this.post({ type: 'delta', data: [delta] });
    if (this.connected) {
      this.logger.log('Sent expense:', delta);
    } else {
      this.logger.log('Expense queued (offline):', delta);
    }
    return delta.record;
  }

  async editExpense(id, dto) {
    const delta = this.updateExpense(id, dto);
    this.post({ type: 'delta', data: [delta] });
    if (this.connected) {
      this.logger.log('Sent expense update:', delta);
    } else {
      this.logger.log('Expense update queued (offline):', delta);
    }
    return delta.record;
  }

  async editCategory(id, dto) {
    const delta = this.updateCategory(id, dto);
    this.post({ type: 'delta', data: [delta] });
    if (this.connected) {
      this.logger.log('Sent category update:', delta);
    } else {
      this.logger.log('Category update queued (offline):', delta);
    }
    return delta.record;
  }

  async createCategory(createCategoryDto) {
    const delta = this.addCategory(createCategoryDto);
    this.post({ type: 'delta', data: [delta] });
    if (this.connected) {
      this.logger.log('Sent category:', delta);
    } else {
      this.logger.log('Category queued (offline):', delta);
    }

    return delta.record;
  }

  get expenses() {
    return Array.from(this.state.get('expense').values()).map(expense => {
      const category = this.categoriesState.get(expense.categoryId);
      return { ...expense, category };
    });
  }

  get currentMonthExpenses(){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0);
    return this.filterExpenses({ from, to });
  }

  filterExpenses({categoryId = null, from = null, to = null}){
    return this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (categoryId && expense.categoryId !== categoryId) {
        return false;
      }
      if (from) {
        const fromDate = new Date(from);
        if (expenseDate < fromDate) {
          return false;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (expenseDate > toDate) {
          return false;
        }
      }
      return true;
    });
  }

  filterCategories({ from = null, to = null }) {
    return this.categories.filter(category => {
      const categoryDate = new Date(category.date);
      if (from) {
        const fromDate = new Date(from);
        if (categoryDate < fromDate) {
          return false;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (categoryDate > toDate) {
          return false;
        }
      }
      return true;
    });
  }

  getStatistics({categoryId = null, from = null, to = null} = {categoryId: null, from: null, to: null}) {
    const filters = { categoryId, from, to };
    const filteredExpenses = this.filterExpenses(filters);
    
    // Calculate total amount
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group by categories
    const categoriesMap = new Map();
    
    filteredExpenses.forEach(expense => {
      const { categoryId, amount } = expense;
      const category = this.categoriesState.get(categoryId);
      
      if (!category) return;
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          categoryId,
          categoryName: category.name,
          amount: 0
        });
      }
      
      categoriesMap.get(categoryId).amount += amount;
    });
    
    return {
      total,
      categories: Array.from(categoriesMap.values())
    };
  }

  get categories() {
    return Array.from(this.state.get('category').values());
  }

  get expensesState() {
    return this.state.get('expense');
  }

  get categoriesState() {
    return this.state.get('category');
  }

  get currentMonthSummary() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0);
    let total = 0;
    for (const expense of this.expenses) {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= fromDate && expenseDate <= toDate) {
        total += expense.amount;
      }
    }

    return total;
  }

  updateCache() {
    this.logger.log('Requesting cache update...');
    this.post({ type: 'updateCache' });
  }

  clearDatabase() {
    this.logger.log('Requesting database clear...');
    this.post({ type: 'clearDatabase' });
  }

  addExpense(createExpenseDto) {
    const id = generateId();
    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();
    const expense = { id, created_at, updated_at, ...createExpenseDto };
    this.set('expense', id, expense);
    return { strategy: 'lww', entity: 'expense', record: expense };
  }

  addCategory(createCategoryDto) {
    const id = generateId();
    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();
    const category = { id, created_at, updated_at, ...createCategoryDto };
    this.set('category', id, category);
    return { strategy: 'lww', entity: 'category', record: category };
  }

  updateExpense(id, dto) {
    const expense = this.get('expense', id);
    if (!expense) throw new Error('Expense not found');

    const updatedExpense = { ...expense, ...dto, updated_at: new Date().toISOString() };
    this.set('expense', id, updatedExpense);
    return { strategy: 'lww', entity: 'expense', record: updatedExpense };
  }

  updateCategory(id, dto) {
    const category = this.get('category', id);
    if (!category) throw new Error('Category not found');

    const updatedCategory = { ...category, ...dto, updated_at: new Date().toISOString() };
    this.set('category', id, updatedCategory);
    return { strategy: 'lww', entity: 'category', record: updatedCategory };
  }

  set(entity, key, value) {
    this.state.get(entity).set(key, value);
    this.emit('stateSet');
  }

  get(entity, key) {
    return this.state.get(entity).get(key);
  }

  clear() {
    this.state.clear();
    this.#init();
    this.emit('stateCleared');
  }

  setState(state) {
    this.state = state;
    this.emit('stateSet');
  }
}

const logger = console;
const app = new ExpenseTrackerApplication({ logger, syncTimeout: 2000 });

app.on('message', (data) => {
  app.logger.log('Message:', data.content);
});

app.on('status', (data) => {
  if (data.connected) {
    app.logger.log('Websocket connected');
  } else {
    app.logger.log('Websocket disconnected');
  }
});

app.on('state', (state) => {
  app.clear();
  app.setState(state);
  app.logger.log('State updated from worker');
});

app.on('cacheUpdated', () => {
  app.logger.log('Cache updated successfully');
});

app.on('cacheUpdateFailed', (data) => {
  app.logger.log('Cache update failed:', data.error);
});

app.on('databaseCleared', () => {
  app.clear();
  app.logger.log('Database cleared successfully');
});

app.on('delta', (data) => {
  for (const delta of data) {
    const { strategy, entity, record } = delta;
    if (entity === 'expense' && strategy === 'lww') {
      app.set(entity, record.id, record);
      app.logger.log('Expense updated from CRDT:', record.id);
    } else if (entity === 'category' && strategy === 'lww') {
      app.set(entity, record.id, record);
      app.logger.log('Category updated from CRDT:', record.id);
    }
  }
  app.emit('deltaSet');
});

export { ExpenseTrackerApplication, app };