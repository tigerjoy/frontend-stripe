import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Check, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "YOUR_PUBLISHABLE_STRIPE_KEY");

const PLANS = [
  { name: 'Starter Plan', id: 'price_1T6nrK8xPonN1HfZWEEsH9B7', price: '$10', period: '/mo', description: 'Perfect for small side projects.' },
  { name: 'Pro Plan', id: 'price_1T6nrY8xPonN1HfZpmY1TTrL', price: '$30', period: '/mo', description: 'Ideal for growing businesses.', popular: true },
  { name: 'Pro Plus', id: 'price_1T6nrs8xPonN1HfZyIxtFSqX', price: '$60', period: '/mo', description: 'For scale and performance.' },
];

function SubscriptionCheckoutForm({ planName, planPrice, planPeriod, onCancel }: { planName: string, planPrice: string, planPeriod: string, onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "succeeded" | "failed">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);
    setPaymentStatus("processing");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app3`,
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
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setPaymentStatus("succeeded");
      setMessage("Subscription created successfully!");
    } else {
      setPaymentStatus("failed");
      setMessage("Something went wrong.");
    }

    setIsLoading(false);
  };

  if (paymentStatus === "succeeded") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-tr from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/40 border-2 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>
        <h3 className="text-3xl font-bold tracking-tight mb-3">Subscription Active!</h3>
        <p className="text-slate-500 max-w-sm mb-8">
          You are now subscribed to the <span className="font-bold text-slate-900 dark:text-white">{planName}</span> for {planPrice}{planPeriod}.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
          Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{planName}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{planPrice}{planPeriod}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Change Plan
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment Details</h4>
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
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border-0 transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Setting up subscription...
          </>
        ) : (
          `Subscribe for ${planPrice}${planPeriod}`
        )}
      </Button>
      <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1 mt-2">
        <ShieldCheck className="w-3 h-3" />
        Payments are secure and encrypted
      </p>
    </form>
  );
}

export default function EmbeddedSubscriptionApp() {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImmediatelyActive, setIsImmediatelyActive] = useState(false);

  const userId = localStorage.getItem('userId');

  const handleSelectPlan = async (plan: typeof PLANS[0]) => {
    if (!userId) {
      setError('You must register first.');
      return;
    }

    setSelectedPlan(plan);
    setIsInitializing(true);
    setClientSecret(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/billing/subscribe-embedded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId // Mock Auth
        },
        body: JSON.stringify({ priceId: plan.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize subscription");
      }

      if (data.status === 'active' && !data.clientSecret) {
        setIsImmediatelyActive(true);
      } else if (!data.clientSecret) {
        throw new Error("No client secret returned from server.");
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch (err: any) {
      setError(err.message);
      setSelectedPlan(null); // Reset if failed
    } finally {
      setIsInitializing(false);
    }
  };

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: '#4f46e5', /* indigo-600 */
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
        border: '1px solid #4f46e5',
        boxShadow: '0 0 0 1px #4f46e5',
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px]" />

      <div className="w-full max-w-7xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Header */}
        <div className="text-center mb-12">
          {!selectedPlan && (
            <Button variant="ghost" className="mb-6 -ml-4" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            {selectedPlan ? "Complete your subscription" : "Choose your plan"}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {selectedPlan ? "Enter your payment details below to activate your recurring subscription." : "Select a tier. You will pay securely without leaving the page."}
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
            {PLANS.map((plan) => (
              <div key={plan.id} className="relative group">
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full flex flex-col relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/90 
                  ${plan.popular ? 'border-blue-500/50 shadow-blue-500/10 z-10 scale-105' : 'border-slate-200/60'}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="text-slate-500">{plan.period}</span>
                    </div>
                    <div className="space-y-3 mt-6 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Full access</div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> In-app billing</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isInitializing}
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {isInitializing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {isInitializing ? "Preparing..." : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl shadow-blue-500/10 border-slate-200/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-6">
                {isImmediatelyActive ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-24 h-24 bg-gradient-to-tr from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/40 border-2 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-3">Subscription Active!</h3>
                    <p className="text-slate-500 max-w-sm mb-8">
                      You are now subscribed to the <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name}</span>! No payment was required.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                      Back to Plans
                    </Button>
                  </div>
                ) : clientSecret ? (
                  <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                    <SubscriptionCheckoutForm
                      planName={selectedPlan.name}
                      planPrice={selectedPlan.price}
                      planPeriod={selectedPlan.period}
                      onCancel={() => setSelectedPlan(null)}
                    />
                  </Elements>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-500 animate-pulse">Initializing secure form...</p>
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
