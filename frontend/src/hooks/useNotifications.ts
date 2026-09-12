"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";

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
				old?.map((n: any) => ({ ...n, isRead: true })),
			);
		},
	});

	useEffect(() => {
		if (token) {
			const { connectSocket } = require("@/lib/socket");
			connectSocket(token);
			const socket = getSocket(token);

			socket?.on("notification", (newNotification: any) => {
				queryClient.setQueryData(["notifications"], (old: any) => [
					newNotification,
					...(old || []),
				]);
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
