import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, LayoutDashboard, Settings, LogOut, ArrowRight, AlertCircle,
  CheckCircle2, CalendarClock, Gift, FileText, Download, ExternalLink, Receipt
} from "lucide-react";

type BillingStatus = {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  plan: string | null;
  renewsAt: string | null;
  trialEnd: string | null;
  isActive: boolean;
};

type Invoice = {
  id: string;
  number: string | null;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    open: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    void: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
    draft: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    uncollectible: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize font-medium ${styles[status] ?? styles.void}`}>
      {status}
    </Badge>
  );
}

export default function DashboardApp() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      window.location.href = '/register';
      return;
    }

    // Fetch billing status
    const fetchBilling = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me/billing', {
          headers: { 'x-user-id': userId }
        });
        if (!response.ok) throw new Error('Failed to fetch billing status');
        const data = await response.json();
        setBilling(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch last 5 invoices from Stripe (never stored in DB)
    const fetchInvoices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/billing/invoices', {
          headers: { 'x-user-id': userId }
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(data);
      } catch {
        // Non-critical — silently ignore invoice fetch errors
      } finally {
        setInvoicesLoading(false);
      }
    };

    fetchBilling();
    fetchInvoices();
  }, [userId]);

  const handlePortal = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/billing/portal', {
        method: 'POST',
        headers: { 'x-user-id': userId as string }
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
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

        {/* ── Subscription Status Card ── */}
        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl mb-6">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl">Your Subscription Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current Status</span>
              <Badge variant="outline" className={`px-3 py-1 bg-white dark:bg-slate-950 font-medium ${billing.status === 'active' ? 'text-emerald-600 border-emerald-200 dark:border-emerald-800' :
                billing.status === 'trialing' ? 'text-amber-600 border-amber-200 dark:border-amber-800' :
                  billing.status === 'past_due' ? 'text-amber-600 border-amber-200 dark:border-amber-800' :
                    billing.status === 'canceled' ? 'text-slate-500 border-slate-200 dark:border-slate-800' :
                      'text-slate-500 border-slate-200 dark:border-slate-800'
                }`}>
                {billing.status === 'active' && <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>}
                {billing.status === 'trialing' && <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" /> Trial Active</span>}
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
              {/* Trial end / card charge date — shown when trialing */}
              {billing.trialEnd && billing.status === 'trialing' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" /> Card Charged On
                  </p>
                  <p className="font-semibold text-amber-700 dark:text-amber-300 truncate">
                    {dayjs(billing.trialEnd).format('Do MMMM YYYY')}
                  </p>
                </div>
              )}
              {/* Renewal date — shown when active or trialing */}
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

        {/* ── Recent Invoices Card ── */}
        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-xl">Recent Invoices</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 dark:border-slate-700">
                Last 5
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Your most recent invoices fetched live from Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {invoicesLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <p className="text-sm text-slate-400 animate-pulse">Fetching invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No invoices yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                  Invoices will appear here once your subscription generates its first billing cycle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors duration-200 group"
                  >
                    {/* Invoice info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center shadow-sm group-hover:border-emerald-300 dark:group-hover:border-emerald-700 transition-colors">
                        <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {dayjs(inv.created * 1000).format('Do MMMM YYYY')}
                        </p>
                      </div>
                    </div>

                    {/* Amount + status + actions */}
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatAmount(inv.amount_paid > 0 ? inv.amount_paid : inv.amount_due, inv.currency)}
                        </p>
                      </div>
                      <InvoiceStatusBadge status={inv.status} />
                      <div className="flex items-center gap-1.5">
                        {inv.hosted_invoice_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                            onClick={() => window.open(inv.hosted_invoice_url!, '_blank')}
                            title="View invoice"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        {inv.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                            onClick={() => window.open(inv.invoice_pdf!, '_blank')}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Footer note — links to Customer Portal for full history */}
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-3 pb-1">
                  Need your full invoice history?{' '}
                  <button
                    onClick={handlePortal}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Visit the Stripe Customer Portal
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
