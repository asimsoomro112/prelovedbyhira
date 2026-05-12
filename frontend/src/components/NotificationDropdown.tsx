"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  Clock, 
  ShoppingBag, 
  ShieldCheck, 
  AlertCircle,
  X,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All caught up! ✨");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <ShoppingBag className="w-4 h-4" />;
      case 'VERIFICATION': return <ShieldCheck className="w-4 h-4" />;
      case 'DISPUTE': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'ORDER': return 'bg-blue-500/10 text-blue-500';
      case 'VERIFICATION': return 'bg-emerald-500/10 text-emerald-500';
      case 'DISPUTE': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gold-400/10 text-gold-400';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center relative rounded-xl hover:bg-white/5 transition-all group"
      >
        <Bell className={`w-6 h-6 transition-all ${isOpen ? 'text-gold-400' : 'text-gray-400 group-hover:text-gold-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-dark-900 shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[360px] bg-white dark:bg-dark-900 rounded-[32px] shadow-2xl border border-gold-400/10 z-[110] overflow-hidden"
            >
              <div className="p-6 border-b border-gold-400/10 flex items-center justify-between bg-cream-50 dark:bg-dark-800/50">
                 <div>
                    <h3 className="text-lg font-display font-bold">Notifications</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Neural Alert System</p>
                 </div>
                 {unreadCount > 0 && (
                   <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-gold-400 hover:text-gold-600 transition-all uppercase tracking-widest flex items-center gap-1"
                   >
                     <Check className="w-3 h-3" /> Mark All Read
                   </button>
                 )}
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-none">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gold-400/5 rounded-full flex items-center justify-center mx-auto text-gold-400/20">
                      <Bell className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Your vault is quiet for now.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gold-400/5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-5 flex gap-4 transition-all hover:bg-gold-400/5 relative ${!n.isRead ? 'bg-gold-400/[0.02]' : ''}`}
                        onClick={() => !n.isRead && markAsRead(n.id)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColor(n.type)}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                             <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-dark-900 dark:text-white' : 'text-gray-500'}`}>{n.title}</p>
                             <span className="text-[8px] text-gray-400 font-bold uppercase shrink-0">
                                {new Date(n.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="absolute right-4 bottom-5 w-1.5 h-1.5 bg-gold-400 rounded-full shadow-gold" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-cream-50 dark:bg-dark-800/50 border-t border-gold-400/10">
                 <button className="w-full py-3 text-[10px] font-bold text-gray-400 hover:text-gold-400 transition-all uppercase tracking-widest">
                   View All Alerts
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
