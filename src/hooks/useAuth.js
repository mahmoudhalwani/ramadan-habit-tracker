import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'ramadan-tracker-auth';
const ACCOUNTS_KEY = 'ramadan-tracker-accounts';

// Simple hash function for password storage (not cryptographic, but fine for local storage)
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Get all accounts from localStorage
const getAccounts = () => {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
    } catch {
        return {};
    }
};

// Save accounts to localStorage
const saveAccounts = (accounts) => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load saved session on mount
    useEffect(() => {
        const saved = localStorage.getItem(AUTH_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed);
            } catch {
                localStorage.removeItem(AUTH_KEY);
            }
        }
        setLoading(false);
    }, []);

    // Create a new account with email + password
    const createAccount = useCallback(async (name, email, password) => {
        try {
            const normalizedEmail = email.trim().toLowerCase();

            // Validate inputs
            if (!name.trim()) {
                return { success: false, error: 'Please enter your name' };
            }
            if (!normalizedEmail || !normalizedEmail.includes('@')) {
                return { success: false, error: 'Please enter a valid email' };
            }
            if (password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            // Check if account already exists
            const accounts = getAccounts();
            if (accounts[normalizedEmail]) {
                return { success: false, error: 'An account with this email already exists. Try signing in instead.' };
            }

            // Hash password and create account
            const passwordHash = await hashPassword(password);
            const userId = 'user_' + Date.now().toString(36);

            accounts[normalizedEmail] = {
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                passwordHash,
                createdAt: new Date().toISOString(),
                trackerData: null,
            };

            saveAccounts(accounts);

            // Set session
            const userData = { id: userId, name: name.trim(), email: normalizedEmail };
            setUser(userData);
            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: 'Something went wrong. Please try again.' };
        }
    }, []);

    // Sign in with email + password
    const signIn = useCallback(async (email, password) => {
        try {
            const normalizedEmail = email.trim().toLowerCase();

            if (!normalizedEmail || !normalizedEmail.includes('@')) {
                return { success: false, error: 'Please enter a valid email' };
            }
            if (!password) {
                return { success: false, error: 'Please enter your password' };
            }

            const accounts = getAccounts();
            const account = accounts[normalizedEmail];

            if (!account) {
                return { success: false, error: 'No account found with this email. Try creating one.' };
            }

            // Verify password
            const passwordHash = await hashPassword(password);
            if (passwordHash !== account.passwordHash) {
                return { success: false, error: 'Incorrect password' };
            }

            // Set session
            const userData = { id: account.id, name: account.name, email: normalizedEmail };
            setUser(userData);
            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));

            return { success: true, user: userData, trackerData: account.trackerData };
        } catch (error) {
            return { success: false, error: 'Something went wrong. Please try again.' };
        }
    }, []);

    // Save tracker data to the user's account
    const saveUserData = useCallback((trackerData) => {
        if (!user) return;
        const accounts = getAccounts();
        const account = accounts[user.email];
        if (account) {
            account.trackerData = trackerData;
            account.lastSaved = new Date().toISOString();
            saveAccounts(accounts);
        }
    }, [user]);

    // Load tracker data from the user's account
    const loadUserData = useCallback(() => {
        if (!user) return null;
        const accounts = getAccounts();
        const account = accounts[user.email];
        return account?.trackerData || null;
    }, [user]);

    // Sign out
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_KEY);
    }, []);

    return {
        user,
        loading,
        createAccount,
        signIn,
        saveUserData,
        loadUserData,
        logout,
    };
};
