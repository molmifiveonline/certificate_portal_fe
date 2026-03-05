import React, { useState } from 'react';
import Meta from "../../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import AdminUserForm from './AdminUserForm';
import adminUserService from '../../../services/adminUserService';
import { toast } from 'sonner';
import BackButton from '../../../components/common/BackButton';

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
            toast.error(error.response?.data?.message || 'Failed to create admin user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add Admin User" description="Add New Admin User" />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight page-title">Add Admin User</h1>
                        <p className="text-slate-500 mt-1">Register a new system administrator</p>
                    </div>
                    <BackButton to="/admin/users" />
                </div>

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
