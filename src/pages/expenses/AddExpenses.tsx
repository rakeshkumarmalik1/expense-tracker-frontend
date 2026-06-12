// src/pages/AddExpensePage.tsx
// Self-contained split-layout page: left = onboarding content, right = expense form.
// No modal, no separate file — everything lives here.

import React, { useState } from 'react';
import {
  Wallet,
  BarChart3,
  Bell,
  Users,
  DollarSign,
  Hash,
  Calendar,
  Tag,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Lock,
  FileText,
  Zap,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Expense, ExpenseTypes } from '@/types/expense.type';
import { format } from 'date-fns';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addExpense } from '@/store/slices/expenseSlice/expenses.slice';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_TYPES: ExpenseTypes[] = [
  'FOOD', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
  'HEALTHCARE', 'UTILITIES', 'HOUSING', 'TRAVEL', 'EDUCATION', 'OTHER',
];

const TYPE_META: Record<ExpenseTypes, { icon: string; label: string }> = {
  FOOD:           { icon: '🍽️', label: 'Food' },
  TRANSPORTATION: { icon: '🚗', label: 'Transport' },
  SHOPPING:       { icon: '🛍️', label: 'Shopping' },
  ENTERTAINMENT:  { icon: '🎬', label: 'Fun' },
  HEALTHCARE:     { icon: '🏥', label: 'Health' },
  UTILITIES:      { icon: '💡', label: 'Utilities' },
  HOUSING:        { icon: '🏠', label: 'Housing' },
  TRAVEL:         { icon: '✈️', label: 'Travel' },
  EDUCATION:      { icon: '📚', label: 'Education' },
  OTHER:          { icon: '📦', label: 'Other' },
};

// ─── Left panel data ──────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Wallet,   color: 'text-violet-400', bg: 'bg-violet-400/10', title: 'Log any expense',   desc: 'By category, quantity, and date — in under 10 seconds.' },
  { icon: BarChart3, color: 'text-cyan-400',  bg: 'bg-cyan-400/10',   title: 'See where it goes', desc: 'Visual monthly breakdowns so nothing stays hidden.' },
  { icon: Bell,     color: 'text-amber-400',  bg: 'bg-amber-400/10',  title: 'Stay on budget',    desc: 'Set limits per category and get warned before you exceed.' },
  { icon: Users,    color: 'text-emerald-400',bg: 'bg-emerald-400/10',title: 'Group spending',    desc: 'Assign expenses to a group ID for shared households or trips.' },
];

const HOW_IT_WORKS = [
  { n: 1, title: 'Fill the form',      desc: 'Name, amount, category, quantity, and date. That\'s it.' },
  { n: 2, title: 'Pick a category',    desc: 'Choose from 10 types to keep your data clean and filterable.' },
  { n: 3, title: 'Track over time',    desc: 'Your dashboard updates the moment you submit.' },
  { n: 4, title: 'Export or share',    desc: 'Attach a group ID to split costs across people.' },
];

const TERMS = [
  { icon: Lock,        title: 'Your data stays yours',   body: 'We never sell or share your records. Everything is encrypted at rest and in transit. Delete your account anytime from Settings.' },
  { icon: FileText,    title: 'What we store',           body: 'Expense names, amounts, categories, dates, and optional group IDs. We also store your email and a hashed password — no card details ever.' },
  { icon: Zap,         title: 'Acceptable use',          body: 'Personal and team budgeting only. Automated scraping or fake-data injection is prohibited and may result in suspension.' },
  { icon: ShieldCheck, title: 'Changes to these terms',  body: 'Material changes will be notified by email at least 14 days before they take effect.' },
];

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  name:     string;
  amount:   number | '';
  type:     ExpenseTypes;
  quantity: string;
  bought_at: string;
  groupId:  string;
};

