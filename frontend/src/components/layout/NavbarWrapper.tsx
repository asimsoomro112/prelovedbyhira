"use client";

import { usePathname } from "next/navigation";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import BottomNavbar from "./BottomNavbar";

export default function NavbarWrapper({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide main nav on dashboard routes
  const hideNavRoutes = ['/seller', '/admin'];
  const shouldHide = hideNavRoutes.some(route => pathname.startsWith(route));

  if (shouldHide) return <>{children}</>;

  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
      <div className="pt-[80px] lg:pt-[100px] pb-[90px] lg:pb-10">
        {children}
      </div>
      <BottomNavbar />
    </>
  );
}
