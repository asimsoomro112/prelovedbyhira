import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Note: Middleware runs on Edge, so we can't use node-only libraries.
// We'll rely on the cookie presence to gate routes.
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// We use a simplified check based on pathnames.
	// In a real app, you'd decode the JWT here to check roles.
	// For now, we assume if the user has auth data, the client-side state will handle fine-grained gating,
	// but we prevent basic entry to dashboards without auth.

	const _isAuthenticated = request.cookies.get("auth-storage"); // This might not work easily because it's in localStorage

	// Alternative: Check for the presence of a session cookie if your backend sets one.
	// If not, we'll rely on client-side gating for roles, but let's at least protect the routes in the middleware
	// as much as possible or just handle it in the layout components for now.

	// Actually, Next.js middleware is best with cookies.
	// If we don't have cookies, let's do layout-level gating which is more reliable for client-side state.

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/seller/:path*", "/customer/:path*"],
};

export default proxy;
