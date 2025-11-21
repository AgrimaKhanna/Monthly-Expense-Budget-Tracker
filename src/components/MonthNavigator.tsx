import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, Download, CalendarCheck } from 'lucide-react';

interface MonthNavigatorProps {
  currentMonth: string;
  monthName: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  onSelectMonth: (month: string) => void;
  monthsWithExpenses: string[];
  onDownloadExcel: () => void;
  hasExpenses: boolean;
}

export function MonthNavigator({ 
  currentMonth, 
  monthName, 
  onNavigate, 
  onSelectMonth,
  monthsWithExpenses,
  onDownloadExcel,
  hasExpenses
}: MonthNavigatorProps) {
  const [showMonthList, setShowMonthList] = useState(false);

  const formatMonthName = (monthStr: string) => {
    return new Date(monthStr + '-01').toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isCurrentMonth = (monthStr: string) => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return monthStr === current;
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-600" />
              <h2 className="text-slate-800 min-w-[200px]">{monthName}</h2>
            </div>

            <button
              onClick={() => onNavigate('next')}
              className="p-2 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Month Picker & Quick Access */}
          <div className="flex items-center gap-3">
            {/* Today Button */}
            {!isCurrentMonth(currentMonth) && (
              <button
                onClick={() => {
                  const now = new Date();
                  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                  onSelectMonth(current);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
                title="Go to current month"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Today</span>
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={onDownloadExcel}
              disabled={!hasExpenses}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                hasExpenses
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={hasExpenses ? 'Download as Excel' : 'No expenses to download'}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            {/* Date Picker */}
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-700"
            />

            {/* Months with Data Dropdown */}
            {monthsWithExpenses.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMonthList(!showMonthList)}
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  <span>View History</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMonthList ? 'rotate-180' : ''}`} />
                </button>

                {showMonthList && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMonthList(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-20 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <p className="px-3 py-2 text-slate-500 uppercase tracking-wide">
                          Months with Expenses
                        </p>
                        {monthsWithExpenses.map(month => (
                          <button
                            key={month}
                            onClick={() => {
                              onSelectMonth(month);
                              setShowMonthList(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 transition-colors ${
                              month === currentMonth 
                                ? 'bg-cyan-100 text-cyan-700' 
                                : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{formatMonthName(month)}</span>
                              {isCurrentMonth(month) && (
                                <span className="px-2 py-0.5 bg-cyan-200 text-cyan-800 rounded text-xs">
                                  Current
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {monthsWithExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-6 text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                <span>{monthsWithExpenses.length} month{monthsWithExpenses.length !== 1 ? 's' : ''} tracked</span>
              </div>
              {!isCurrentMonth(currentMonth) && (
                <button
                  onClick={() => {
                    const now = new Date();
                    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                    onSelectMonth(current);
                  }}
                  className="text-cyan-600 hover:text-cyan-700 hover:underline"
                >
                  Return to current month
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}