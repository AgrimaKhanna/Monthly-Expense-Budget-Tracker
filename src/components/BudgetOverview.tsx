import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Category, Expense } from '../App';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  categories: Category[];
  expenses: Expense[];
  getCategorySpent: (categoryId: string) => number;
}

export function BudgetOverview({ 
  totalBudget, 
  totalSpent, 
  categories, 
  getCategorySpent 
}: BudgetOverviewProps) {
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const chartData = categories
    .map(cat => ({
      name: cat.name,
      value: getCategorySpent(cat.id),
      color: cat.color,
    }))
    .filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Stats Cards */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-600">Total Budget</span>
          <DollarSign className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-slate-900">${totalBudget.toFixed(2)}</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-600">Total Spent</span>
          <TrendingDown className="w-5 h-5 text-rose-500" />
        </div>
        <div className="text-slate-900">${totalSpent.toFixed(2)}</div>
        <div className="mt-2">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <span className="text-slate-500 mt-1 block">{percentageUsed.toFixed(1)}% used</span>
        </div>
      </div>

      <div className={`bg-white rounded-xl p-6 shadow-md border border-slate-200 ${remaining < 0 ? 'bg-rose-50' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-600">Remaining</span>
          <TrendingUp className={`w-5 h-5 ${remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
        </div>
        <div className={remaining >= 0 ? 'text-slate-900' : 'text-rose-700'}>
          ${Math.abs(remaining).toFixed(2)}
        </div>
        {remaining < 0 && (
          <span className="text-rose-600 mt-1 block">Over budget!</span>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <h3 className="mb-4 text-slate-800">Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
