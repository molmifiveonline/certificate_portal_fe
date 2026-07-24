import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const device_trust_token = localStorage.getItem('device_trust_token');
            const response = await api.post('/auth/login', { email, password, device_trust_token });
            
            if (response.data.requiresOtp) {
                return response.data;
            }

            const { user, token } = response.data;
            const userData = { ...user, token };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const verifyOtp = async (otpSessionId, otpCode) => {
        try {
            const response = await api.post('/auth/verify-otp', { otpSessionId, otpCode });
            const { user, token, device_trust_token } = response.data;

            const userData = { ...user, token };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (device_trust_token) {
                localStorage.setItem('device_trust_token', device_trust_token);
            }
            return userData;
        } catch (error) {
            console.error("OTP verification failed", error);
            throw error;
        }
    };


    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Optional: Call backend logout if needed
    };

    const hasPermission = (permissionSlug) => {
        if (!user) return false;
        const userRole = (user.role || '').toLowerCase();

        if (userRole === 'superadmin') return true;
        if (userRole === 'admin') {
            if (user.adminRolePermissions === null || user.adminRolePermissions === undefined) {
                return true; // Admin without a restricted role has full access
            }
            return user.adminRolePermissions.includes(permissionSlug);
        }

        // For other roles (trainer, candidate) check the base permissions array
        return (user.permissions || []).includes(permissionSlug);
    };

    const hasAnyPermission = (permissionSlugs = []) => {
        if (!permissionSlugs || permissionSlugs.length === 0) return false;
        return permissionSlugs.some((permissionSlug) => hasPermission(permissionSlug));
    };

    const isRestrictedAdmin =
        (user?.role || '').toLowerCase() === 'admin' &&
        Array.isArray(user?.adminRolePermissions);

    return (
        <AuthContext.Provider value={{ user, token: user?.token, login, verifyOtp, logout, loading, hasPermission, hasAnyPermission, isRestrictedAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
