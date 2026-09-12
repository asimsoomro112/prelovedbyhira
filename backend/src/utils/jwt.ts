import jwt from "jsonwebtoken";

export const generateAccessToken = (user: {
	id: string;
	email: string;
	role: string;
}) => {
	return jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		process.env.JWT_SECRET!,
		{ expiresIn: (process.env.JWT_ACCESS_EXPIRY || "15m") as any },
	);
};

export const generateRefreshToken = (user: {
	id: string;
	email: string;
	role: string;
}) => {
	return jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		process.env.JWT_REFRESH_SECRET!,
		{ expiresIn: (process.env.JWT_REFRESH_EXPIRY || "7d") as any },
	);
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
		id: string;
		email: string;
		role: string;
	};
};
