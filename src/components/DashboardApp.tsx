import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LayoutDashboard, Settings, LogOut, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

type BillingStatus = {
  status: 'active' | 'past_due' | 'canceled' | 'none';
  plan: string | null;
  renewsAt: string | null;
  isActive: boolean;
};

export default function DashboardApp() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      window.location.href = '/register';
      return;
    }

    const fetchBilling = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me/billing', {
          headers: {
            'x-user-id': userId // Mock Auth
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch billing status');
        }

        const data = await response.json();
        setBilling(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, [userId]);

  const handlePortal = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/billing/portal', {
        method: 'POST',
        headers: {
          'x-user-id': userId as string
        }
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!billing) return null;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 blur-[120px]" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] rounded-full bg-teal-500/10 dark:bg-teal-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">

        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-2">My Dashboard</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md">Manage your account and billing preferences.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm rounded-md bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 animate-in fade-in flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl">Your Subscription Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current Status</span>
              <Badge variant="outline" className={`px-3 py-1 bg-white dark:bg-slate-950 font-medium ${billing.status === 'active' ? 'text-emerald-600 border-emerald-200 dark:border-emerald-800' :
                billing.status === 'past_due' ? 'text-amber-600 border-amber-200 dark:border-amber-800' :
                  billing.status === 'canceled' ? 'text-slate-500 border-slate-200 dark:border-slate-800' :
                    'text-slate-500 border-slate-200 dark:border-slate-800'
                }`}>
                {billing.status === 'active' && <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>}
                {billing.status === 'past_due' && <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Past Due</span>}
                {billing.status === 'canceled' && <span>Canceled</span>}
                {billing.status === 'none' && <span>No subscription</span>}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {billing.plan && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Active Plan</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{billing.plan}</p>
                </div>
              )}
              {billing.renewsAt && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Renews At</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{dayjs(billing.renewsAt).format('Do MMMM YYYY')}</p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePortal}
                variant="outline"
                className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium h-11"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>

              <Button
                onClick={() => window.location.href = '/pricing'}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-md shadow-emerald-500/20 border-0 h-11"
              >
                Change Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                onClick={() => { localStorage.removeItem('userId'); window.location.href = '/'; }}
                className="mt-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out completely
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
