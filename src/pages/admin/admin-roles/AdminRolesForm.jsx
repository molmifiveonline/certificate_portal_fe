import React, { useState, useEffect } from 'react';
import Meta from "../../../components/common/Meta";
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Save, RefreshCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api';
import { toast } from 'sonner';
import PageHeader from '../../../components/common/PageHeader';

const AdminRolesForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { status: 1 }
    });

    useEffect(() => {
        const fetchRole = async () => {
            if (!isEditing) return;
            try {
                const res = await api.get(`/admin-roles/${id}`);
                if (res.data.success) {
                    reset(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching admin role:", error);
                toast.error("Failed to fetch admin role details");
                navigate('/admin/admin-roles');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRole();
    }, [id, isEditing, reset, navigate]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await api.put(`/admin-roles/${id}`, data);
                toast.success('Admin role updated successfully!');
            } else {
                await api.post('/admin-roles', data);
                toast.success('Admin role created successfully!');
            }
            navigate('/admin/admin-roles');
        } catch (error) {
            console.error('Error saving admin role:', error);
            toast.error(error.response?.data?.message || 'Failed to save admin role');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading admin role details...</div>;
    }

    return (
        <div className="w-full h-full pb-20">
            <Meta title={isEditing ? "Edit Admin Role" : "Add Admin Role"} description="Manage Admin Role" />
            <div className="max-w-[1600px] mx-auto">
                <PageHeader
                    title={isEditing ? "Edit Admin Role" : "Add Admin Role"}
                    subtitle="Configure permissions profile for admin users"
                    icon={Shield}
                    compact={true}
                    backTo="/admin/admin-roles"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Admin Role Details
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('role_name', { required: 'Role Name is required' })}
                                    className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.role_name ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                                    placeholder="e.g. Account Manager"
                                />
                                {errors.role_name && <span className="text-xs text-red-500 ml-1">{errors.role_name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    Status
                                </label>
                                <select
                                    {...register('status')}
                                    className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.status ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                                >
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    Description
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm resize-none"
                                    placeholder="Brief description of the role and its intended use cases"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 p-4 sm:p-6 -mb-6 flex justify-end mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/admin-roles')}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
                            >
                                {isSubmitting ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{isEditing ? 'Update Role' : 'Create Role'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRolesForm;
