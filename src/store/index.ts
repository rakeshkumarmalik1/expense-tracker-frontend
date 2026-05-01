// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './slices/expensesSlice';
import uiReducer from './slices/uiSlice';
import budgetsReducer from './slices/budgetsSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    ui: uiReducer,
    budgets: budgetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
