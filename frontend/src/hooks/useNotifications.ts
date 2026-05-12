"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { toast } from "sonner";

export function useNotifications() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/users/notifications");
      return data;
    },
    enabled: !!accessToken,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      return await api.put("/users/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (old: any) => 
        old?.map((n: any) => ({ ...n, isRead: true }))
      );
    },
  });

  useEffect(() => {
    if (accessToken) {
      const socket = getSocket(accessToken);
      
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
  }, [accessToken, queryClient]);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAllRead: markAllRead.mutate,
  };
}
