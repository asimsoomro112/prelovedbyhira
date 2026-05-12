import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase.config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("[AUTH ERROR] Missing or invalid Authorization header");
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user from Firestore to verify role and status
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      console.error(`[AUTH ERROR] User document not found in Firestore for UID: ${decodedToken.uid}`);
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!userDoc.data()?.isActive) {
      console.error(`[AUTH ERROR] User account is deactivated for UID: ${decodedToken.uid}`);
      res.status(401).json({ error: 'Account deactivated' });
      return;
    }

    const userData = userDoc.data()!;
    req.user = { 
      id: decodedToken.uid, 
      email: decodedToken.email!, 
      role: userData.role 
    };
    next();
  } catch (error: any) {
    console.error("[AUTH ERROR] Token verification failed:", error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        req.user = { 
          id: decodedToken.uid, 
          email: decodedToken.email!, 
          role: userDoc.data()?.role 
        };
      }
    }
  } catch {
    // Token invalid — continue without auth
  }
  next();
};
