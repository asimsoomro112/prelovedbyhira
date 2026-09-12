import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authenticate";
import { AppError } from "./errorHandler";

export const authorize = (...roles: string[]) => {
	return (req: AuthRequest, _res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return next(new AppError("Unauthorized to access this resource", 403));
		}
		next();
	};
};
