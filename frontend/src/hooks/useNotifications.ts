"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { toast } from "sonner";

export function useNotifications() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
    enabled: !!token,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      return await api.put("/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (old: any) => 
        old?.map((n: any) => ({ ...n, isRead: true }))
      );
    },
  });

  useEffect(() => {
    if (token) {
      const socket = getSocket(token);
      
      socket?.on("notification", (newNotification) => {
        queryClient.setQueryData(["notifications"], (old: any) => [newNotification, ...(old || [])]);
        toast(newNotification.title, {
          description: newNotification.message,
        });
      });

      return () => {
        socket?.off("notification");
      };
    }
  }, [token, queryClient]);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAllRead: markAllRead.mutate,
  };
}
