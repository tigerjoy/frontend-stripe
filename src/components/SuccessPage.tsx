import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/10 dark:bg-green-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-tr from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/40 border-2 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Payment Successful!
        </h3>

        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-balance">
          Thank you for your purchase. A receipt has been sent to your email.
        </p>

        <div className="space-y-4 w-full">
          <p className="text-sm font-medium text-slate-400">Redirecting to home in {countdown} seconds...</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Go Home Now
          </Button>
        </div>
      </div>
    </div>
  );
}
