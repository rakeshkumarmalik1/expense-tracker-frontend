// src/components/expenses/ExpenseModal.tsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, FileText, AlignLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { closeModal, selectModal } from '../../store/slices/uiSlice';
import { addExpense, updateExpense, selectFilteredExpenses } from '../../store/slices/expensesSlice';
import { CATEGORIES, CATEGORY_ICONS, Category, Expense } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../utils';

const EMPTY: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  amount: 0,
  category: 'Food & Dining',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
};

export default function ExpenseModal() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector(selectModal);
  const expenses = useAppSelector(selectFilteredExpenses);

  const editTarget = modal.type === 'edit' ? expenses.find((e) => e.id === modal.expenseId) : null;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTarget) {
      setForm({
        title: editTarget.title,
        amount: editTarget.amount,
        category: editTarget.category,
        date: editTarget.date,
        notes: editTarget.notes ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [modal.type, modal.expenseId]);

  if (modal.type !== 'add' && modal.type !== 'edit') return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.amount <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editTarget) {
      dispatch(updateExpense({ ...editTarget, ...form }));
    } else {
      dispatch(addExpense(form));
    }
    dispatch(closeModal());
  };

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const isEdit = modal.type === 'edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => dispatch(closeModal())} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text">{isEdit ? 'Edit Expense' : 'New Expense'}</h2>
            <p className="text-xs text-muted mt-0.5">
              {isEdit ? 'Update the expense details below' : 'Fill in the details to add an expense'}
            </p>
          </div>
          <button
            onClick={() => dispatch(closeModal())}
            className="p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <Field label="Title" icon={Tag} error={errors.title}>
            <input
              className={cn('form-input', errors.title && 'border-red-500')}
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>

          {/* Amount */}
          <Field label="Amount" icon={DollarSign} error={errors.amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={cn('form-input pl-7', errors.amount && 'border-red-500')}
                placeholder="0.00"
                value={form.amount || ''}
                onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </Field>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                    form.category === cat
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-border text-muted hover:border-accent/50 hover:text-text'
                  )}
                >
                  <span className="text-base leading-none">{CATEGORY_ICONS[cat]}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <Field label="Date" icon={Calendar} error={errors.date}>
            <input
              type="date"
              className={cn('form-input', errors.date && 'border-red-500')}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </Field>

          {/* Notes */}
          <Field label="Notes (optional)" icon={AlignLeft}>
            <textarea
              className="form-input resize-none"
              rows={2}
              placeholder="Add any extra notes..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={() => dispatch(closeModal())}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted hover:text-text hover:bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all shadow-md shadow-accent/25 active:scale-95"
          >
            {isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
        <Icon size={12} />
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
