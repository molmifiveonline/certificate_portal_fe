import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Users, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '../../components/ui/PasswordInput';

const CreateTrainer = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previews, setPreviews] = useState({ profile_photo: null, digital_signature: null });
    const navigate = useNavigate();

    const handleFileChange = (name, e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [name]: url }));
        } else {
            setPreviews(prev => ({ ...prev, [name]: null }));
        }
    };

    const nationalities = [
        "Afghani", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguans", "Argentinean", "Armenian", "Australian",
        "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Barbudans", "Batswana", "Belarusian", "Belgian",
        "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe",
        "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese",
        "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djibouti",
        "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian",
        "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek",
        "Grenadian", "Guatemalan", "Guinea-Bissauan", "Guinean", "Guyanese", "Haitian", "Herzegovinian", "Honduran", "Hungarian", "Icelander",
        "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese",
        "Jordanian", "Kazakhstani", "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian",
        "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian",
        "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan",
        "Mosotho", "Motswana", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Ni-Vanuatu", "Nicaraguan", "Nigerian",
        "Nigerien", "North Korean", "Northern Irish", "Norwegian", "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan",
        "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan",
        "San Marinese", "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian",
        "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer",
        "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan",
        "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese",
        "Welsh", "Yemenite", "Zambian", "Zimbabwean"
    ];

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Split name into first and last name for backend compatibility
            const nameParts = data.trainer_name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            formData.append('first_name', firstName);
            formData.append('last_name', lastName); // Backend expects last_name
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('prefix', data.prefix);

            formData.append('officer', data.officer);
            formData.append('other_officer', data.other_officer);
            formData.append('designation', data.designation);
            formData.append('nationality', data.nationality);
            formData.append('rank', data.rank);

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

    const FileInput = ({ label, name, required }) => {
        const { ref, ...rest } = register(name, { required: required ? `${label} is required` : false });
        return (
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="file"
                    accept="image/*"
                    ref={ref}
                    {...rest}
                    onChange={(e) => {
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
                {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
            </div>
        );
    };

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
        <div className="min-h-screen bg-slate-50">
            <Meta title="Create Trainer" description="Create New Trainer" />
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Users size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Create New Trainer</h1>
                            <p className="text-sm text-slate-500">Fill in the details to register a new trainer</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/trainers')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to List
                    </button>
                </div>
            </div>

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
                                            <SelectField label="Prefix" name="prefix" options={["Mr", "Mrs", "Ms", "Dr", "Capt"]} required />
                                        </div>
                                        <div className="col-span-9">
                                            <InputField label="Trainer Name" name="trainer_name" required placeholder="Full Name" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <InputField label="Email Address" name="email" type="email" required />
                                        <SelectField label="Nationality" name="nationality" options={nationalities} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 block">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <PasswordInput
                                                {...register("password", {
                                                    required: "Password is required",
                                                    minLength: { value: 6, message: "Min 6 characters" }
                                                })}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm h-auto"
                                                placeholder="Enter password"
                                            />
                                            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                                        </div>
                                    </div>
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
                                    {/* <div className="grid grid-cols-2 gap-6">
                                        <InputField label="Officer" name="officer" placeholder="e.g. Deck Officer" />
                                        <InputField label="Other Officer" name="other_officer" placeholder="e.g. Safety Officer" />
                                    </div> */}
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
                                        <FileInput label="Profile Photo" name="profile_photo" required={true} />
                                    </div>
                                    <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                                        <FileInput label="Digital Signature" name="digital_signature" required={true} />
                                    </div>
                                </div>
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
                                <span>{isSubmitting ? 'Creating...' : 'Create Trainer'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrainer;
