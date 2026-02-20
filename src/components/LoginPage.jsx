import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, LogIn, UserPlus, Eye, EyeOff, AlertCircle, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const LoginPage = ({ onSignIn, onCreateAccount, loading: authLoading }) => {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (mode === 'signup') {
                result = await onCreateAccount(name, email, password);
            } else {
                result = await onSignIn(email, password);
            }

            if (!result.success) {
                setError(result.error || 'Something went wrong');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }

        setLoading(false);
    };

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
    };

    const isSubmitting = loading || authLoading;

    return (
        <div className="login-page">
            <div className="login-bg-decoration" />

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-moon-icon animate-float">
                        <Moon size={28} />
                    </div>
                    <h1 className="header-title text-gradient-gold" style={{ fontSize: '2rem', marginTop: '0.75rem' }}>
                        Ramadan Tracker
                    </h1>
                    <p className="header-subtitle" style={{ marginTop: '0.25rem' }}>
                        Reflect · Track · Grow
                    </p>
                </div>

                {/* Auth Card */}
                <div className="login-card glass-card">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="login-card-header">
                                {mode === 'signup' ? (
                                    <UserPlus size={20} style={{ color: 'var(--accent-green)' }} />
                                ) : (
                                    <LogIn size={20} style={{ color: 'var(--accent-gold)' }} />
                                )}
                                <div>
                                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                                    </h2>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {mode === 'signup'
                                            ? 'Start tracking your Ramadan journey'
                                            : 'Sign in to continue your journey'
                                        }
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="login-form">
                                {/* Name field — only for signup */}
                                {mode === 'signup' && (
                                    <div className="login-input-group">
                                        <label className="login-label">Your Name</label>
                                        <div className="login-input-wrap">
                                            <div className="login-input-icon">
                                                <User size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                className="input login-input-with-icon"
                                                placeholder="Enter your name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={mode === 'signup'}
                                                id="signup-name-input"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email field */}
                                <div className="login-input-group">
                                    <label className="login-label">Email Address</label>
                                    <div className="login-input-wrap">
                                        <div className="login-input-icon">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            className="input login-input-with-icon"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            id="login-email-input"
                                        />
                                    </div>
                                </div>

                                {/* Password field */}
                                <div className="login-input-group">
                                    <label className="login-label">Password</label>
                                    <div className="login-input-wrap">
                                        <div className="login-input-icon">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="input login-input-with-icon login-input"
                                            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={mode === 'signup' ? 6 : undefined}
                                            id="login-password-input"
                                        />
                                        <button
                                            type="button"
                                            className="login-eye-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary login-submit"
                                    disabled={isSubmitting}
                                    id="login-submit-btn"
                                >
                                    {isSubmitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            <span className="spin" style={{ display: 'inline-flex' }}>⏳</span>
                                            {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            {mode === 'signup' ? <UserPlus size={18} /> : <LogIn size={18} />}
                                            {mode === 'signup' ? 'Create Account' : 'Sign In'}
                                        </span>
                                    )}
                                </button>
                            </form>

                            {/* Switch mode */}
                            <div className="login-switch">
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                                </span>
                                <button className="login-switch-btn" onClick={switchMode}>
                                    {mode === 'signin' ? 'Create Account' : 'Sign In'}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Skip */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                        className="login-skip-btn"
                        onClick={() => onSignIn(null, null)}
                    >
                        Continue without account (local only)
                    </button>
                </div>

                {/* Feature badges */}
                <div className="login-features">
                    <div className="login-feature-item">
                        <span className="login-feature-icon">🔒</span>
                        <span>Secure & Private</span>
                    </div>
                    <div className="login-feature-item">
                        <span className="login-feature-icon">📊</span>
                        <span>Track your progress</span>
                    </div>
                    <div className="login-feature-item">
                        <span className="login-feature-icon">🏆</span>
                        <span>Earn achievements</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
