import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import TrainerDashboard from './TrainerDashboard';
import CandidateDashboard from './CandidateDashboard';

const UnifiedDashboard = () => {
    const { user } = useAuth();

    if (!user) return null; // Or a loading spinner, though PrivateRoute handles this

    const role = user.role?.toLowerCase();

    if (role === 'superadmin' || role === 'admin') {
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

export default UnifiedDashboard;
