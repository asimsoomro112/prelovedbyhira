"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { io, Socket } from "socket.io-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const { accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (accessToken) {
      const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token: accessToken }
      });
      setSocket(s);
      return () => { s.disconnect(); };
    }
  }, [accessToken]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
