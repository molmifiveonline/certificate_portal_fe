import React, { useState, createContext, useContext } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import nominatorService from '../../services/nominatorService';
import { Users, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const FormContext = createContext();

const InputField = ({ label, name, type = "text", required, placeholder }) => {
    const { register, errors } = useContext(FormContext);
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false })}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                placeholder={placeholder}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );
};

const CreateNominator = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await nominatorService.createNominator(data);
            toast.success('Nominator created successfully!');
            navigate('/nominators');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create nominator.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <FormContext.Provider value={{ register, errors }}>
            <div className="min-h-screen bg-slate-50">
            <Meta title="Create Nominator" description="Create New Nominator" />
            <PageHeader
                title="Create New Nominator"
                subtitle="Fill in the details to add a new nominator"
                icon={Users}
                compact={true}
                backTo="/nominators"
            />

            {/* Form Content */}
            <div className="max-w-none">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-[1200px] mx-auto mt-8 px-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            Nominator Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Name" name="name" required placeholder="Full Name" />
                            <InputField label="Email Address" name="email" type="email" required placeholder="Email Address" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/nominators')}
                            className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center space-x-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} />
                            <span>{isSubmitting ? 'Creating...' : 'Create Nominator'}</span>
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </FormContext.Provider>
    );
};

export default CreateNominator;
