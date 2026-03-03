import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CancelPage() {
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/10 dark:bg-red-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 dark:bg-orange-600/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-400/20 dark:bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-tr from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/40 border-2 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-xl shadow-red-500/20">
            <XCircle className="w-12 h-12" />
          </div>
        </div>

        <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-red-900 to-slate-900 dark:from-red-300 dark:to-white">
          Payment Cancelled
        </h3>

        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-balance">
          Your payment was cancelled or failed. No charges were made to your account.
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
