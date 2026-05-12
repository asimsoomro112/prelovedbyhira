'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Users, ShoppingBag, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    api.get('/admin/stats')
      .then((r: any) => setStats(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false)); 
  }, []);

  if (isLoading) return <div className="min-h-screen pt-28 flex items-center justify-center"><div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-display font-bold">Analytics & Reports</h1>
          <button className="px-6 py-3 border-2 border-gold-400 text-gold-400 rounded-pill font-bold flex items-center gap-2 hover:bg-gold-400 hover:text-white transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <ReportCard icon={<TrendingUp />} label="Total Volume" value={`Rs. ${stats?.totalSales?.toLocaleString() || 0}`} change="+14% vs last month" />
           <ReportCard icon={<ShoppingBag />} label="Total Orders" value={stats?.totalOrders || 0} change="+8% vs last month" />
           <ReportCard icon={<Users />} label="Active Users" value={stats?.totalUsers || 0} change="+22% vs last month" />
           <ReportCard icon={<BarChart3 />} label="Platform Fee" value={`Rs. ${stats?.totalCommission?.toLocaleString() || 0}`} change="20% standard rate" />
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 p-10 shadow-card">
           <h2 className="text-2xl font-display font-bold mb-8">Platform Growth</h2>
           <div className="h-80 bg-gold-400/5 rounded-[32px] flex items-center justify-center border border-dashed border-gold-400/20">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Interactive Chart Visualization</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ icon, label, value, change }: any) {
  return (
    <div className="bg-white dark:bg-dark-900 p-8 rounded-[32px] border border-gold-400/10 shadow-soft">
      <div className="w-12 h-12 bg-gold-400/10 text-gold-400 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-1">{label}</h3>
      <p className="text-3xl font-display font-bold mb-2">{value}</p>
      <p className="text-xs text-emerald-500 font-bold">{change}</p>
    </div>
  );
}
