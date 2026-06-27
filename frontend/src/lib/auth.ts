import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { supabaseAdmin as supabase } from './supabase';
import { NextRequest } from 'next/server';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Checked lazily (inside signToken/verifyToken), NOT at module import time —
// `next build` evaluates this module while collecting page data with
// NODE_ENV=production already set, before any real runtime env vars are
// available, so a module-level throw here would fail the build itself even
// when the real secret is correctly supplied later at deploy time.
function requireJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (IS_PRODUCTION && !secret) {
        throw new Error('JWT_SECRET must be set in production — refusing to sign/verify with the dev fallback secret.');
    }
    return secret || 'cancan-dev-jwt-secret';
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// DEV_MODE / dev credentials must never be reachable in a production deploy,
// regardless of what's left set in env — this is a hard kill-switch, not
// just an env flag, since a forgotten DEV_MODE=true on a prod host would
// otherwise grant a publicly-known super_admin login.
export const DEV_MODE = process.env.DEV_MODE === 'true' && !IS_PRODUCTION;

function timingSafeStringEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) {
        // Still run timingSafeEqual against a same-length buffer so this
        // branch doesn't return measurably faster than a real comparison.
        crypto.timingSafeEqual(aBuf, aBuf);
        return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
}

export { timingSafeStringEqual };

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    type: 'admin';
    last_login?: string;
}

export interface VendorUser {
    vendorId: string;
    phone: string;
    businessName?: string;
    type: 'vendor';
}

export type AuthUser = AdminUser | VendorUser;

// Generate JWT token
export function signToken(payload: Record<string, unknown>): string {
    return jwt.sign(payload, requireJwtSecret(), { expiresIn: JWT_EXPIRES_IN as unknown as number });
}

// Verify JWT token
export function verifyToken(token: string): Record<string, unknown> | null {
    try {
        return jwt.verify(token, requireJwtSecret()) as Record<string, unknown>;
    } catch {
        return null;
    }
}

// Extract bearer token from request
export function extractToken(req: NextRequest): string | null {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
}

// Authenticate admin from request — returns admin user or null
export async function authenticateAdmin(req: NextRequest): Promise<AdminUser | null> {
    const token = extractToken(req);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'admin') return null;

    // Dev mode bypass
    if (DEV_MODE && decoded.email === 'admin@cancan.com') {
        return {
            id: 'dev-admin-1',
            email: 'admin@cancan.com',
            role: 'super_admin',
            type: 'admin',
            last_login: new Date().toISOString(),
        };
    }

    // ENV-based super admin bypass (for production without DB admin_users)
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
    if (
        envAdminEmail &&
        typeof decoded.email === 'string' &&
        decoded.email.toLowerCase() === envAdminEmail.toLowerCase()
    ) {
        return {
            id: 'env-admin',
            email: envAdminEmail,
            role: 'super_admin',
            type: 'admin',
            last_login: new Date().toISOString(),
        };
    }

    // Fetch from Supabase
    const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', decoded.id)
        .eq('is_active', true)
        .single();

    if (error || !admin) return null;

    return { ...admin, type: 'admin' };
}

// Authenticate vendor from request
export async function authenticateVendor(req: NextRequest): Promise<VendorUser | null> {
    const token = extractToken(req);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'vendor') return null;

    // Dev mode bypass
    if (DEV_MODE && decoded.phone === process.env.DEV_PHONE) {
        return {
            vendorId: 'dev-vendor-123',
            phone: decoded.phone as string,
            type: 'vendor',
        };
    }

    // Fetch from Supabase
    const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', decoded.vendorId)
        .eq('is_active', true)
        .single();

    if (error || !vendor) return null;

    return {
        vendorId: vendor.id,
        phone: vendor.phone,
        businessName: vendor.business_name,
        type: 'vendor',
    };
}

/**
 * Authenticate a vendor using their own Supabase auth session token (what
 * the Flutter app already holds via SupabaseConfig.client.auth.currentSession),
 * rather than the custom JWT issued by signToken(). The Flutter app never
 * goes through /api/auth — it authenticates straight against Supabase
 * (phone OTP), so vendor-facing API routes that need to verify "is this
 * the vendor who owns this resource" must verify that Supabase session
 * directly instead of expecting a custom JWT.
 */
export async function authenticateVendorBySupabaseToken(req: NextRequest): Promise<VendorUser | null> {
    const token = extractToken(req);
    if (!token) return null;

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return null;

    const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', userData.user.id)
        .eq('is_active', true)
        .single();

    if (error || !vendor) return null;

    return {
        vendorId: vendor.id,
        phone: vendor.phone,
        businessName: vendor.business_name,
        type: 'vendor',
    };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Verify password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Unauthorized response helper
export function unauthorized(message = 'Unauthorized') {
    return Response.json({ error: message }, { status: 401 });
}

// Forbidden response helper
export function forbidden(message = 'Forbidden') {
    return Response.json({ error: message }, { status: 403 });
}
