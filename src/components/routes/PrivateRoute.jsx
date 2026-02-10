import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../layout/MainLayout';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Case insensitive role check
    if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === user.role.toLowerCase())) {
        return <Navigate to="/" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
};

export default PrivateRoute;
