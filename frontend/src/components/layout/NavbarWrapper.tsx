"use client";

import { usePathname } from "next/navigation";
import BottomNavbar from "./BottomNavbar";
import DesktopNavbar from "./DesktopNavbar";
import { Footer } from "./Footer";
import MobileNavbar from "./MobileNavbar";

export default function NavbarWrapper({
	children,
}: {
	children?: React.ReactNode;
}) {
	const pathname = usePathname();

	// Hide main nav on dashboard routes (they have their own nav)
	const hideNavRoutes = ["/seller", "/admin"];
	const hideBottomNavRoutes = ["/product/", "/checkout"];

	const shouldHideAll = hideNavRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const shouldHideBottom = hideBottomNavRoutes.some((route) =>
		pathname.startsWith(route),
	);

	if (shouldHideAll) return <>{children}</>;

	return (
		<>
			<DesktopNavbar />
			<MobileNavbar />
			{/* ✅ Mobile: 72px top (14px header) + 64px bottom (bottom nav)
          Desktop: 100px top (desktop nav) + 40px bottom */}
			<div className="pt-[72px] lg:pt-[100px]">
				{children}
				<Footer />
			</div>
			{!shouldHideBottom && <BottomNavbar />}
		</>
	);
}
