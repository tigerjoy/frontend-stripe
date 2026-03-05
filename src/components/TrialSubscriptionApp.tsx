import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Check, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Gift, CalendarClock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { SETTINGS } from '@/lib/config';

const BACKEND_URL = SETTINGS.BACKEND_URL;

dayjs.extend(advancedFormat);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "YOUR_PUBLISHABLE_STRIPE_KEY");

const TRIAL_PLANS = [
  { name: 'Starter Plan', id: 'price_1T6nrK8xPonN1HfZWEEsH9B7', price: '$10', period: '/mo', description: 'Perfect for small side projects.' },
  { name: 'Pro Plan', id: 'price_1T6nrY8xPonN1HfZpmY1TTrL', price: '$30', period: '/mo', description: 'Ideal for growing businesses.', popular: true },
  { name: 'Pro Plus', id: 'price_1T6nrs8xPonN1HfZyIxtFSqX', price: '$60', period: '/mo', description: 'For scale and performance.' },
];

function TrialCheckoutForm({
  planName,
  planPrice,
  planPeriod,
  trialEnd,
  onCancel,
}: {
  planName: string;
  planPrice: string;
  planPeriod: string;
  trialEnd: string | null;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "succeeded" | "failed">("idle");

  const chargedOnDate = trialEnd ? dayjs(trialEnd).format('Do MMMM YYYY') : null;

  useEffect(() => {
    if (paymentStatus === "succeeded") {
      const timer = setTimeout(() => {
        window.location.href = '/dashboard';
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);
    setPaymentStatus("processing");

    // For a trial subscription, Stripe uses a SetupIntent to save the card.
    // We confirm the setup (not a payment) – stripe.confirmSetup is the right call.
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app4`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred");
      } else {
        setMessage("An unexpected error occurred.");
      }
      setPaymentStatus("failed");
    } else {
      // SetupIntent confirmed without redirect → trial subscription is active
      setPaymentStatus("succeeded");
    }

    setIsLoading(false);
  };

  if (paymentStatus === "succeeded") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-400/20 dark:bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-800/40 border-2 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>
        <h3 className="text-3xl font-bold tracking-tight mb-3">Trial Started! 🎉</h3>
        <p className="text-slate-500 max-w-sm mb-4">
          You are now on a <span className="font-bold text-slate-900 dark:text-white">30-day free trial</span> of the <span className="font-bold text-slate-900 dark:text-white">{planName}</span>.
        </p>
        {chargedOnDate && (
          <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <CalendarClock className="w-4 h-4" />
            Your card will be charged on <strong className="ml-1">{chargedOnDate}</strong>
          </div>
        )}
        <p className="text-sm text-slate-400 mb-6">Redirecting to dashboard in 6 seconds...</p>
        <Button onClick={() => window.location.href = '/dashboard'} variant="outline" className="w-full">
          Go to Dashboard Now
        </Button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {/* Plan summary */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{planName}</h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            Free for 30 days, then {planPrice}{planPeriod}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Change Plan
        </Button>
      </div>

      {/* Trial info banner */}
      {chargedOnDate && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm text-amber-700 dark:text-amber-400">
          <CalendarClock className="w-4 h-4 mt-0.5 shrink-0" />
          <span>We're saving your card now. You <strong>won't be charged</strong> until your trial ends on <strong>{chargedOnDate}</strong>. Cancel anytime before then.</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Save Payment Method</h4>
        </div>
        <div className="p-1">
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
        </div>
      </div>

      {message && paymentStatus === "failed" && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 border-0 transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Setting up trial...
          </>
        ) : (
          <>
            <Gift className="mr-2 h-5 w-5" />
            Start Free Trial
          </>
        )}
      </Button>
      <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1 mt-2">
        <ShieldCheck className="w-3 h-3" />
        Card details are encrypted and stored securely
      </p>
    </form>
  );
}

export default function TrialSubscriptionApp() {
  const [selectedPlan, setSelectedPlan] = useState<typeof TRIAL_PLANS[0] | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = localStorage.getItem('userId');

  const handleSelectPlan = async (plan: typeof TRIAL_PLANS[0]) => {
    if (!userId) {
      setError('You must register first.');
      return;
    }

    setSelectedPlan(plan);
    setIsInitializing(true);
    setClientSecret(null);
    setTrialEnd(null);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/billing/subscribe-trial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ priceId: plan.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize trial subscription");
      }

      if (!data.clientSecret) {
        throw new Error("No client secret returned from server.");
      }

      setClientSecret(data.clientSecret);
      setTrialEnd(data.trialEnd || null);
    } catch (err: any) {
      setError(err.message);
      setSelectedPlan(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: '#059669', /* emerald-600 */
      colorBackground: 'transparent',
      colorText: '#334155',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e2e8f0',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
      },
      '.Input:focus': {
        border: '1px solid #059669',
        boxShadow: '0 0 0 1px #059669',
      }
    }
  };

  const chargedOnDate = trialEnd ? dayjs(trialEnd).format('Do MMMM YYYY') : null;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 dark:bg-teal-600/10 blur-[120px]" />

      <div className="w-full max-w-7xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Header */}
        <div className="text-center mb-12">
          {!selectedPlan && (
            <Button variant="ghost" className="mb-6 -ml-4" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
            <Gift className="w-4 h-4" />
            30-Day Free Trial on all plans
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            {selectedPlan ? "Save your payment method" : "Try any plan free for 30 days"}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {selectedPlan
              ? `We'll save your card now but won't charge you until your trial ends${chargedOnDate ? ` on ${chargedOnDate}` : ''}.`
              : "No charge today. Cancel anytime before your trial ends."}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200 inline-block">
              {error}
            </div>
          )}
        </div>

        {/* View switching: Plans vs Checkout */}
        {!selectedPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TRIAL_PLANS.map((plan) => (
              <div key={plan.id} className="relative group">
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full flex flex-col relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/90
                  ${plan.popular ? 'border-emerald-500/50 shadow-emerald-500/10 z-10 scale-105' : 'border-slate-200/60'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {/* Trial badge */}
                    <div className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <Gift className="w-3 h-3" /> 30 days free
                    </div>
                    <div className="mb-1">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="text-slate-500">{plan.period}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">after free trial</p>
                    <div className="space-y-3 mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Full access</div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> In-app billing</div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isInitializing}
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {isInitializing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                      {isInitializing ? "Preparing..." : "Start Free Trial"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl shadow-emerald-500/10 border-slate-200/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-6">
                {clientSecret ? (
                  <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                    <TrialCheckoutForm
                      planName={selectedPlan.name}
                      planPrice={selectedPlan.price}
                      planPeriod={selectedPlan.period}
                      trialEnd={trialEnd}
                      onCancel={() => { setSelectedPlan(null); setClientSecret(null); setTrialEnd(null); }}
                    />
                  </Elements>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-slate-500 animate-pulse">Preparing your trial...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
