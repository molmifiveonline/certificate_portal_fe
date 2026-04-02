import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, RefreshCcw } from 'lucide-react';
import api from '../../../lib/api';
import { getCommonFieldValidation } from '../../../lib/utils/validation';

const AdminUserForm = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: initialData || { status: 1 }
    });
    const [adminRoles, setAdminRoles] = useState([]);
    const emailValidation = getCommonFieldValidation({ label: 'Email', name: 'email', type: 'email', required: true });
    const mobileValidation = getCommonFieldValidation({ label: 'Mobile number', name: 'mobile', required: true });

    useEffect(() => {
        if (initialData) {
            reset({ ...initialData, password: '' });
        }
    }, [initialData, reset]);

    useEffect(() => {
        api.get('/admin-roles').then(res => {
            const data = res.data?.data;
            const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            const activeRoles = rows.filter(r => r.status === 1);
            setAdminRoles(activeRoles);
            // Re-apply value after options load so dropdown shows correct selection in edit mode
            if (initialData?.admin_role_id) {
                setValue('admin_role_id', initialData.admin_role_id);
            }
        }).catch(() => setAdminRoles([]));
    }, [initialData, setValue]);

    const isEditMode = !!initialData?.id;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Admin Details
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('first_name', { required: 'First name is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.first_name ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="First Name"
                        />
                        {errors.first_name && <span className="text-xs text-red-500 ml-1">{errors.first_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Last Name
                        </label>
                        <input
                            {...register('last_name')}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.last_name ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="Last Name"
                        />
                        {errors.last_name && <span className="text-xs text-red-500 ml-1">{errors.last_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Gender
                        </label>
                        <select
                            {...register('gender')}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.gender ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <span className="text-xs text-red-500 ml-1">{errors.gender.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register('email', emailValidation.rules)}
                            {...emailValidation.inputProps}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="Email Address"
                        />
                        {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Mobile No. <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('mobile', mobileValidation.rules)}
                            {...mobileValidation.inputProps}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.mobile ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="Mobile No."
                        />
                        {errors.mobile && <span className="text-xs text-red-500 ml-1">{errors.mobile.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Password {isEditMode ? '' : <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            {...register('password', { required: isEditMode ? false : 'Password is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder={isEditMode ? "Leave blank to keep current password" : "Password"}
                        />
                        {errors.password && <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Admin Role
                        </label>
                        <select
                            {...register('admin_role_id')}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.admin_role_id ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                        >
                            <option value="">-- No Admin Role --</option>
                            {adminRoles.map(role => (
                                <option key={role.id} selected={role.id === initialData?.admin_role_id} value={role.id}>{role.role_name}</option>
                            ))}
                        </select>
                        {errors.admin_role_id && <span className="text-xs text-red-500 ml-1">{errors.admin_role_id.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('status', {
                                required: 'Status is required',
                                setValueAs: (v) => parseInt(v, 10)
                            })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.status ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                        {errors.status && <span className="text-xs text-red-500 ml-1">{errors.status.message}</span>}
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 p-4 sm:p-6 -mb-6 flex justify-end mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={onCancel}
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
                        <span>{isEditMode ? 'Update Admin' : 'Create Admin'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AdminUserForm;
