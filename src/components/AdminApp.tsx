import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SETTINGS } from "@/lib/config";
import { Loader2, LayoutDashboard, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";

const BACKEND_URL = SETTINGS.BACKEND_URL;

type UserStatus = {
  id: number;
  name: string | null;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  subscription_plan: string | null;
  subscription_amount: number | null;
};

export default function AdminApp() {
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState<number | null>(null);
  const [amount, setAmount] = useState('');

  const adminId = localStorage.getItem('userId'); // Reusing simple auth

  useEffect(() => {
    if (!adminId) {
      window.location.href = '/register';
      return;
    }
    fetchUsers();
  }, [adminId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { 'x-user-id': adminId as string }
      });
      if (!res.ok) throw new Error('Failed to fetch users (are you logged in?)');
      setUsers(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const assignSubscription = async (userId: number) => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 100) return alert('Enter a valid amount (minimum $1.00)');

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId as string,
        },
        body: JSON.stringify({ amountCents: cents }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setAssigning(null);
      setAmount('');
      fetchUsers();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const cancelSubscription = async (userId: number) => {
    if (!confirm('Cancel this subscription?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/subscription`, {
        method: 'DELETE',
        headers: { 'x-user-id': adminId as string },
      });
      if (!res.ok) throw new Error('Failed to cancel subscription');
      fetchUsers();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-indigo-600" />
              Admin Portal
            </h1>
            <p className="text-slate-500 mt-2">Manage users and assign custom subscription plans.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/register?next=/admin'}>Login</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.location.href = '/register?next=/admin'}>Register New User</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => window.location.href = '/dashboard'}>Dashboard</Button>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>Back to Home</Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>Assign "incomplete" subscriptions to force users to pay via the modal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-slate-800">
                    <th className="p-3 font-semibold">User</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-white">{user.name || 'No Name'}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${user.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            user.subscription_status === 'incomplete' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                              user.subscription_status === 'canceled' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400' :
                                'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {user.subscription_status === 'none' ? 'No Sub' : user.subscription_status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {user.subscription_amount ? `$${(user.subscription_amount / 100).toFixed(2)}/mo` : '—'}
                      </td>
                      <td className="p-3 text-right">
                        {assigning === user.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-slate-500">$</span>
                            <input
                              type="number"
                              className="w-20 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="49"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              autoFocus
                            />
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => assignSubscription(user.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> OK
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setAssigning(null); setAmount(''); }}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setAssigning(user.id)} disabled={loading}>
                              {user.subscription_status === 'active' ? 'Reassign' : 'Assign'}
                            </Button>
                            {user.stripe_subscription_id && (
                              <Button size="sm" variant="destructive" onClick={() => cancelSubscription(user.id)} disabled={loading}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No users found. Go register one first!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
