import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Category, Expense } from '../App';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  categories: Category[];
  defaultCategoryId: string | null;
  currentMonth: string;
}

export function AddExpenseModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  categories, 
  defaultCategoryId,
  currentMonth 
}: AddExpenseModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setCategoryId(defaultCategoryId || (categories[0]?.id || ''));
      setAmount('');
      setDescription('');
    }
  }, [isOpen, defaultCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || !date) return;

    onAdd({
      categoryId,
      amount: parseFloat(amount),
      description,
      date,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-800">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="What did you buy?"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
