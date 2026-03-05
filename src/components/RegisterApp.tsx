import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { SETTINGS } from '@/lib/config';

const BACKEND_URL = SETTINGS.BACKEND_URL;

type Mode = 'register' | 'login';

export default function RegisterApp() {
  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const response = await fetch(`${BACKEND_URL}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        localStorage.setItem('userId', data.id);
      } else {
        const response = await fetch(`${BACKEND_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('userId', data.id);
      }

      let next = searchParams.get('next') || '/pricing';
      if (!next) {
        if (mode === 'register') {
          next = '/pricing';
        } else {
          next = '/dashboard';
        }
      }
      navigate(next);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background elements */}
      <div
        className={`absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-700 ${isRegister
          ? 'bg-emerald-500/10 dark:bg-emerald-600/10'
          : 'bg-blue-500/10 dark:bg-blue-600/10'
          }`}
      />
      <div
        className={`absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-700 ${isRegister
          ? 'bg-teal-500/10 dark:bg-teal-600/10'
          : 'bg-indigo-500/10 dark:bg-indigo-600/10'
          }`}
      />

      <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-500 ${isRegister
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/30'
                : 'bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-blue-500/30'
                }`}
            >
              {isRegister ? (
                <UserPlus className="w-6 h-6 text-white" />
              ) : (
                <LogIn className="w-6 h-6 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 transition-all duration-300">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 mt-1 transition-all duration-300">
              {isRegister
                ? 'Start your subscription journey.'
                : 'Sign in to continue to your account.'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm rounded-md bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Name field — only visible in register mode */}
              <div
                className={`space-y-2 overflow-hidden transition-all duration-300 ${isRegister ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  tabIndex={isRegister ? 0 : -1}
                  className="bg-white/50 dark:bg-slate-900/50"
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-slate-900/50"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-slate-900/50"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-11 text-white shadow-lg transition-all text-base ${isRegister
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRegister ? 'Registering...' : 'Signing in...'}
                  </>
                ) : isRegister ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Toggle link */}
              <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  className={`font-semibold underline-offset-2 hover:underline transition-colors ${isRegister
                    ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'
                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-500'
                    }`}
                >
                  {isRegister ? 'Sign in' : 'Register'}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
