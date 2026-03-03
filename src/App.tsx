import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CheckoutApp from "./components/CheckoutApp";
import ElementsApp from "./components/ElementsApp";
import SuccessPage from "./components/SuccessPage";
import CancelPage from "./components/CancelPage";
import RegisterApp from "./components/RegisterApp";
import PricingApp from "./components/PricingApp";
import DashboardApp from "./components/DashboardApp";
import EmbeddedSubscriptionApp from "./components/EmbeddedSubscriptionApp";
import './App.css';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Wallet, LayoutDashboard } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-5xl text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Stripe Integration Demo
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Explore complete end-to-end payment flows. From standard hosted checkouts to fully customized in-app experiences.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* App 1 Card */}
        <Link to="/app1" className="block group">
          <Card className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-slate-900/80">
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Wallet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-2xl mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">App 1</CardTitle>
              <CardDescription className="text-base text-balance">
                Stripe Hosted Checkout Page flow with simple redirect.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* App 2 Card */}
        <Link to="/app2" className="block group">
          <Card className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-slate-900/80">
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">App 2</CardTitle>
              <CardDescription className="text-base text-balance">
                In-App Custom Form using Stripe Elements. Seamless checkout.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* App 3 Card */}
        <Link to="/register?next=/app3" className="block group">
          <Card className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-slate-900/80">
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">App 3</CardTitle>
              <CardDescription className="text-base text-balance">
                Plan Purchase with Embedded Payment Element.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Register/Dashboard Card */}
        <Link to="/register" className="block group">
          <Card className="h-full relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-emerald-200/50 dark:border-emerald-800/50 shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
            {/* Subtle highlight inside the card for the primary CTA */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 dark:from-emerald-400/10 dark:to-teal-500/10 pointer-events-none" />
            <CardHeader className="text-center pt-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors">Minimal Setup</CardTitle>
              <CardDescription className="text-base text-balance">
                Full Dashboard-First Flow. Manage customers and recurring billing.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app1" element={<CheckoutApp />} />
        <Route path="/app1/success" element={<SuccessPage />} />
        <Route path="/app1/cancel" element={<CancelPage />} />
        <Route path="/app2" element={<ElementsApp />} />
        <Route path="/app3" element={<EmbeddedSubscriptionApp />} />
        <Route path="/register" element={<RegisterApp />} />
        <Route path="/pricing" element={<PricingApp />} />
        <Route path="/dashboard" element={<DashboardApp />} />
      </Routes>
    </Router>
  );
}

export default App;
