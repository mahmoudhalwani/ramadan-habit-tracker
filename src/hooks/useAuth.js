import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'ramadan-tracker-auth';
const GITHUB_API = 'https://api.github.com';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [lastSynced, setLastSynced] = useState(null);

    // Load saved auth on mount
    useEffect(() => {
        const saved = localStorage.getItem(AUTH_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed);
                if (parsed.lastSynced) setLastSynced(new Date(parsed.lastSynced));
            } catch (e) {
                console.error('Failed to load auth data', e);
            }
        }
        setLoading(false);
    }, []);

    // Save auth to localStorage
    const saveAuth = useCallback((userData) => {
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    }, []);

    // Login with GitHub Personal Access Token
    const loginWithGitHub = useCallback(async (token) => {
        try {
            setLoading(true);
            setSyncError(null);

            // Validate token by fetching user info
            const res = await fetch(`${GITHUB_API}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!res.ok) {
                throw new Error('Invalid token. Please check your GitHub Personal Access Token.');
            }

            const githubUser = await res.json();

            const userData = {
                id: githubUser.id,
                name: githubUser.name || githubUser.login,
                login: githubUser.login,
                avatar: githubUser.avatar_url,
                token: token,
                gistId: null,
                lastSynced: null,
            };

            // Check if user already has a Ramadan Tracker gist
            const gistsRes = await fetch(`${GITHUB_API}/gists?per_page=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (gistsRes.ok) {
                const gists = await gistsRes.json();
                const existingGist = gists.find(g =>
                    g.description === 'Ramadan Habit Tracker - Data Backup' &&
                    g.files['ramadan-tracker-data.json']
                );
                if (existingGist) {
                    userData.gistId = existingGist.id;
                }
            }

            setUser(userData);
            saveAuth(userData);
            setLoading(false);
            return { success: true, user: userData };
        } catch (err) {
            setLoading(false);
            setSyncError(err.message);
            return { success: false, error: err.message };
        }
    }, [saveAuth]);

    // Sync data TO GitHub (upload)
    const syncToGitHub = useCallback(async (trackerData) => {
        if (!user || !user.token) return { success: false, error: 'Not logged in' };

        try {
            setSyncing(true);
            setSyncError(null);

            const content = JSON.stringify(trackerData, null, 2);
            const gistData = {
                description: 'Ramadan Habit Tracker - Data Backup',
                public: false,
                files: {
                    'ramadan-tracker-data.json': {
                        content: content,
                    }
                }
            };

            let res;
            if (user.gistId) {
                // Update existing gist
                res = await fetch(`${GITHUB_API}/gists/${user.gistId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gistData),
                });
            } else {
                // Create new gist
                res = await fetch(`${GITHUB_API}/gists`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gistData),
                });
            }

            if (!res.ok) {
                throw new Error('Failed to sync data to GitHub');
            }

            const gist = await res.json();
            const now = new Date().toISOString();

            const updatedUser = { ...user, gistId: gist.id, lastSynced: now };
            setUser(updatedUser);
            saveAuth(updatedUser);
            setLastSynced(new Date(now));
            setSyncing(false);
            return { success: true };
        } catch (err) {
            setSyncing(false);
            setSyncError(err.message);
            return { success: false, error: err.message };
        }
    }, [user, saveAuth]);

    // Sync data FROM GitHub (download)
    const syncFromGitHub = useCallback(async () => {
        if (!user || !user.token || !user.gistId) {
            return { success: false, error: 'No saved data found on GitHub' };
        }

        try {
            setSyncing(true);
            setSyncError(null);

            const res = await fetch(`${GITHUB_API}/gists/${user.gistId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch data from GitHub');
            }

            const gist = await res.json();
            const file = gist.files['ramadan-tracker-data.json'];
            if (!file) {
                throw new Error('No tracker data found in the gist');
            }

            const data = JSON.parse(file.content);
            setSyncing(false);
            return { success: true, data };
        } catch (err) {
            setSyncing(false);
            setSyncError(err.message);
            return { success: false, error: err.message };
        }
    }, [user]);

    // Logout
    const logout = useCallback(() => {
        setUser(null);
        setLastSynced(null);
        setSyncError(null);
        localStorage.removeItem(AUTH_KEY);
    }, []);

    return {
        user,
        loading,
        syncing,
        syncError,
        lastSynced,
        loginWithGitHub,
        syncToGitHub,
        syncFromGitHub,
        logout,
    };
};
