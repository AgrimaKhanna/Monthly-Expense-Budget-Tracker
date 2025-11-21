import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Category } from '../App';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
}

const EMOJI_OPTIONS = ['🛒', '🚗', '🎬', '⚡', '🍽️', '🏠', '💊', '🎓', '👕', '🎮', '📱', '✈️', '🐕', '💰', '🎨'];
const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

export function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [icon, setIcon] = useState(EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setBudget('');
      setIcon(EMOJI_OPTIONS[0]);
      setColor(COLOR_OPTIONS[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !budget) return;

    onAdd({
      name,
      budget: parseFloat(budget),
      icon,
      color,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-800">Add Category</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g., Groceries"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500">$</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-2">Icon</label>
            <div className="mb-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-2xl text-center"
                placeholder="Type or paste any emoji"
                maxLength={2}
              />
            </div>
            <p className="text-slate-500 mb-2">Quick select:</p>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-2 text-2xl rounded-lg hover:bg-slate-100 transition-colors ${
                    icon === emoji ? 'bg-cyan-100 ring-2 ring-cyan-500' : 'bg-slate-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-2">Color</label>
            <div className="mb-2 flex gap-2 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
            <p className="text-slate-500 mb-2">Quick select:</p>
            <div className="grid grid-cols-10 gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Add Category
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