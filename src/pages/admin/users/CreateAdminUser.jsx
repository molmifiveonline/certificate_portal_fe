import React, { useState } from 'react';
import { getErrorMessage } from "../../../lib/utils/errorUtils";
import Meta from "../../../components/common/Meta";
import PageHeader from '../../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import AdminUserForm from './AdminUserForm';
import adminUserService from '../../../services/adminUserService';
import { toast } from 'sonner';

const CreateAdminUser = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await adminUserService.createAdmin(data);
            toast.success('Admin user created successfully!');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error creating admin user:', error);
            toast.error(getErrorMessage(error, 'Failed to create admin user'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add Admin User" description="Add New Admin User" />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                <PageHeader
                    title="Add Admin User"
                    subtitle="Register a new system administrator"
                    compact={true}
                    backTo="/admin/users"
                />

                <AdminUserForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/admin/users')}
                />
            </div>
        </div>
    );
};

export default CreateAdminUser;
