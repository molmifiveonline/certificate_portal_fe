import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, RefreshCcw } from 'lucide-react';
import { getCommonFieldValidation } from '../../lib/utils/validation';

const HotelForm = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: initialData || {}
    });
    const emailValidation = getCommonFieldValidation({ label: 'Email', name: 'email', type: 'email' });
    const contactValidation = getCommonFieldValidation({ label: 'Contact number', name: 'venue_contact' });

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
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Hotel Information
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Hotel Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('venue_name', { required: 'Hotel name is required' })}
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors.venue_name ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                            placeholder="Enter hotel name"
                        />
                        {errors.venue_name && <span className="text-xs text-red-500 ml-1">{errors.venue_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Email Address
                        </label>
                        <input
                            type="text"
                            {...register('email', emailValidation.rules)}
                            {...emailValidation.inputProps}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                            placeholder="hotel@example.com"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Hotel Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('venue_address', { required: 'Hotel address is required' })}
                            rows="3"
                            className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border ${errors.venue_address ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm resize-none`}
                            placeholder="Enter complete hotel address"
                        />
                        {errors.venue_address && <span className="text-xs text-red-500 ml-1">{errors.venue_address.message}</span>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Additional Information
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Contact Number
                        </label>
                        <input
                            {...register('venue_contact', contactValidation.rules)}
                            {...contactValidation.inputProps}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                            placeholder="Contact details"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Google Maps Link
                        </label>
                        <input
                            {...register('venue_map_link')}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                            placeholder="https://maps.google.com/..."
                        />
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
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
                    >
                        {isSubmitting ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{initialData ? 'Update Hotel' : 'Create Hotel'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default HotelForm;
