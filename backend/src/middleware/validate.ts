import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			});
			next();
		} catch (error) {
			next(error);
		}
	};
};
