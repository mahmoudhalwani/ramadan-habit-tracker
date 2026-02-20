import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, LogIn, Eye, EyeOff, Moon, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const LoginPage = ({ onLogin, loading: authLoading }) => {
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('Please enter your GitHub Personal Access Token');
            return;
        }
        setError('');
        setLoading(true);
        const result = await onLogin(token.trim());
        setLoading(false);
        if (!result.success) {
            setError(result.error);
        }
    };

    const handleSkip = () => {
        onLogin(null); // Skip auth, use local-only mode
    };

    return (
        <div className="login-page">
            {/* Background decoration */}
            <div className="login-bg-decoration" />

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Logo */}
                <motion.div
                    className="login-logo"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="login-moon-icon animate-float">
                        <Moon size={32} />
                    </div>
                    <h1 className="text-gradient-gold" style={{ fontSize: '2rem', fontWeight: 900, marginTop: '1rem' }}>
                        Ramadan Tracker
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Reflect · Track · Grow
                    </p>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    className="login-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="login-card-header">
                        <Github size={24} style={{ color: 'var(--text-primary)' }} />
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sign in with GitHub</h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                Your data will be synced to your GitHub account
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-input-group">
                            <label htmlFor="github-token" className="login-label">
                                Personal Access Token
                            </label>
                            <div className="login-input-wrap">
                                <input
                                    id="github-token"
                                    type={showToken ? 'text' : 'password'}
                                    value={token}
                                    onChange={(e) => { setToken(e.target.value); setError(''); }}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    className="input-field login-input"
                                    disabled={loading}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className="login-eye-btn"
                                    onClick={() => setShowToken(!showToken)}
                                    tabIndex={-1}
                                >
                                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="login-error"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            className="btn-primary login-submit"
                            disabled={loading}
                            id="login-btn"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-help">
                        <a
                            href="https://github.com/settings/tokens/new?description=Ramadan+Tracker&scopes=gist"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="login-help-link"
                        >
                            <ExternalLink size={12} />
                            Create a token (select "gist" scope)
                        </a>
                    </div>
                </motion.div>

                {/* Skip option */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ textAlign: 'center', marginTop: '1.5rem' }}
                >
                    <button
                        className="login-skip-btn"
                        onClick={handleSkip}
                        id="skip-login-btn"
                    >
                        Continue without account (local only)
                    </button>
                </motion.div>

                {/* Features */}
                <motion.div
                    className="login-features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="login-feature-item">
                        <span className="login-feature-icon">🔒</span>
                        <span>Private Gist backup</span>
                    </div>
                    <div className="login-feature-item">
                        <span className="login-feature-icon">🔄</span>
                        <span>Sync across devices</span>
                    </div>
                    <div className="login-feature-item">
                        <span className="login-feature-icon">📊</span>
                        <span>Track your progress</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
