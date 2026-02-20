import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Download, Upload, LogOut, Check, Loader2, AlertCircle, X } from 'lucide-react';

const UserProfile = ({ user, syncing, syncError, lastSynced, onSync, onRestore, onLogout }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [restoreSuccess, setRestoreSuccess] = useState(false);

    const handleSync = async () => {
        const result = await onSync();
        if (result?.success) {
            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 2000);
        }
    };

    const handleRestore = async () => {
        const result = await onRestore();
        if (result?.success) {
            setRestoreSuccess(true);
            setTimeout(() => setRestoreSuccess(false), 2000);
        }
    };

    if (!user) return null;

    // Guest mode (no GitHub token)
    if (!user.token) {
        return (
            <div className="user-profile-bar glass-card">
                <div className="user-profile-info">
                    <div className="user-avatar-placeholder">
                        <CloudOff size={14} />
                    </div>
                    <span className="user-name-text">Local Mode</span>
                </div>
                <span className="user-local-hint" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Data stored locally only
                </span>
            </div>
        );
    }

    return (
        <>
            <div className="user-profile-bar glass-card" onClick={() => setShowMenu(!showMenu)}>
                <div className="user-profile-info">
                    {user.avatar ? (
                        <img src={user.avatar} alt="" className="user-avatar" />
                    ) : (
                        <div className="user-avatar-placeholder">
                            <Cloud size={14} />
                        </div>
                    )}
                    <div>
                        <span className="user-name-text">{user.name || user.login}</span>
                        {lastSynced && (
                            <span className="user-sync-time">
                                Synced {formatTimeAgo(lastSynced)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="user-profile-actions">
                    {syncing && <Loader2 size={14} className="spin" style={{ color: 'var(--accent-gold)' }} />}
                    {syncSuccess && <Check size={14} style={{ color: 'var(--accent-green)' }} />}
                    <Cloud size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
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
                        <button className="user-menu-item" onClick={handleSync} disabled={syncing}>
                            <Upload size={16} />
                            <span>{syncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Backup to GitHub'}</span>
                        </button>
                        <button className="user-menu-item" onClick={handleRestore} disabled={syncing}>
                            <Download size={16} />
                            <span>{restoreSuccess ? 'Restored!' : 'Restore from GitHub'}</span>
                        </button>
                        <div className="user-menu-divider" />
                        <button className="user-menu-item user-menu-danger" onClick={onLogout}>
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>

                        {syncError && (
                            <div className="user-menu-error">
                                <AlertCircle size={12} />
                                {syncError}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close */}
            {showMenu && (
                <div className="user-menu-backdrop" onClick={() => setShowMenu(false)} />
            )}
        </>
    );
};

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default UserProfile;
