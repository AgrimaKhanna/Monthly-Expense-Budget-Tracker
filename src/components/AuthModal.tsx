import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
}

export function AuthModal({ isOpen, onClose, onSignIn, onSignUp }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('One special character');
    }
    
    return errors;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    if (mode === 'signup') {
      setPasswordErrors(validatePassword(pwd));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation checks
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      
      const pwdErrors = validatePassword(password);
      if (pwdErrors.length > 0) {
        setError('Password does not meet requirements');
        return;
      }
    }
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setPasswordErrors([]);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-800">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
              required
              minLength={8}
            />
            
            {mode === 'signup' && password && (
              <div className="mt-2 space-y-1">
                <p className="text-slate-600">Password must contain:</p>
                {[
                  { check: password.length >= 8, label: 'At least 8 characters' },
                  { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
                  { check: /[a-z]/.test(password), label: 'One lowercase letter' },
                  { check: /[0-9]/.test(password), label: 'One number' },
                  { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'One special character' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${item.check ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      {item.check && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`${item.check ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && passwordErrors.length > 0)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-slate-400"
          >
            {loading ? (
              'Loading...'
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-cyan-600 hover:text-cyan-700 hover:underline"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}