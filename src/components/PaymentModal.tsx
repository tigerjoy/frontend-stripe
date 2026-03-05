import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { SETTINGS } from '@/lib/config';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// IMPORTANT: In production, load your public key from env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample');
const BACKEND_URL = SETTINGS.BACKEND_URL;

function CheckoutForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // Confirm the SetupIntent or PaymentIntent attached to the Payment Element
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Submission formatting error');
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment_intent=success`,
      },
      // Using redirect: 'if_required' so we can handle success on the same page!
      redirect: 'if_required', 
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment confirmation failed');
      setLoading(false);
    } else {
      // Payment succeeded inline!
      setLoading(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PaymentElement className="mb-6" />
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-lg"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
      <p className="text-xs text-center mt-4 text-slate-500">
        Secured by Stripe. Your subscription will activate immediately.
      </p>
    </form>
  );
}

export default function PaymentModal() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Attempt to fetch the pending intent for this user
    const fetchIntent = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/billing/incomplete-intent`, {
          headers: { 'x-user-id': userId as string }
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to initialize payment');
        }
        
        const data = await res.json();
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) fetchIntent();
  }, [userId]);

  const handleSuccess = () => {
    setShowSuccess(true);
    // Reload the dashboard after 2 seconds to reflect "active" state
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  // If there's no intent fetched, it means they don't have an incomplete sub, so hide modal.
  if (!clientSecret) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-950 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 my-8">
        
        {/* Decorative Top Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Action Required
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Your platform access has been assigned. Please complete your payment to activate it.
            </p>
          </div>

          {error && !showSuccess ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : showSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-500">Activating your account...</p>
            </div>
          ) : clientSecret && stripePromise && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: { theme: 'stripe' } // customizable
              }}
            >
              <CheckoutForm amount={amount || 0} onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
