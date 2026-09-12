import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Reset Password",
	description:
		"Forgot your password? Reset it securely with a 6-digit code sent to your email.",
	robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
