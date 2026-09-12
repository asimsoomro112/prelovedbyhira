import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: string;
	};
}

export const authenticate = (
	req: AuthRequest,
	_res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return next(new AppError("Authentication required", 401));
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
			id: string;
			email: string;
			role: string;
		};
		req.user = decoded;
		next();
	} catch (_error) {
		return next(new AppError("Invalid or expired token", 401));
	}
};