const EMPTY: FormState = {
  name:      '',
  amount:    '',
  type:      'FOOD',
  quantity:  '1',
  bought_at: format(new Date(), 'yyyy-MM-dd'),
  groupId:   '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Icon size={11} />
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel() {
  const [openTerm, setOpenTerm] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-8 py-2 pr-2">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Expense Tracker</p>
          <p className="text-sm font-bold text-white leading-tight">Know where your money goes</p>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white leading-snug">
          Log expenses.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            Understand spending.
          </span>
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          One form, ten categories, instant dashboard updates. Built for people who want clarity over complexity.
        </p>
      </div>

      {/* Feature list */}
      <div className="grid grid-cols-2 gap-2.5">
        {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center', bg)}>
              <Icon size={14} className={color} />
            </div>
            <p className="text-[11px] font-bold text-white leading-snug">{title}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">How it works</p>
        <div className="flex flex-col gap-2 relative">
          {/* Rail */}
          <div className="absolute left-[13px] top-7 bottom-7 w-px bg-gradient-to-b from-violet-500/40 to-transparent" />
          {HOW_IT_WORKS.map(({ n, title, desc }) => (
            <div key={n} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white z-10 shadow-md shadow-violet-500/20">
                {n}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[11px] font-bold text-slate-200">{title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms accordion */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">Terms & conditions</p>
        <div className="flex flex-col gap-1.5">
          {TERMS.map(({ icon: Icon, title, body }, i) => {
            const open = openTerm === i;
            return (
              <div
                key={title}
                className={cn(
                  'rounded-xl border overflow-hidden transition-all',
                  open ? 'border-violet-500/30 bg-violet-500/[0.07]' : 'border-white/[0.06] bg-white/[0.03]'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenTerm(open ? null : i)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left"
                >
                  <Icon size={12} className={open ? 'text-violet-400' : 'text-slate-500'} />
                  <span className="flex-1 text-[11px] font-semibold text-slate-300">{title}</span>
                  <ChevronRight
                    size={12}
                    className={cn('text-slate-600 transition-transform', open && 'rotate-90')}
                  />
                </button>
                {open && (
                  <p className="px-3 pb-3 pl-8 text-[10px] text-slate-500 leading-relaxed">{body}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: '10s', l: 'to log' },
          { v: '10',  l: 'categories' },
          { v: '100%', l: 'your data' },
        ].map(({ v, l }) => (
          <div key={l} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.05]">
            <span className="text-base font-black text-white">{v}</span>
            <span className="text-[9px] text-slate-500 text-center">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Right panel — the actual form ───────────────────────────────────────────

function ExpenseForm() {
  const dispatch = useAppDispatch();
  const loading   = useAppSelector((s: any) => s.expenses.loading);
  const storeError = useAppSelector((s: any) => s.expenses.error);
  const navigate  = useNavigate();

  const [form, setForm]     = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                                                    e.name     = 'Name is required';
    if (form.amount === '' || Number(form.amount) <= 0)                       e.amount   = 'Must be > 0';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) e.quantity = 'Must be > 0';
    if (!form.bought_at)                                                       e.bought_at = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: Partial<Expense> = {
      name:      form.name.trim(),
      amount:    Number(form.amount),
      type:      form.type,
      quantity:  form.quantity,
      bought_at: form.bought_at,
      ...(form.groupId ? { groupId: form.groupId } : {}),
    };
    try {
      await dispatch(addExpense(payload)).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/expenses'), 1200);
    } catch {
      // storeError already populated
    }
  };

  // ── Success state ──
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 h-full py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 size={40} className="text-white" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Logged</p>
          <p className="text-xl font-extrabold text-white">Expense added</p>
          <p className="text-sm text-slate-400">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Form header */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-1">New entry</p>
        <h2 className="text-xl font-extrabold text-white">Add an expense</h2>
        <p className="text-xs text-slate-500 mt-0.5">Every field except Group ID is required.</p>
      </div>

      {/* API error */}
      {storeError && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
          <span>⚠</span>
          <span>{storeError}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 flex-1">
        {/* Name */}
        <Field label="Expense name" icon={Tag} error={errors.name}>
          <input
            className={cn(
              'w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors',
              errors.name ? 'border-red-500/50' : 'border-white/[0.08]'
            )}
            placeholder="e.g. Grocery run"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            disabled={loading}
          />
        </Field>

        {/* Amount + Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" icon={DollarSign} error={errors.amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={cn(
                  'w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/[0.05] border text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors',
                  errors.amount ? 'border-red-500/50' : 'border-white/[0.08]'
                )}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                disabled={loading}
              />
            </div>
          </Field>

          <Field label="Quantity" icon={Hash} error={errors.quantity}>
            <input
              type="number"
              min="1"
              step="1"
              className={cn(
                'w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors',
                errors.quantity ? 'border-red-500/50' : 'border-white/[0.08]'
              )}
              placeholder="1"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
          <div className="grid grid-cols-2 gap-1.5">
            {EXPENSE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                disabled={loading}
                onClick={() => set('type', t)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50',
                  form.type === t
                    ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
                    : 'border-white/[0.07] text-slate-500 hover:border-white/20 hover:text-slate-300 bg-white/[0.03]'
                )}
              >
                <span className="text-sm leading-none">{TYPE_META[t].icon}</span>
                <span className="truncate">{TYPE_META[t].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <Field label="Date purchased" icon={Calendar} error={errors.bought_at}>
          <input
            type="date"
            className={cn(
              'w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border text-sm text-white outline-none focus:border-violet-500/60 transition-colors',
              errors.bought_at ? 'border-red-500/50' : 'border-white/[0.08]'
            )}
            value={form.bought_at}
            onChange={(e) => set('bought_at', e.target.value)}
            disabled={loading}
          />
        </Field>

        {/* Group ID */}
        <Field label="Group ID (optional)" icon={Tag}>
          <input
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors"
            placeholder="e.g. trip-goa or household"
            value={form.groupId}
            onChange={(e) => set('groupId', e.target.value)}
            disabled={loading}
          />
        </Field>

        {/* CTA */}
        <div className="flex gap-2 pt-2 mt-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Adding…</>
            ) : (
              <>Add expense</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddExpensePage() {
  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/*
          Split layout:
          Left  — 45% — onboarding content (features, how it works, terms, stats)
          Right — 55% — the actual expense form
          Divider line separates them at the centre.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[45%_1px_55%] gap-0 bg-[#13161d] border border-white/[0.07] rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">

          {/* LEFT — content */}
          <div className="px-8 py-10 overflow-y-auto max-h-screen lg:max-h-[90vh]">
            <LeftPanel />
          </div>

          {/* Divider */}
          <div className="hidden lg:block bg-white/[0.06]" />

          {/* RIGHT — form */}
          <div className="px-8 py-10 overflow-y-auto max-h-screen lg:max-h-[90vh]">
            <ExpenseForm />
          </div>

        </div>
      </div>
    </div>
  );
}