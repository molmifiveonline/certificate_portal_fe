import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, RefreshCcw } from 'lucide-react';
import { getCommonFieldValidation } from '../../lib/utils/validation';

const LocationForm = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: initialData || {}
    });
    const emailValidation = getCommonFieldValidation({ label: 'Email', name: 'email', type: 'email', required: true });
    const phoneValidation = getCommonFieldValidation({ label: 'Phone number', name: 'phone_number', required: true });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Location Details
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Location Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('location_name', { required: 'Location name is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.location_name ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="e.g. Mumbai Center"
                        />
                        {errors.location_name && <span className="text-xs text-red-500 ml-1">{errors.location_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('type', { required: 'Type is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.type ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                        >
                            <option value="Inhouse">Inhouse</option>
                            <option value="Outhouse">Outhouse</option>
                        </select>
                        {errors.type && <span className="text-xs text-red-500 ml-1">{errors.type.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Short Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('short_code', { required: 'Short code is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.short_code ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="e.g. MUM"
                        />
                        {errors.short_code && <span className="text-xs text-red-500 ml-1">{errors.short_code.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register('email', emailValidation.rules)}
                            {...emailValidation.inputProps}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="center@example.com"
                        />
                        {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('phone_number', phoneValidation.rules)}
                            {...phoneValidation.inputProps}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.phone_number ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="Contact number"
                        />
                        {errors.phone_number && <span className="text-xs text-red-500 ml-1">{errors.phone_number.message}</span>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Physical Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('address', { required: 'Address is required' })}
                            rows="3"
                            className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border ${errors.address ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm resize-none`}
                            placeholder="Full location address"
                        />
                        {errors.address && <span className="text-xs text-red-500 ml-1">{errors.address.message}</span>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Google Maps Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('google_map_link', { required: 'Maps link is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.google_map_link ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="https://maps.google.com/..."
                        />
                        {errors.google_map_link && <span className="text-xs text-red-500 ml-1">{errors.google_map_link.message}</span>}
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
                        <span>{initialData ? 'Update Location' : 'Create Location'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LocationForm;
