// src/components/layout/Header.tsx
import React from 'react';
import { Menu, Sun, Moon, Plus, Download, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleSidebar, toggleTheme, selectTheme, openModal, selectActiveView } from '../../store/slices/uiSlice';
import { selectFilteredExpenses } from '../../store/slices/expensesSlice';
import { exportToCSV, getGreeting } from '../../utils';
import { format } from 'date-fns';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Expenses',
  analytics: 'Analytics',
  budgets: 'Budgets',
  settings: 'Settings',
};

export default function Header() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const activeView = useAppSelector(selectActiveView);
  const expenses = useAppSelector(selectFilteredExpenses);

  const handleExport = () => {
    exportToCSV(
      expenses.map((e) => ({
        Title: e.title,
        Amount: e.amount,
        Category: e.category,
        Date: e.date,
        Notes: e.notes || '',
      })),
      `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 h-16 bg-header border-b border-border backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-bold text-base text-text leading-tight">{VIEW_TITLES[activeView]}</h1>
          <p className="text-xs text-muted hidden sm:block">
            {getGreeting()}, Alex 👋 — {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-header" />
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-hover text-muted hover:text-text transition-colors border border-border"
        >
          <Download size={15} />
          <span>Export</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Add expense */}
        <button
          onClick={() => dispatch(openModal({ type: 'add' }))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all shadow-md shadow-accent/25 active:scale-95"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>
    </header>
  );
}
