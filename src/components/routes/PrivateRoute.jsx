import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../layout/MainLayout';

// Helper to get the correct dashboard path per role
const getDashboardByRole = (user) => {
    if (user?.nominator_id) return '/pre-active-courses';
    const r = (user?.role || '').toLowerCase();
    if (r === 'superadmin' || r === 'admin') return '/dashboard';
    if (r === 'trainer') return '/dashboard/trainer';
    if (r === 'candidate') return '/dashboard/candidate';
    return '/dashboard';
};

const PrivateRoute = ({
    children,
    allowedRoles,
    noLayout = false,
    requiredPermission,
    requiredAnyPermissions,
    allowRestrictedAdminWithoutPermissions = false,
}) => {
    const { user, loading, hasPermission, hasAnyPermission, isRestrictedAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role not allowed → redirect to user's own dashboard (not login)
    if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === user.role.toLowerCase())) {
        const userDashboard = getDashboardByRole(user);
        return <Navigate to={userDashboard} replace />;
    }

    if (isRestrictedAdmin) {
        const hasRoutePermission = requiredPermission
            ? hasPermission(requiredPermission)
            : Array.isArray(requiredAnyPermissions) && requiredAnyPermissions.length > 0
                ? hasAnyPermission(requiredAnyPermissions)
                : allowRestrictedAdminWithoutPermissions;

        if (!hasRoutePermission) {
            const redirectPath = user?.nominator_id ? "/pre-active-courses" : "/dashboard";
            return <Navigate to={redirectPath} replace />;
        }
    }

    if (noLayout) {
        return <>{children}</>;
    }

    return <MainLayout>{children}</MainLayout>;
};

export default PrivateRoute;
