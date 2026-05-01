// src/store/slices/expensesSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Expense, ExpenseFilters, Category } from '../../types';
import { sampleExpenses } from '../../data/sampleData';
import {
  format,
  startOfDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { RootState } from '../index';

interface ExpensesState {
  items: Expense[];
  filters: ExpenseFilters;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'expense_tracker_expenses';

function loadFromStorage(): Expense[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return sampleExpenses;
}

function saveToStorage(items: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const initialState: ExpensesState = {
  items: loadFromStorage(),
  filters: {},
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense(state, action: PayloadAction<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) {
      const now = new Date().toISOString();
      const expense: Expense = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      state.items.unshift(expense);
      saveToStorage(state.items);
    },
    updateExpense(state, action: PayloadAction<Expense>) {
      const idx = state.items.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...action.payload, updatedAt: new Date().toISOString() };
        saveToStorage(state.items);
      }
    },
    deleteExpense(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
      saveToStorage(state.items);
    },
    setFilters(state, action: PayloadAction<ExpenseFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    resetToSampleData(state) {
      state.items = sampleExpenses;
      saveToStorage(state.items);
    },
  },
});

export const {
  addExpense,
  updateExpense,
  deleteExpense,
  setFilters,
  clearFilters,
  resetToSampleData,
} = expensesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────

const selectAllExpenses = (state: RootState) => state.expenses.items;
const selectFilters = (state: RootState) => state.expenses.filters;

export const selectFilteredExpenses = createSelector(
  selectAllExpenses,
  selectFilters,
  (items, filters) => {
    return items.filter((e) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) return false;
      }
      if (filters.categories?.length && !filters.categories.includes(e.category)) return false;
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo) return false;
      if (filters.minAmount != null && e.amount < filters.minAmount) return false;
      if (filters.maxAmount != null && e.amount > filters.maxAmount) return false;
      return true;
    });
  }
);

export const selectTodayExpenses = createSelector(selectAllExpenses, (items) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return items.filter((e) => e.date === today);
});

export const selectTodayTotal = createSelector(selectTodayExpenses, (items) =>
  items.reduce((sum, e) => sum + e.amount, 0)
);

export const selectMonthExpenses = createSelector(selectAllExpenses, (items) => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return items.filter((e) => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start, end });
  });
});

export const selectMonthTotal = createSelector(selectMonthExpenses, (items) =>
  items.reduce((sum, e) => sum + e.amount, 0)
);

export const selectCategoryTotals = createSelector(selectMonthExpenses, (items) => {
  const totals: Record<string, { total: number; count: number }> = {};
  items.forEach((e) => {
    if (!totals[e.category]) totals[e.category] = { total: 0, count: 0 };
    totals[e.category].total += e.amount;
    totals[e.category].count += 1;
  });
  const grandTotal = Object.values(totals).reduce((s, v) => s + v.total, 0);
  return Object.entries(totals)
    .map(([category, { total, count }]) => ({
      category: category as Category,
      total,
      count,
      percentage: grandTotal ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
});

export const selectDailyTotals = createSelector(selectAllExpenses, (items) => {
  const totals: Record<string, { total: number; count: number }> = {};
  items.forEach((e) => {
    if (!totals[e.date]) totals[e.date] = { total: 0, count: 0 };
    totals[e.date].total += e.amount;
    totals[e.date].count += 1;
  });
  return Object.entries(totals)
    .map(([date, { total, count }]) => ({ date, total, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
});

export const selectExpensesByDay = createSelector(selectFilteredExpenses, (items) => {
  const groups: Record<string, Expense[]> = {};
  items.forEach((e) => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });
  return Object.entries(groups)
    .map(([date, expenses]) => ({
      date,
      expenses,
      total: expenses.reduce((s, e) => s + e.amount, 0),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

export default expensesSlice.reducer;
