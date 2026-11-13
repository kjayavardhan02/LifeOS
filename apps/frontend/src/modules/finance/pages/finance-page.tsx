import { useState } from 'react';
import { Plus, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useFinanceSummary,
  useFinanceComparison,
} from '../hooks/use-transactions';
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from '../hooks/use-budgets';
import { SummaryCards } from '../components/summary-cards';
import { TransactionFilters } from '../components/transaction-filters';
import { TransactionItem } from '../components/transaction-item';
import { TransactionDialog } from '../components/transaction-dialog';
import { TransactionDetailPanel } from '../components/transaction-detail-panel';
import { BudgetCard } from '../components/budget-card';
import { BudgetDialog } from '../components/budget-dialog';
import { MonthComparison } from '../components/month-comparison';
import type {
  FinanceTransaction,
  TransactionFilters as TransactionFiltersType,
  CreateTransactionInput,
  UpdateTransactionInput,
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '@lifeos/shared';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Tab = 'transactions' | 'budgets' | 'compare';

export function FinancePage() {
  const now = new Date();
  const [tab, setTab] = useState<Tab>('transactions');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Transaction state
  const [filters, setFilters] = useState<TransactionFiltersType>({});
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<FinanceTransaction | null>(null);
  const [page, setPage] = useState(1);

  // Budget state
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Queries
  const { data: summaryResponse, isLoading: summaryLoading } = useFinanceSummary(month, year);
  const summary = summaryResponse?.data;

  const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;

  const { data: txData, isLoading: txLoading } = useTransactions({
    ...filters,
    dateFrom,
    dateTo,
    page,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const { data: budgetResponse, isLoading: budgetsLoading } = useBudgets(month, year);
  const budgets = budgetResponse?.data ?? [];

  const { data: comparisonResponse, isLoading: comparisonLoading } = useFinanceComparison(month, year);

  // Mutations
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const transactions = txData?.data ?? [];
  const meta = txData?.meta;

  // Handlers
  const handleTxSubmit = (
    input: CreateTransactionInput | (UpdateTransactionInput & { id: string }),
  ) => {
    if ('id' in input) {
      updateTx.mutate(input, {
        onSuccess: () => {
          setTxDialogOpen(false);
          setEditingTx(null);
        },
      });
    } else {
      createTx.mutate(input, {
        onSuccess: () => setTxDialogOpen(false),
      });
    }
  };

  const handleBudgetSubmit = (
    input: CreateBudgetInput | (UpdateBudgetInput & { id: string }),
  ) => {
    if ('id' in input) {
      updateBudget.mutate(input, {
        onSuccess: () => {
          setBudgetDialogOpen(false);
          setEditingBudget(null);
        },
      });
    } else {
      createBudget.mutate(input, {
        onSuccess: () => setBudgetDialogOpen(false),
      });
    }
  };

  const prevMonth = () => {
    setPage(1);
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    setPage(1);
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-page-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Finance</h1>
          <p className="mt-1 text-sm text-muted">
            Track your income, expenses, and budgets
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-foreground">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <SummaryCards summary={summary} isLoading={summaryLoading} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-6 border-b border-border">
        {([
          { key: 'transactions', label: 'Transactions' },
          { key: 'budgets', label: 'Budgets' },
          { key: 'compare', label: 'Compare' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TransactionFilters filters={filters} onChange={setFilters} />
            <button
              onClick={() => {
                setEditingTx(null);
                setTxDialogOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>

          {txLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg border border-border bg-card animate-pulse"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <IndianRupee className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">
                No transactions found
              </p>
              <p className="mt-1 text-xs text-muted">
                Add your first transaction to start tracking
              </p>
              <button
                onClick={() => {
                  setEditingTx(null);
                  setTxDialogOpen(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {transactions.map((tx, i) => (
                  <div key={tx.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                    <TransactionItem
                      transaction={tx}
                      onEdit={(t) => {
                        setEditingTx(t);
                        setTxDialogOpen(true);
                      }}
                      onDelete={(id) => deleteTx.mutate(id)}
                      onClick={(t) => setSelectedTx(t)}
                    />
                  </div>
                ))}
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={page === meta.totalPages}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          <TransactionDialog
            open={txDialogOpen}
            onClose={() => {
              setTxDialogOpen(false);
              setEditingTx(null);
            }}
            onSubmit={handleTxSubmit}
            transaction={editingTx}
          />
        </div>
      )}

      {/* Budgets Tab */}
      {tab === 'budgets' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {budgets.length} budget{budgets.length !== 1 ? 's' : ''} for{' '}
              {MONTHS[month - 1]} {year}
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetDialogOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Budget
            </button>
          </div>

          {budgetsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-lg border border-border bg-card animate-pulse"
                />
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <IndianRupee className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">
                No budgets set
              </p>
              <p className="mt-1 text-xs text-muted">
                Create budgets to track your spending limits
              </p>
              <button
                onClick={() => {
                  setEditingBudget(null);
                  setBudgetDialogOpen(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget, i) => (
                <div key={budget.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                  <BudgetCard
                    budget={budget}
                    onEdit={(b) => {
                      setEditingBudget(b);
                      setBudgetDialogOpen(true);
                    }}
                    onDelete={(id) => deleteBudget.mutate(id)}
                  />
                </div>
              ))}
            </div>
          )}

          <BudgetDialog
            open={budgetDialogOpen}
            onClose={() => {
              setBudgetDialogOpen(false);
              setEditingBudget(null);
            }}
            onSubmit={handleBudgetSubmit}
            budget={editingBudget}
            month={month}
            year={year}
          />
        </div>
      )}

      {/* Compare Tab */}
      {tab === 'compare' && (
        <MonthComparison data={comparisonResponse?.data} isLoading={comparisonLoading} />
      )}

      <TransactionDetailPanel
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
