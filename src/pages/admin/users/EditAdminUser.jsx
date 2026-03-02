import React, { useState, useEffect } from 'react';
import Meta from "../../../components/common/Meta";
import { useNavigate, useParams } from 'react-router-dom';
import AdminUserForm from './AdminUserForm';
import adminUserService from '../../../services/adminUserService';
import { toast } from 'sonner';
import BackButton from '../../../components/common/BackButton';

const EditAdminUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await adminUserService.getAdminById(id);
                setInitialData(data);
            } catch (error) {
                console.error('Error fetching admin user data:', error);
                toast.error('Failed to load admin user details');
                navigate('/admin/users');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id, navigate]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await adminUserService.updateAdmin(id, data);
            toast.success('Admin user updated successfully!');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error updating admin user:', error);
            toast.error(error.response?.data?.message || 'Failed to update admin user');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#0060AA] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading admin user data...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Edit Admin User" description="Edit Admin User" />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight page-title">Edit Admin User</h1>
                        <p className="text-slate-500 mt-1">Update system administrator details</p>
                    </div>
                    <BackButton to="/admin/users" />
                </div>

                <AdminUserForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/admin/users')}
                />
            </div>
        </div>
    );
};

export default EditAdminUser;
