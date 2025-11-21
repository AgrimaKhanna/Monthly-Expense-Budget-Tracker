import { Trash2, Receipt } from 'lucide-react';
import type { Category, Expense } from '../App';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, categories, onDelete }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200 text-center">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No expenses yet this month</p>
        <p className="text-slate-400">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
      <h2 className="mb-4 text-slate-800">Recent Expenses</h2>
      <div className="space-y-2">
        {sortedExpenses.map(expense => {
          const category = getCategoryById(expense.categoryId);
          const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div className="flex items-center gap-3 flex-1">
                {category && (
                  <span className="text-2xl">{category.icon}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800">
                      {expense.description || 'Untitled'}
                    </span>
                    {category && (
                      <span 
                        className="px-2 py-0.5 rounded text-white text-xs"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500">{formattedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-900">${expense.amount.toFixed(2)}</span>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
