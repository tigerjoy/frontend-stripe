import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CheckCircle2, AlertCircle, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { SETTINGS } from "@/lib/config";

// Make sure to call `loadStripe` outside of a component's render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "YOUR_PUBLISHABLE_STRIPE_KEY");

const BACKEND_URL = SETTINGS.BACKEND_URL;

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "succeeded" | "failed">("idle");

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setPaymentStatus("succeeded");
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setPaymentStatus("processing");
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setPaymentStatus("failed");
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setPaymentStatus("failed");
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setPaymentStatus("processing");

    // Setting redirect to 'if_required' prevents an automatic page reload
    // for payment methods that don't require an explicit redirect (e.g. standard cards).
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app2`,
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
      setMessage("Payment succeeded!");
    } else {
      setPaymentStatus("failed");
      setMessage("Something went wrong.");
    }

    setIsLoading(false);
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

  if (paymentStatus === "succeeded") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-tr from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/40 border-2 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>
        <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Payment Successful!</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-balance">
          Thank you for your purchase of <span className="font-semibold text-slate-900 dark:text-slate-50">{formattedAmount}</span>. A receipt has been sent to your email.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          Make Another Payment
        </Button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col space-y-6">
      <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
        <Accordion type="single" collapsible defaultValue="summary">
          <AccordionItem value="summary" className="border-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-sm">Order Summary</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-0">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Premium Plan</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100">Pro</Badge>
                </div>
                <span className="text-sm font-medium">{formattedAmount}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formattedAmount}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-500" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Secure Payment Details</h4>
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
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border-0 transition-all duration-300 sm:hover:scale-[1.02] active:scale-[0.98]"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formattedAmount}`
        )}
      </Button>
      <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1 mt-2">
        <ShieldCheck className="w-3 h-3" />
        Payments are secure and encrypted
      </p>
    </form>
  );
}

export default function ElementsApp() {
  const [clientSecret, setClientSecret] = useState("");
  const amount = 1500; // Define amount here

  useEffect(() => {
    fetch(`${BACKEND_URL}/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }), // $15.00
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Error creating payment intent:", err));
  }, [amount]);

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: '#6366f1', /* indigo-500 */
      colorBackground: 'transparent',
      colorText: '#334155', /* slate-700 */
      colorDanger: '#ef4444', /* red-500 */
      fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      },
      '.Input:focus': {
        border: '1px solid #6366f1',
        boxShadow: '0 0 0 1px #6366f1',
      },
      '.Label': {
        fontWeight: '500',
        color: '#475569',
      }
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg">
        <Card className="w-full shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Complete your checkout</CardTitle>
            <CardDescription className="text-base text-slate-500 dark:text-slate-400 mt-1">
              Secure in-app payment via Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <div className="animate-in fade-in duration-500">
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm amount={amount} />
                </Elements>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                <p className="font-medium animate-pulse">Initializing secure checkout...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
