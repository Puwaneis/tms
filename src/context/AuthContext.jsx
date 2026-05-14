/* eslint-disable react-refresh/only-export-components -- context + hook share one module */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

function decodePayload(token) {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    const payload = decodePayload(token);
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
    }, []);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    }

    const isAuthenticated = Boolean(token) && !isTokenExpired(token);

    const payload = decodePayload(token);
    const role = payload?.role ?? null;
    const userId = payload?.sub ? parseInt(payload.sub, 10) : null;

    useEffect(() => {
        if (!token) return;
        if (isTokenExpired(token)) {
            const t = setTimeout(logout, 0);
            return () => clearTimeout(t);
        }
        const p = decodePayload(token);
        const msUntilExpiry = p.exp * 1000 - Date.now();
        const timer = setTimeout(logout, msUntilExpiry);
        return () => clearTimeout(timer);
    }, [token, logout]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                token,
                role,
                userId,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
    return context
}
