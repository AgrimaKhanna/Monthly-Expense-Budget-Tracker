import { useState, useEffect } from 'react';
import { BudgetOverview } from './components/BudgetOverview';
import { CategoryCard } from './components/CategoryCard';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { ExpenseList } from './components/ExpenseList';
import { MonthNavigator } from './components/MonthNavigator';
import { AuthModal } from './components/AuthModal';
import { Plus, TrendingDown, LogOut, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  budget: number;
  color: string;
  icon: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Groceries', budget: 500, color: '#10b981', icon: '🛒' },
  { id: '2', name: 'Transportation', budget: 200, color: '#3b82f6', icon: '🚗' },
  { id: '3', name: 'Entertainment', budget: 150, color: '#8b5cf6', icon: '🎬' },
  { id: '4', name: 'Utilities', budget: 300, color: '#f59e0b', icon: '⚡' },
  { id: '5', name: 'Dining Out', budget: 250, color: '#ef4444', icon: '🍽️' },
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    return `${year}-${String(month).padStart(2, '0')}`;
  });
  
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          setUser(session.user);
          setAccessToken(session.access_token);
          await loadUserData(session.access_token);
        }
      } catch (error) {
        console.log('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Load user data from server
  const loadUserData = async (token: string) => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-959f9150`;
      
      const [categoriesRes, expensesRes] = await Promise.all([
        fetch(`${serverUrl}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${serverUrl}/expenses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (categoriesRes.ok) {
        const { categories: userCategories } = await categoriesRes.json();
        if (userCategories && userCategories.length > 0) {
          setCategories(userCategories);
        }
      }

      if (expensesRes.ok) {
        const { expenses: userExpenses } = await expensesRes.json();
        if (userExpenses) {
          setExpenses(userExpenses);
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  // Save data to server whenever it changes
  useEffect(() => {
    if (user && accessToken) {
      saveCategories();
    }
  }, [categories, user, accessToken]);

  useEffect(() => {
    if (user && accessToken) {
      saveExpenses();
    }
  }, [expenses, user, accessToken]);

  const saveCategories = async () => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-959f9150`;
      await fetch(`${serverUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ categories })
      });
    } catch (error) {
      console.log('Error saving categories:', error);
    }
  };

  const saveExpenses = async () => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-959f9150`;
      await fetch(`${serverUrl}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ expenses })
      });
    } catch (error) {
      console.log('Error saving expenses:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      setUser(data.user);
      setAccessToken(data.session.access_token);
      await loadUserData(data.session.access_token);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-959f9150`;
    
    const response = await fetch(`${serverUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to create account');
    }

    // Don't auto-sign in, wait for OTP verification
    const { message } = await response.json();
    console.log(message);
  };

  const handleVerifyOtp = async (email: string, otp: string) => {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (error) throw error;

    if (data.session) {
      setUser(data.user);
      setAccessToken(data.session.access_token);
      await loadUserData(data.session.access_token);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setCategories(DEFAULT_CATEGORIES);
    setExpenses([]);
  };

  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategorySpent = (categoryId: string) => {
    return currentMonthExpenses
      .filter(exp => exp.categoryId === categoryId)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setExpenses(expenses.filter(exp => exp.categoryId !== id));
  };

  const getMonthsWithExpenses = () => {
    const months = new Set(expenses.map(exp => exp.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const handleDownloadExcel = () => {
    if (currentMonthExpenses.length === 0) {
      alert('No expenses to download for this month');
      return;
    }

    const excelData = currentMonthExpenses.map(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      return {
        Date: new Date(expense.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        Category: category?.name || 'Unknown',
        Description: expense.description || '-',
        Amount: expense.amount
      };
    });

    excelData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    const totalRow = {
      Date: '',
      Category: '',
      Description: 'TOTAL',
      Amount: totalSpent
    };

    excelData.push({} as any);
    excelData.push(totalRow);
    excelData.push({} as any);
    excelData.push({
      Date: '',
      Category: 'Budget Summary',
      Description: '',
      Amount: ''
    } as any);

    categories.forEach(category => {
      const spent = getCategorySpent(category.id);
      if (spent > 0 || category.budget > 0) {
        excelData.push({
          Date: '',
          Category: category.name,
          Description: `$${spent.toFixed(2)} / $${category.budget.toFixed(2)}`,
          Amount: spent
        } as any);
      }
    });

    excelData.push({} as any);
    excelData.push({
      Date: '',
      Category: 'Total Budget',
      Description: `$${totalSpent.toFixed(2)} / $${totalBudget.toFixed(2)}`,
      Amount: totalBudget
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    const monthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, monthName);

    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 }
    ];

    const fileName = `Budget_${currentMonth}_${monthName.replace(' ', '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingDown className="w-12 h-12 text-cyan-600" />
              <h1 className="text-cyan-900">Budget Tracker</h1>
            </div>
            <p className="text-slate-600">Take control of your monthly spending with cloud sync</p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-slate-800 mb-4">Welcome to Budget Tracker</h2>
            <p className="text-slate-600 mb-6">
              Sign in to access your budget from any device. Your data is securely synced to the cloud.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-slate-700">Track spending by category</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-slate-700">View monthly trends</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl mb-2">☁️</div>
                <p className="text-slate-700">Cloud sync enabled</p>
              </div>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-8 h-8 text-cyan-600" />
                <h1 className="text-cyan-900">Budget Tracker</h1>
              </div>
              <p className="text-slate-600">Take control of your monthly spending</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigator */}
        <MonthNavigator
          currentMonth={currentMonth}
          monthName={monthName}
          onNavigate={navigateMonth}
          onSelectMonth={setCurrentMonth}
          monthsWithExpenses={getMonthsWithExpenses()}
          onDownloadExcel={handleDownloadExcel}
          hasExpenses={currentMonthExpenses.length > 0}
        />

        {/* Overview */}
        <BudgetOverview 
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          categories={categories}
          expenses={currentMonthExpenses}
          getCategorySpent={getCategorySpent}
        />

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-700 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="mb-4 text-slate-800">Budget Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                spent={getCategorySpent(category.id)}
                onAddExpense={() => {
                  setSelectedCategory(category.id);
                  setIsAddExpenseOpen(true);
                }}
                onEdit={(updates) => handleUpdateCategory(category.id, updates)}
                onDelete={() => handleDeleteCategory(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <ExpenseList
          expenses={currentMonthExpenses}
          categories={categories}
          onDelete={handleDeleteExpense}
        />

        {/* Modals */}
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setSelectedCategory(null);
          }}
          onAdd={handleAddExpense}
          categories={categories}
          defaultCategoryId={selectedCategory}
          currentMonth={currentMonth}
        />

        <AddCategoryModal
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          onAdd={handleAddCategory}
        />
      </div>
    </div>
  );
}