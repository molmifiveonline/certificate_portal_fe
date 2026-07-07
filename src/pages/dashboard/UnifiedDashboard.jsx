import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import lazyWithRetry from '../../lib/utils/lazyWithRetry';

const SuperAdminDashboard = lazyWithRetry(() => import('./SuperAdminDashboard'));
const TrainerDashboard = lazyWithRetry(() => import('./TrainerDashboard'));
const CandidateDashboard = lazyWithRetry(() => import('./CandidateDashboard'));
const RestrictedAdminDashboard = lazyWithRetry(() => import('./RestrictedAdminDashboard'));

const UnifiedDashboard = () => {
    const { user, isRestrictedAdmin } = useAuth();

    if (!user) return null; // Or a loading spinner, though PrivateRoute handles this

    if (user.nominator_id) {
        return <Navigate to="/pre-active-courses" replace />;
    }

    const role = user.role?.toLowerCase();

    const renderDashboard = () => {
        if (role === 'superadmin' || role === 'admin') {
            if (isRestrictedAdmin) {
                return <RestrictedAdminDashboard />;
            }
            return <SuperAdminDashboard />;
        }

        if (role === 'trainer') {
            return <TrainerDashboard />;
        }

        if (role === 'candidate') {
            return <CandidateDashboard />;
        }

        return (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome to MOLMI Portal</h2>
                <p className="mt-2 text-gray-600">You are logged in, but no specific dashboard is available for your role ({user.role}).</p>
            </div>
        );
    };

    return (
        <Suspense fallback={<LoadingSpinner />}>
            {renderDashboard()}
        </Suspense>
    );
};

export default UnifiedDashboard;
