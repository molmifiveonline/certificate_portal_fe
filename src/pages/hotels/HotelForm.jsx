import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, RefreshCcw } from 'lucide-react';

const HotelForm = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: initialData || {}
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
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
                            type="email"
                            {...register('email')}
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

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
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
                            {...register('venue_contact')}
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

            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all text-sm"
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
        </form>
    );
};

export default HotelForm;
