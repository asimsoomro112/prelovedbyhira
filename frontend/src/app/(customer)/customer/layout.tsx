"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function CustomerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow hydration of persisted state
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role === 'SELLER') {
        // Optional: If a seller somehow gets here, maybe they should be fine?
        // But for now, just ensure they are logged in.
        setIsChecking(false);
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, user]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-mesh">
        <Loader2 className="w-12 h-12 text-gold-400 animate-spin" />
        <p className="font-display text-gold-400 font-bold uppercase tracking-[0.2em] text-xs">Verifying Credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}
