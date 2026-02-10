import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Users, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateTrainer = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('first_name', data.first_name);
            formData.append('last_name', data.last_name);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('mobile', data.mobile);
            formData.append('prefix', data.prefix);
            formData.append('officer', data.officer);
            formData.append('other_officer', data.other_officer);
            formData.append('designation', data.designation);
            formData.append('nationality', data.nationality);
            formData.append('rank', data.rank);
            formData.append('specialization', data.specialization);

            if (data.digital_signature[0]) {
                formData.append('digital_signature', data.digital_signature[0]);
            }
            if (data.profile_photo[0]) {
                formData.append('profile_photo', data.profile_photo[0]);
            }

            await api.post('/trainer/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Trainer created successfully!');
            reset();
            navigate('/trainers');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create trainer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, name, type = "text", required, rules, placeholder }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false, ...rules })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                placeholder={placeholder}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const FileInput = ({ label, name, required }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="file"
                accept="image/*"
                {...register(name, { required: required ? `${label} is required` : false })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none text-sm"
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const SelectField = ({ label, name, options, required }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...register(name, { required: required ? `${label} is required` : false })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none text-sm"
            >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users size={24} />
                        <h1 className="text-xl font-bold">Create New Trainer</h1>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Personal Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <SelectField label="Prefix" name="prefix" options={["Mr", "Mrs", "Ms", "Dr", "Capt"]} required />
                                    <InputField label="First Name" name="first_name" required />
                                    <InputField label="Last Name" name="last_name" required />
                                </div>
                                <InputField label="Email Address" name="email" type="email" required />
                                <InputField label="Mobile Number" name="mobile" required />
                                <InputField label="Nationality" name="nationality" required />
                            </div>

                            {/* Professional Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Professional Details</h3>
                                <SelectField label="Officer Type" name="officer" options={["Deck Officer", "Engine Officer", "Other"]} required />
                                <InputField label="Other Officer (if Other)" name="other_officer" />
                                <InputField label="Designation" name="designation" required />
                                <InputField label="Rank" name="rank" required />
                                <InputField label="Specialization" name="specialization" />
                            </div>

                            {/* Uploads & Security */}
                            <div className="space-y-4 col-span-2">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Uploads & Security</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FileInput label="Profile Photo" name="profile_photo" />
                                    <FileInput label="Digital Signature" name="digital_signature" />
                                    <InputField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        required
                                        rules={{ minLength: { value: 6, message: "Min 6 characters" } }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save size={18} />
                                <span>{isSubmitting ? 'Creating Trainer...' : 'Create Trainer'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTrainer;
