"use client";

import { useState } from "react";
import { Bell, Check, ShoppingBag, Truck, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 relative hover:bg-gold-400/10 rounded-full transition-all"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-900">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-white dark:bg-dark-900 rounded-[32px] shadow-card border border-gold-400/10 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gold-400/10 flex items-center justify-between">
                <h3 className="font-display font-bold">Notifications</h3>
                <button 
                  onClick={() => markAllRead()}
                  className="text-[10px] font-bold text-gold-400 uppercase tracking-widest hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 space-y-2">
                    <Bell className="w-8 h-8 mx-auto opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No new alerts</p>
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <NotificationItem key={n.id} notification={n} onClose={() => setIsOpen(false)} />
                  ))
                )}
              </div>

              <div className="p-4 bg-cream-50 dark:bg-dark-950 text-center">
                <Link href="/customer/notifications" className="text-xs font-bold text-gray-500 hover:text-gold-400 transition-colors">
                  View All Activity
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification, onClose }: any) {
  const Icon = getIcon(notification.type);

  return (
    <Link 
      href={getLink(notification)} 
      onClick={onClose}
      className={`block p-5 hover:bg-gold-400/5 transition-all border-b border-gold-400/5 last:border-0 ${!notification.isRead ? "bg-gold-400/10" : ""}`}
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-dark-800 shadow-soft flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-gold-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-dark-900 dark:text-cream-50 leading-tight">{notification.title}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </Link>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'ORDER': return ShoppingBag;
    case 'SHIPPING': return Truck;
    case 'DISPUTE': return AlertCircle;
    case 'PAYOUT': return Check;
    default: return Info;
  }
}

function getLink(n: any) {
  if (n.orderId) return `/customer/orders/${n.orderId}`;
  if (n.type === 'PAYOUT') return `/seller/payouts`;
  return '/';
}
