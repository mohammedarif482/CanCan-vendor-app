import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Development mode - bypass database for demo
    if (process.env.NODE_ENV === 'development' && decoded.email === 'admin@cancan.com') {
      req.user = {
        id: 'dev-admin-1',
        email: 'admin@cancan.com',
        role: 'super_admin',
        last_login: new Date().toISOString()
      };
      return next();
    }

    // Fetch admin user from database
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', decoded.email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = admin;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};