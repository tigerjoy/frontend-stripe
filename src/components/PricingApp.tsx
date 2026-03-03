import { useState } from 'react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Check } from "lucide-react";

const PLANS = [
  { name: 'Starter Plan', id: 'price_1T6nrK8xPonN1HfZWEEsH9B7', productId: 'prod_U4xmF5SiOIbaXS', price: '$10', period: '/mo', description: 'Perfect for small side projects.' },
  { name: 'Pro Plan', id: 'price_1T6nrY8xPonN1HfZpmY1TTrL', productId: 'prod_U4xndIHN6xuo40', price: '$30', period: '/mo', description: 'Ideal for growing businesses.', popular: true },
  { name: 'Pro Plus', id: 'price_1T6nrs8xPonN1HfZyIxtFSqX', productId: 'prod_U4xn3n8SnvVoXO', price: '$60', period: '/mo', description: 'For scale and performance.' },
];

export default function PricingApp() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  const handleSubscribe = async (priceId: string) => {
    if (!userId) {
      setError('You must register first.');
      return;
    }

    setLoading(priceId);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId // Mock Auth
        },
        body: JSON.stringify({ priceId }), // Send the specific price ID
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px]" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-balance">
            No surprise fees. Choose the tier that best fits your project's needs.
          </p>
          {error && (
            <div className="mt-6 inline-flex p-3 text-sm rounded-md bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 animate-in fade-in">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className="relative group">
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 flex items-center gap-1 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card className={`h-full flex flex-col relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-xl
                ${plan.popular
                  ? 'border-indigo-500/50 dark:border-indigo-500/50 shadow-indigo-500/10 dark:shadow-indigo-500/10 z-10 scale-105 md:scale-110 md:-translate-y-2'
                  : 'border-slate-200/60 dark:border-slate-800/60 shadow-slate-200/40 dark:shadow-black/20 text-slate-600 dark:text-slate-400 opacity-90 hover:opacity-100'}
              `}>
                <CardHeader>
                  <CardTitle className={`text-xl font-bold ${plan.popular ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-50'}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="h-10 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{plan.period}</span>
                  </div>

                  <div className="text-xs text-slate-400 dark:text-slate-500 space-y-3 mt-6">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Full API access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Stripe Checkout Integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600 font-mono mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      ID: {plan.productId.substring(0, 12)}...
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full h-11 transition-all ${plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/25 border-0'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          Note: Ensure the local placeholder IDs match actual Stripe Price IDs linked to valid Products.
        </p>
      </div>
    </div>
  );
}
