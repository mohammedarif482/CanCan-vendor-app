import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack, Divider, CopyToClipboard, IconButton } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

// Check critical environment variables
const checkEnvironmentVariables = () => {
    const envVars = [
        { name: 'VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)', value: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL },
        { name: 'VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)', value: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    ];

    return envVars.map(env => ({
        name: env.name,
        isDefined: !!env.value,
        status: !!env.value ? '✅ OK' : '❌ MISSING',
    }));
};

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleHardReset = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    private handleRefresh = () => {
        window.location.reload();
    };

    private copyErrorToClipboard = () => {
        const errorText = `Error: ${this.state.error?.message}\n\nStack Trace:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
        navigator.clipboard.writeText(errorText).then(() => {
            alert('Error copied to clipboard!');
        });
    };

    public render() {
        if (this.state.hasError) {
            const envStatus = checkEnvironmentVariables();
            const isSyntaxError = this.state.error?.name === 'SyntaxError';
            const isFetchError = this.state.error?.message?.toLowerCase().includes('fetch failed');

            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        bgcolor: '#0f172a',
                        coloc: '#f8fafc',
                        p: { xs: 2, md: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontFamily: 'monospace'
                    }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            maxWidth: 1000,
                            width: '100%',
                            bgcolor: '#1e293b',
                            color: '#f8fafc',
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: '1px solid #334155'
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ bgcolor: '#dc2626', p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <WarningAmberIcon sx={{ fontSize: 40, color: '#fff' }} />
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
                                    CRITICAL SYSTEM FAILURE
                                </Typography>
                                <Typography variant="subtitle2" sx={{ color: '#fca5a5' }}>
                                    The React application has crashed. A diagnostic report is available below.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ p: 4 }}>
                            {/* Error Message */}
                            <Box mb={4}>
                                <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 1.5, fontWeight: 700 }}>
                                    Fatal Exception
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: '#0f172a', borderLeft: '4px solid #ef4444', mt: 1, position: 'relative' }}>
                                    <Typography variant="h6" sx={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 600 }}>
                                        {this.state.error?.name}: {this.state.error?.message}
                                    </Typography>
                                    <IconButton
                                        onClick={this.copyErrorToClipboard}
                                        sx={{ position: 'absolute', top: 8, right: 8, color: '#64748b' }}
                                        title="Copy Full Trace"
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Paper>
                            </Box>

                            {/* Smart Diagnostic Hint based on Error Type */}
                            {isFetchError && (
                                <Paper sx={{ p: 2, bgcolor: '#422006', color: '#fef08a', border: '1px solid #ca8a04', mb: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={800} mb={1}>💡 Diagnostic Hint: Fetch Failed</Typography>
                                    <Typography variant="body2">
                                        This usually happens because the API or Supabase URL is incorrect, blocked by CORS, or the backend server is not running. Check the network tab in your browser dev tools.
                                    </Typography>
                                </Paper>
                            )}

                            {isSyntaxError && (
                                <Paper sx={{ p: 2, bgcolor: '#422006', color: '#fef08a', border: '1px solid #ca8a04', mb: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={800} mb={1}>💡 Diagnostic Hint: Syntax Error</Typography>
                                    <Typography variant="body2">
                                        A file contains invalid JSON or malformed JavaScript. This is often caused by an API returning raw HTML (like a 404 page) when `JSON.parse` was expected.
                                    </Typography>
                                </Paper>
                            )}

                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                                {/* Environment Diagnostcs */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TerminalIcon fontSize="small" /> Env Diagnostic
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#0f172a', mt: 1 }}>
                                        {envStatus.map((env, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx !== envStatus.length - 1 ? '1px solid #334155' : 'none', py: 1 }}>
                                                <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{env.name}</Typography>
                                                <Typography variant="body2" sx={{ color: env.isDefined ? '#4ade80' : '#f87171', fontWeight: 700, ml: 2, flexShrink: 0 }}>
                                                    {env.status}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Box>

                                {/* React Component Stack */}
                                <Box sx={{ flex: 2 }}>
                                    <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 1.5, fontWeight: 700 }}>
                                        Component Tree Trace
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#0f172a', mt: 1, maxHeight: 200, overflowY: 'auto' }}>
                                        <Typography
                                            variant="body2"
                                            component="pre"
                                            sx={{
                                                margin: 0,
                                                color: '#94a3b8',
                                                fontSize: '0.75rem',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all'
                                            }}
                                        >
                                            {this.state.errorInfo?.componentStack || 'Stack trace loading...'}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Stack>
                        </Box>

                        <Divider sx={{ borderColor: '#334155' }} />

                        {/* Recovery Actions */}
                        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: '#0f172a' }}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={this.handleRefresh}
                                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                            >
                                Reload Page
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DeleteSweepIcon />}
                                onClick={this.handleHardReset}
                                sx={{ color: '#94a3b8', borderColor: '#475569', '&:hover': { borderColor: '#cbd5e1', color: '#f8fafc' } }}
                            >
                                Hard Reset (Clear Storage)
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
