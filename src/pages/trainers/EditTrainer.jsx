import React, { useState, useEffect, createContext, useContext } from 'react';
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Users, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { getCommonFieldValidation } from '../../lib/utils/validation';
import { getErrorMessage } from '../../lib/utils/errorUtils';
import { 
    TRAINER_NATIONALITY_OPTIONS, 
    PREFIX_OPTIONS 
} from "../../lib/constants";

const FormContext = createContext();

const InputField = ({ label, name, type = "text", required, rules, placeholder }) => {
    const { register, errors } = useContext(FormContext);
    const validation = getCommonFieldValidation({ label, name, type, required, rules });
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, validation.rules)}
                {...validation.inputProps}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm cursor-pointer`}
                placeholder={placeholder || (type === "date" ? "DD-MM-YYYY" : "")}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );
};

const FileInput = ({ label, name }) => {
    const { register, handleFileChange, previews } = useContext(FormContext);
    const { ref, ...rest } = register(name);
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">{label}</label>
            <input
                type="file"
                accept="image/*"
                ref={ref}
                {...rest}
                onChange={(e) => {
                    if (!e.target.files?.[0]) return;
                    rest.onChange(e);
                    handleFileChange(name, e);
                }}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none text-sm"
            />
            {previews[name] && (
                <div className="mt-2">
                    <img
                        src={previews[name]}
                        alt={`${label} preview`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                </div>
            )}
        </div>
    );
};

const SelectField = ({ label, name, options, required }) => {
    const { register, errors } = useContext(FormContext);
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...register(name, { required: required ? `${label} is required` : false })}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm cursor-pointer`}
            >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );
};

const EditTrainer = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previews, setPreviews] = useState({ profile_photo: null, digital_signature: null });
    const navigate = useNavigate();
    const { id } = useParams();

    const handleFileChange = (name, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith("image/") && file.size > 500 * 1024) {
                toast.error("Image size must be less than 500 KB");
                e.target.value = "";
                return;
            }
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [name]: url }));
        }
    };


    useEffect(() => {
        const fetchTrainer = async () => {
            try {
                const response = await api.get(`/trainer/${id}`);
                const trainer = response.data;

                // Combine first_name and last_name for the single trainer_name field
                const trainerName = [trainer.first_name, trainer.last_name].filter(Boolean).join(' ');

                setValue('trainer_name', trainerName);
                setValue('prefix', trainer.prefix || '');
                setValue('email', trainer.email || '');
                setValue('nationality', trainer.nationality || '');
                setValue('designation', trainer.designation || '');
                setValue('rank', trainer.rank || '');
                setValue('officer', trainer.officer || '');
                setValue('other_officer', trainer.other_officer || '');
                setValue('mobile', trainer.mobile || '');
                setValue('status', trainer.status === 1);

                // Set existing image previews
                if (trainer.profile_photo) {
                    setPreviews(prev => ({ ...prev, profile_photo: `${process.env.REACT_APP_API_URL}/uploads/trainer/${trainer.profile_photo}` }));
                }
                if (trainer.digital_signature) {
                    setPreviews(prev => ({ ...prev, digital_signature: `${process.env.REACT_APP_API_URL}/uploads/trainer/${trainer.digital_signature}` }));
                }
            } catch (error) {
                console.error("Error fetching trainer:", error);
                toast.error(getErrorMessage(error, "Failed to load trainer data."));
                navigate('/trainers');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainer();
    }, [id, setValue, navigate]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Split name into first and last name for backend compatibility
            const nameParts = data.trainer_name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('email', data.email);
            formData.append('prefix', data.prefix);
            formData.append('designation', data.designation);
            formData.append('nationality', data.nationality);
            formData.append('rank', data.rank);
            formData.append('officer', data.officer);
            formData.append('other_officer', data.other_officer);
            formData.append('mobile', data.mobile);
            formData.append('status', data.status ? 1 : 0);

            // Only append password if provided
            if (data.password) {
                formData.append('password', data.password);
            }

            if (data.digital_signature?.[0]) {
                formData.append('digital_signature', data.digital_signature[0]);
            }
            if (data.profile_photo?.[0]) {
                formData.append('profile_photo', data.profile_photo[0]);
            }

            await api.put(`/trainer/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Trainer updated successfully!');
            navigate('/trainers');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update trainer.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
                <p className="text-slate-500">Loading trainer data...</p>
            </div>
        );
    }

    return (
        <FormContext.Provider value={{ register, errors, handleFileChange, previews }}>
            <div className="min-h-screen bg-slate-50">
            <Meta title="Edit Trainer" description="Edit Trainer Details" />
            {/* Header */}
            <PageHeader
                title="Edit Trainer"
                subtitle="Update trainer details and permissions"
                icon={Users}
                compact={true}
                backTo="/trainers"
            />

            {/* Form Content */}
            <div className="max-w-none">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-[1600px] mx-auto">

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Left Column: Personal & Professional */}
                        <div className="space-y-8">
                            {/* Personal Details */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Personal Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-12 gap-6">
                                        <div className="col-span-3">
                                            <SelectField label="Prefix" name="prefix" options={PREFIX_OPTIONS} required />
                                        </div>
                                        <div className="col-span-9">
                                            <InputField label="Trainer Name" name="trainer_name" required placeholder="Full Name" />
                                        </div>
                                    </div>

                                    <InputField label="Email Address" name="email" type="text" required />

                                    <div className="grid grid-cols-2 gap-6">
                                        <SelectField label="Nationality" name="nationality" options={TRAINER_NATIONALITY_OPTIONS} required />
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 block text-xs">
                                                New Password (leave empty to keep current)
                                            </label>
                                            <PasswordInput
                                                {...register("password", {
                                                    minLength: { value: 8, message: "Password must be 8 to 16 characters" },
                                                    maxLength: { value: 16, message: "Password must be 8 to 16 characters" }
                                                })}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm h-auto"
                                                placeholder="New password"
                                            />
                                            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                                        </div>
                                    </div>
                                    <InputField label="Mobile Number" name="mobile" required placeholder="Phone/WhatsApp" />
                                </div>
                            </div>

                            {/* Professional Details */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                    Professional Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputField label="Designation" name="designation" required />
                                        <InputField label="Rank" name="rank" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Uploads & Actions */}
                        <div className="space-y-8">
                            {/* Uploads */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                    Uploads & Security
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                                        <FileInput label="Profile Photo (leave empty to keep current)" name="profile_photo" />
                                    </div>
                                    <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                                        <FileInput label="Digital Signature (leave empty to keep current)" name="digital_signature" />
                                    </div>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                                    Account Status
                                </h3>
                                <div className="flex items-center space-x-3 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">Status:</span>
                                    <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            {...register("status")}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 appearance-none cursor-pointer peer checked:translate-x-6 translate-x-0 border-slate-200 checked:border-green-400 transition-transform"
                                        />
                                        <div className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 peer-checked:bg-green-400 cursor-pointer"></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Active</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Inactive trainers cannot log in or be assigned to courses.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-8 -mb-8 flex justify-end">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/trainers')}
                                className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save size={18} />
                                <span>{isSubmitting ? 'Updating...' : 'Update Trainer'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            </div>
        </FormContext.Provider>
    );
};

export default EditTrainer;
