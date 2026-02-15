'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'If an account exists with this email, you will receive a password reset link shortly.',
        });
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to send reset email. Please try again.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-teal-500/30">
            <span className="text-white text-3xl font-bold">+</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">GitVitals</h1>
          <p className="text-muted-foreground mt-1 font-medium">Clinical Management System</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors font-medium group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Reset your password</h2>
          <p className="text-muted-foreground mb-6 text-base">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl font-medium ${
                message.type === 'success'
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
