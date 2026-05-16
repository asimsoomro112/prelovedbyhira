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
  Package,
  MessageCircle
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 90000); // Polling every 90 seconds (optimized)
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const { user, token } = useAuthStore.getState();
    if (!user || !token) return;

    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error: any) {
      // Only log genuine server errors, ignore network issues (like server restarts) and 401s
      const isNetworkError = error.message === 'Network Error' || error.code === 'ERR_NETWORK';
      if (error.response?.status !== 401 && !isNetworkError) {
        console.error("Failed to fetch notifications:", error.message);
      }
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

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) markAsRead(n.id);
    
    // Custom actions based on type
    if (n.type === 'SUPPORT_REPLY' || n.type === 'SUPPORT_MESSAGE') {
      if (user?.role === 'ADMIN') {
        router.push('/admin/support');
      } else {
        useChatStore.getState().openChat();
      }
      setIsOpen(false);
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
      case 'SUPPORT_REPLY': 
      case 'SUPPORT_MESSAGE': return <MessageCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'ORDER': return 'bg-blue-500/10 text-blue-500';
      case 'VERIFICATION': return 'bg-emerald-500/10 text-emerald-500';
      case 'DISPUTE': return 'bg-red-500/10 text-red-500';
      case 'SUPPORT_REPLY':
      case 'SUPPORT_MESSAGE': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-gold-400/10 text-gold-400';
    }
  };

  return (
    <div className="relative">
      {/* ✅ Bell button — 48×48 min tap target */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center relative rounded-xl hover:bg-white/5 active:scale-90 transition-all group min-w-[48px] min-h-[48px]"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className={`w-5 h-5 transition-all ${isOpen ? 'text-gold-400' : 'text-gray-400 group-hover:text-gold-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-900 shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* ✅ Backdrop — full screen, dismisses on tap */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/30 md:bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />

            {/* ✅ Mobile: full-screen slide-up | Desktop: positioned dropdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 md:inset-auto md:absolute md:right-0 md:mt-4 md:w-[380px] bg-white dark:bg-dark-900 md:rounded-[28px] shadow-2xl md:border md:border-gold-400/10 z-[110] overflow-hidden flex flex-col md:max-h-[500px]"
              role="dialog"
              aria-modal="true"
              aria-label="Notifications"
            >
              {/* Header */}
              <div className="p-5 border-b border-gold-400/10 flex items-center justify-between bg-cream-50 dark:bg-dark-800/50 shrink-0">
                 <div>
                    <h3 className="text-lg font-display font-bold">Notifications</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Neural Alert System</p>
                 </div>
                 <div className="flex items-center gap-2">
                   {unreadCount > 0 && (
                     <button 
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-gold-400 hover:text-gold-600 transition-all uppercase tracking-widest flex items-center gap-1 min-h-[44px] px-3"
                     >
                       <Check className="w-3 h-3" /> Mark All
                     </button>
                   )}
                   {/* ✅ Close button — visible on mobile */}
                   <button 
                     onClick={() => setIsOpen(false)} 
                     className="md:hidden w-10 h-10 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center"
                     aria-label="Close notifications"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>
              </div>

              {/* ✅ Scrollable content */}
              <div className="flex-1 overflow-y-auto scrollbar-none">
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
                      <button 
                        key={n.id} 
                        className={`w-full p-4 flex gap-4 transition-all hover:bg-gold-400/5 active:bg-gold-400/10 relative text-left min-h-[64px] ${!n.isRead ? 'bg-gold-400/[0.02]' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColor(n.type)}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                             <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-dark-900 dark:text-white' : 'text-gray-500'}`}>{n.title}</p>
                             <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">
                                {new Date(n.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="absolute right-4 bottom-4 w-2 h-2 bg-gold-400 rounded-full shadow-gold" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ✅ Footer action */}
              <div className="p-4 bg-cream-50 dark:bg-dark-800/50 border-t border-gold-400/10 shrink-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                 <button className="w-full py-3 text-[10px] font-bold text-gray-400 hover:text-gold-400 transition-all uppercase tracking-widest min-h-[44px]">
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
