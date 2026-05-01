// src/App.tsx
import React, { useEffect } from 'react';
import { useAppSelector } from './hooks/redux';
import { selectTheme, selectActiveView, selectSidebarOpen } from './store/slices/uiSlice';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ExpensesList from './components/expenses/ExpensesList';
import Analytics from './components/dashboard/Analytics';
import Budgets from './components/dashboard/Budgets';
import Settings from './components/dashboard/Settings';
import ExpenseModal from './components/expenses/ExpenseModal';
import DeleteModal from './components/expenses/DeleteModal';
import { cn } from './utils';

export default function App() {
  const theme = useAppSelector(selectTheme);
  const activeView = useAppSelector(selectActiveView);
  const sidebarOpen = useAppSelector(selectSidebarOpen);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const views: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    expenses: <ExpensesList />,
    analytics: <Analytics />,
    budgets: <Budgets />,
    settings: <Settings />,
  };

  return (
    <div className={cn('min-h-screen bg-background text-text font-sans', theme)}>
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen flex flex-col',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {views[activeView]}
          </div>
        </main>
      </div>
      <ExpenseModal />
      <DeleteModal />
    </div>
  );
}
