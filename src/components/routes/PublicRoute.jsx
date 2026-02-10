import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (user) {
        // Redirect based on role if user is already logged in
        const role = user.role?.toLowerCase();
        if (role === 'superadmin' || role === 'admin') return <Navigate to="/dashboard/super-admin" replace />;
        if (role === 'trainer') return <Navigate to="/dashboard/trainer" replace />;
        if (role === 'candidate') return <Navigate to="/dashboard/candidate" replace />;

        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
