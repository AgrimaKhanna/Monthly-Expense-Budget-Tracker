import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Category } from '../App';

interface CategoryCardProps {
  category: Category;
  spent: number;
  onAddExpense: () => void;
  onEdit: (updates: Partial<Category>) => void;
  onDelete: () => void;
}

const EMOJI_OPTIONS = ['🛒', '🚗', '🎬', '⚡', '🍽️', '🏠', '💊', '🎓', '👕', '🎮', '📱', '✈️', '🐕', '💰', '🎨'];
const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

export function CategoryCard({ category, spent, onAddExpense, onEdit, onDelete }: CategoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editBudget, setEditBudget] = useState(category.budget.toString());
  const [editIcon, setEditIcon] = useState(category.icon);
  const [editColor, setEditColor] = useState(category.color);

  const percentage = category.budget > 0 ? (spent / category.budget) * 100 : 0;
  const isOverBudget = spent > category.budget;

  const handleSave = () => {
    onEdit({
      name: editName,
      budget: parseFloat(editBudget) || 0,
      icon: editIcon,
      color: editColor,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(category.name);
    setEditBudget(category.budget.toString());
    setEditIcon(category.icon);
    setEditColor(category.color);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200">
        <div className="mb-3">
          <label className="block text-slate-600 mb-1">Category Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="mb-3">
          <label className="block text-slate-600 mb-1">Budget Amount</label>
          <input
            type="number"
            value={editBudget}
            onChange={(e) => setEditBudget(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            step="0.01"
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-slate-600 mb-2">Icon</label>
          <div className="mb-2">
            <input
              type="text"
              value={editIcon}
              onChange={(e) => setEditIcon(e.target.value)}
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
                onClick={() => setEditIcon(emoji)}
                className={`p-2 text-2xl rounded-lg hover:bg-slate-100 transition-colors ${
                  editIcon === emoji ? 'bg-cyan-100 ring-2 ring-cyan-500' : 'bg-slate-50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-slate-600 mb-2">Color</label>
          <div className="mb-2 flex gap-2 items-center">
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
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
                onClick={() => setEditColor(c)}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                  editColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="text-slate-800">{category.name}</h3>
            <p className="text-slate-500">${spent.toFixed(2)} / ${category.budget.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all ${
              isOverBudget 
                ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`${isOverBudget ? 'text-rose-600' : 'text-slate-600'}`}>
            {percentage.toFixed(0)}%
          </span>
          {isOverBudget && (
            <span className="text-rose-600">Over by ${(spent - category.budget).toFixed(2)}</span>
          )}
        </div>
      </div>

      <button
        onClick={onAddExpense}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors border border-cyan-200"
      >
        <Plus className="w-4 h-4" />
        Add Expense
      </button>
    </div>
  );
}