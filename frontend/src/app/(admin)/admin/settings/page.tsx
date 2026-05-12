"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Percent, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Bell, 
  Save,
  Lock,
  Eye,
  Database,
  Loader2
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    commissionRate: 20,
    maintenanceMode: false,
    sellerAutoVerify: false,
    minPayoutAmount: 5000,
    aiChatEnabled: true,
    emailNotifications: true,
    supportEmail: 'care@hira.pk'
  });

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => {
        setSettings(r.data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load platform core settings.");
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success("Platform Vault synchronized successfully! ✨");
    } catch (error) {
      toast.error("Failed to update platform settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
           <Loader2 className="w-12 h-12 text-gold-400 animate-spin mx-auto" />
           <p className="text-gold-400 font-display font-bold uppercase tracking-[0.3em]">Accessing Neural Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-4">
          <Settings className="w-10 h-10 text-gold-400" />
          Platform Vault Settings
        </h1>
        <p className="text-zinc-500 dark:text-gray-400">Control the neural core and business logic of PrelovedByHira.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ─── ECONOMIC ENGINE ──────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-100 dark:bg-zinc-900/50 border border-gold-400/20 rounded-3xl p-8 backdrop-blur-xl hover:border-gold-400/40 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center">
              <Percent className="w-6 h-6 text-gold-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Economic Engine</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-gray-400 mb-2">Platform Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({...settings, commissionRate: parseInt(e.target.value)})}
                  className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:border-gold-400 transition-colors outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-400 font-bold">%</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-gray-400 mb-2">Minimum Payout (PKR)</label>
              <input 
                type="number" 
                value={settings.minPayoutAmount}
                onChange={(e) => setSettings({...settings, minPayoutAmount: parseInt(e.target.value)})}
                className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:border-gold-400 transition-colors outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* ─── NEURAL AI CONFIG ─────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-100 dark:bg-zinc-900/50 border border-gold-400/20 rounded-3xl p-8 backdrop-blur-xl hover:border-gold-400/40 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-gold-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Neural Intelligence</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-2xl border border-zinc-200 dark:border-white/5">
              <div>
                <p className="text-zinc-900 dark:text-white font-medium">Hira AI Concierge</p>
                <p className="text-xs text-zinc-500 dark:text-gray-500">Enable real-time customer assistance</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, aiChatEnabled: !settings.aiChatEnabled})}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.aiChatEnabled ? 'bg-gold-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.aiChatEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-2xl border border-zinc-200 dark:border-white/5">
              <div>
                <p className="text-zinc-900 dark:text-white font-medium">Auto-Verify Sellers</p>
                <p className="text-xs text-zinc-500 dark:text-gray-500">AI-powered document verification</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, sellerAutoVerify: !settings.sellerAutoVerify})}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.sellerAutoVerify ? 'bg-gold-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.sellerAutoVerify ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── SYSTEM STATUS ────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-100 dark:bg-zinc-900/50 border border-gold-400/20 rounded-3xl p-8 backdrop-blur-xl hover:border-gold-400/40 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-400/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">System Security</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
              <div>
                <p className="text-red-400 font-medium">Maintenance Mode</p>
                <p className="text-xs text-zinc-500 dark:text-gray-500">Lock the storefront for updates</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <button className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Database className="w-4 h-4" />
              Backup Database Now
            </button>
          </div>
        </motion.div>

        {/* ─── GLOBALIZATION ────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-100 dark:bg-zinc-900/50 border border-gold-400/20 rounded-3xl p-8 backdrop-blur-xl hover:border-gold-400/40 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Globalization</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-gray-400">Base Currency</span>
              <span className="text-zinc-900 dark:text-white font-bold">PKR (₨)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-gray-400">Default Region</span>
              <span className="text-zinc-900 dark:text-white">Pakistan</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 dark:text-gray-400 font-medium">Support Contact Email</label>
              <input 
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-gold-400 transition-colors outline-none"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── SAVE BUTTON ──────────────────────────────── */}
      <div className="mt-12 flex justify-end pb-12">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gold-500 hover:bg-gold-400 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-black px-10 py-4 rounded-2xl font-bold shadow-gold transition-all flex items-center gap-3 transform hover:-translate-y-1"
        >
          {isSaving ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Save className="w-5 h-5" />
            </motion.div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? "Synchronizing Vault..." : "Save Platform Settings"}
        </button>
      </div>
    </div>
  );
}
