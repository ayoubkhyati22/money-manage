import React from 'react';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  email,
  password,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: LoginFormProps) {
  
  const handleDemoLogin = () => {
    onEmailChange('test@financeflow.com');
    onPasswordChange('test123');
    // Using the event approach is safer, but calling onSubmit directly is often cleaner 
    // depending on your parent logic. For now, we simulate a slight delay for realism.
    setTimeout(() => {
      const submitBtn = document.getElementById('submit-btn');
      submitBtn?.click();
    }, 400);
  };

  const inputStyles = `
    w-full pl-11 pr-4 py-3 
    bg-white/50 dark:bg-dark-900/50 
    backdrop-blur-xl
    border border-slate-200 dark:border-dark-700 
    rounded-xl outline-none
    transition-all duration-300
    focus:border-indigo-500 dark:focus:border-indigo-400
    focus:ring-4 focus:ring-indigo-500/10
    placeholder:text-slate-400 dark:placeholder:text-dark-500
    text-slate-700 dark:text-slate-200 text-sm
  `;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        
        {/* Quick Demo Access - Now looks like a premium "shortcut" */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDemoLogin}
          disabled={loading}
          className="group relative w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-700/30 rounded-2xl transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-amber-400 rounded-lg text-white shadow-amber-200 shadow-lg group-hover:rotate-12 transition-transform">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Instant Demo</p>
              <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70">One-click auto-fill and login</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-dark-800" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#0f172a] px-4 text-slate-400 dark:text-dark-500 tracking-widest font-medium">Or continue with email</span>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className={inputStyles}
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
              Password
            </label>
            <button type="button" className="text-xs text-indigo-500 hover:underline font-medium transition-all">
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={inputStyles}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          id="submit-btn"
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full mt-2 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300 group-hover:scale-105" />
          <div className="relative py-3.5 flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wide">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </motion.button>

        <p className="text-center text-sm text-slate-500 dark:text-dark-400 mt-6">
          Don't have an account?{' '}
          <a href="#" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4">
            Create an account
          </a>
        </p>
      </form>
    </motion.div>
  );
}