import { NextRequest } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { signToken, comparePassword, DEV_MODE, timingSafeStringEqual } from '@/lib/auth';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const { email: rawEmail, password } = await req.json();
        const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';

        if (!email || !password) {
            return Response.json({ error: 'Email and password required' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(`login:${ip}:${email.toLowerCase()}`, 10, 15 * 60 * 1000)) {
            return Response.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
        }

        // Development mode — bypass database for demo. DEV_MODE itself is
        // forced false in production regardless of env (see lib/auth.ts),
        // so this branch is dead code on any real deployment.
        if (DEV_MODE && email === 'admin@cancan.com' && timingSafeStringEqual(password, 'admin123')) {
            const token = signToken({ email: 'admin@cancan.com', role: 'super_admin', type: 'admin' });
            return Response.json({
                token,
                user: {
                    id: 'dev-admin-1',
                    email: 'admin@cancan.com',
                    role: 'super_admin',
                    last_login: new Date().toISOString(),
                },
            });
        }

        // Production-safe ENV-based Super Admin (trim env to avoid accidental spaces in .env)
        const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
        const envAdminPassword = process.env.ADMIN_PASSWORD;

        if (
            envAdminEmail &&
            envAdminPassword &&
            email.toLowerCase() === envAdminEmail.toLowerCase() &&
            timingSafeStringEqual(password, envAdminPassword)
        ) {
            const token = signToken({ email: envAdminEmail, role: 'super_admin', type: 'admin' });
            return Response.json({
                token,
                user: {
                    id: 'env-admin',
                    email: envAdminEmail,
                    role: 'super_admin',
                    last_login: new Date().toISOString(),
                },
            });
        }

        // Fetch admin user from Supabase
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (error || !admin) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await comparePassword(password, admin.password);
        if (!isValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Update last login
        await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.id);

        // Generate JWT token
        const token = signToken({
            id: admin.id,
            email: admin.email,
            role: admin.role,
            type: 'admin',
        });

        return Response.json({
            token,
            user: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                last_login: admin.last_login,
            },
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

