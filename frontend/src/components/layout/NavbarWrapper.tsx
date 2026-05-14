"use client";

import { usePathname } from "next/navigation";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import BottomNavbar from "./BottomNavbar";

export default function NavbarWrapper({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide main nav on dashboard routes (they have their own nav)
  const hideNavRoutes = ['/seller', '/admin'];
  const hideBottomNavRoutes = ['/product/', '/checkout'];
  
  const shouldHideAll = hideNavRoutes.some(route => pathname.startsWith(route));
  const shouldHideBottom = hideBottomNavRoutes.some(route => pathname.startsWith(route));

  if (shouldHideAll) return <>{children}</>;

  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
      {/* ✅ Mobile: 72px top (14px header) + 64px bottom (bottom nav)
          Desktop: 100px top (desktop nav) + 40px bottom */}
      <div className="pt-[72px] lg:pt-[100px] pb-[80px] lg:pb-10">
        {children}
      </div>
      {!shouldHideBottom && <BottomNavbar />}
    </>
  );
}
