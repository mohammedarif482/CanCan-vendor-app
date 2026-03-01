'use client';

export default function PortalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const isFetchError = error.message?.toLowerCase().includes('fetch failed');
    const isAuthError = error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('unauthorized') || error.message?.toLowerCase().includes('token');
    const isSupabaseError = error.message?.toLowerCase().includes('supabase') || error.message?.toLowerCase().includes('postgrest') || error.message?.toLowerCase().includes('api key');

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontFamily: '"SF Mono", "Fira Code", Consolas, monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <div
                style={{
                    maxWidth: 800,
                    width: '100%',
                    border: '1px solid #334155',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <span style={{ fontSize: 28 }}>🛑</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
                            ADMIN PORTAL ERROR
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#fca5a5' }}>
                            A component in the admin portal crashed. Diagnostic details below.
                        </p>
                    </div>
                </div>

                <div style={{ padding: 24, background: '#1e293b' }}>
                    {/* Error */}
                    <div
                        style={{
                            borderLeft: '4px solid #ef4444',
                            padding: 16,
                            background: '#0f172a',
                            borderRadius: 8,
                            marginBottom: 20,
                        }}
                    >
                        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                            Fatal Exception
                        </p>
                        <p style={{ margin: 0, fontSize: 15, color: '#f87171', fontWeight: 700, wordBreak: 'break-word' }}>
                            {error.name}: {error.message}
                        </p>
                        {error.digest && (
                            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569' }}>digest: {error.digest}</p>
                        )}
                    </div>

                    {/* Smart Diagnostics */}
                    {isFetchError && (
                        <div style={{ background: '#422006', border: '1px solid #a16207', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: '#fef08a', marginBottom: 6 }}>💡 Fetch Failure Detected</p>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#fde68a', lineHeight: 1.8 }}>
                                <li>Check if <code>NEXT_PUBLIC_SUPABASE_URL</code> is set correctly in <code>.env.local</code></li>
                                <li>Verify the Supabase project is online at your dashboard URL</li>
                                <li>Check your network connection and any VPN/proxy settings</li>
                                <li>Open browser DevTools → Network tab for the exact failing request</li>
                            </ul>
                        </div>
                    )}

                    {isAuthError && (
                        <div style={{ background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: '#a5b4fc', marginBottom: 6 }}>🔐 Authentication Error</p>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#c7d2fe', lineHeight: 1.8 }}>
                                <li>Your session token may have expired — try logging out and back in</li>
                                <li>Check <code>JWT_SECRET</code> in <code>.env.local</code></li>
                                <li>Click "Hard Reset" below to clear all session data</li>
                            </ul>
                        </div>
                    )}

                    {isSupabaseError && (
                        <div style={{ background: '#042f2e', border: '1px solid #14b8a6', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: '#5eead4', marginBottom: 6 }}>🗄️ Supabase / API Key Error</p>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#99f6e4', lineHeight: 1.8 }}>
                                <li>Verify <code>SUPABASE_SERVICE_ROLE_KEY</code> is set (not a placeholder!)</li>
                                <li>Ensure <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> matches your Supabase project</li>
                                <li>Check Row Level Security (RLS) policies if getting permission denied</li>
                            </ul>
                        </div>
                    )}

                    {/* Environment Check */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ margin: '0 0 8px', fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Environment Status
                        </p>
                        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, fontSize: 12 }}>
                            {[
                                { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL },
                                { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
                            ].map((e) => (
                                <div key={e.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                                    <span style={{ color: '#cbd5e1' }}>{e.key}</span>
                                    <span style={{ color: e.val ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                                        {e.val ? '✅ Set' : '❌ MISSING'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stack Trace */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ margin: '0 0 8px', fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Stack Trace
                        </p>
                        <pre
                            style={{
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: 8,
                                padding: 12,
                                margin: 0,
                                fontSize: 10,
                                color: '#64748b',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                maxHeight: 180,
                                overflow: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            {error.stack || 'No stack trace available.'}
                        </pre>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button onClick={reset} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            🔄 Retry
                        </button>
                        <button onClick={() => { window.location.href = '/portal/login'; }} style={{ padding: '10px 20px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            🔑 Back to Login
                        </button>
                        <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }} style={{ padding: '10px 20px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            🗑️ Hard Reset
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(`${error.name}: ${error.message}\n\n${error.stack}`); alert('Copied!'); }} style={{ padding: '10px 20px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            📋 Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
