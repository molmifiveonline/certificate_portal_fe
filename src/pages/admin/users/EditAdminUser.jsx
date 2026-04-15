import React, { useState, useEffect } from 'react';
import { getErrorMessage } from "../../../lib/utils/errorUtils";
import Meta from "../../../components/common/Meta";
import PageHeader from '../../../components/common/PageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import AdminUserForm from './AdminUserForm';
import adminUserService from '../../../services/adminUserService';
import { toast } from 'sonner';

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
                toast.error(getErrorMessage(error, 'Failed to load admin user details'));
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
            toast.error(getErrorMessage(error, 'Failed to update admin user'));
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
                <PageHeader
                    title="Edit Admin User"
                    subtitle="Update system administrator details"
                    compact={true}
                    backTo="/admin/users"
                />

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
