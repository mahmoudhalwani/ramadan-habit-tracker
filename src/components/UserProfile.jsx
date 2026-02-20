import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Save, ChevronDown } from 'lucide-react';

const UserProfile = ({ user, onSave, onLogout }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = () => {
        onSave();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    if (!user) return null;

    // Guest mode
    if (!user.email) {
        return (
            <div className="user-profile-bar glass-card">
                <div className="user-profile-info">
                    <div className="user-avatar-placeholder">
                        <User size={14} />
                    </div>
                    <span className="user-name-text">Guest Mode</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Data stored locally
                </span>
            </div>
        );
    }

    return (
        <>
            <div className="user-profile-bar glass-card" onClick={() => setShowMenu(!showMenu)}>
                <div className="user-profile-info">
                    <div className="user-avatar-placeholder" style={{
                        background: 'linear-gradient(135deg, rgba(247,201,72,0.2), rgba(167,139,250,0.2))',
                        color: 'var(--accent-gold)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                    }}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <span className="user-name-text">{user.name}</span>
                        <span className="user-sync-time">{user.email}</span>
                    </div>
                </div>

                <ChevronDown
                    size={14}
                    style={{
                        color: 'var(--text-muted)',
                        transition: 'transform 0.2s',
                        transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </div>

            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        className="user-menu glass-card"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        <button className="user-menu-item" onClick={handleSave}>
                            <Save size={16} />
                            <span>{saveSuccess ? '✓ Saved!' : 'Save Progress'}</span>
                        </button>
                        <div className="user-menu-divider" />
                        <button className="user-menu-item user-menu-danger" onClick={onLogout}>
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {showMenu && (
                <div className="user-menu-backdrop" onClick={() => setShowMenu(false)} />
            )}
        </>
    );
};

export default UserProfile;
