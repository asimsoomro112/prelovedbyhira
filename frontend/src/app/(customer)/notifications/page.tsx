"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, ShoppingBag, Heart, AlertTriangle, MessageSquare, Info } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.put("/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read.");
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'WISHLIST': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'DISPUTE': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-gold-400" />;
    }
  };

  const getBgStyle = (type: string, isRead: boolean) => {
    if (isRead) return "bg-white dark:bg-dark-900 border-gray-100 dark:border-dark-800 opacity-60";
    
    switch (type) {
      case 'ORDER': return "bg-blue-500/5 border-blue-500/20 shadow-soft";
      case 'WISHLIST': return "bg-rose-500/5 border-rose-500/20 shadow-soft";
      case 'DISPUTE': return "bg-red-500/5 border-red-500/20 shadow-soft";
      case 'MESSAGE': return "bg-emerald-500/5 border-emerald-500/20 shadow-soft";
      default: return "bg-gold-400/5 border-gold-400/20 shadow-soft";
    }
  };

  return (
    <div className="max-w-screen-md mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-gold-400" /> Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with your orders and wishlist.</p>
        </div>
        
        {notifications?.some((n: any) => !n.isRead) && (
          <button 
            onClick={() => markAllRead.mutate()}
            className="px-4 py-2 text-sm font-bold text-gold-400 hover:bg-gold-400/10 rounded-xl transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full mx-auto" /></div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10">
            <Bell className="w-12 h-12 text-gold-400/20 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold mb-2">All Caught Up!</h2>
            <p className="text-gray-500 text-sm">You have no new notifications.</p>
          </div>
        ) : (
          notifications?.map((notif: any) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[24px] border transition-all flex gap-5 items-start ${getBgStyle(notif.type, notif.isRead)}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-800 shadow-sm flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`font-bold ${notif.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-dark-900 dark:text-cream-50'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-gold-400 mt-2 shrink-0" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
