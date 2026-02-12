import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Users, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PasswordInput } from '../../components/ui/PasswordInput';

const EditTrainer = () => {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previews, setPreviews] = useState({ profile_photo: null, digital_signature: null });
    const navigate = useNavigate();
    const { id } = useParams();

    const handleFileChange = (name, e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [name]: url }));
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
                setValue('designation', trainer.designation || '');
                setValue('rank', trainer.rank || '');
                setValue('officer', trainer.officer || '');
                setValue('other_officer', trainer.other_officer || '');

                // Set existing image previews
                if (trainer.profile_photo) {
                    setPreviews(prev => ({ ...prev, profile_photo: `http://localhost:8000/uploads/trainer/${trainer.profile_photo}` }));
                }
                if (trainer.digital_signature) {
                    setPreviews(prev => ({ ...prev, digital_signature: `http://localhost:8000/uploads/trainer/${trainer.digital_signature}` }));
                }
            } catch (error) {
                console.error("Error fetching trainer:", error);
                toast.error("Failed to load trainer data.");
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
            toast.error(error.response?.data?.message || 'Failed to update trainer.');
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

    const FileInput = ({ label, name }) => {
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

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
                <p className="text-slate-500">Loading trainer data...</p>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-slate-50">
            <Meta title="Edit Trainer" description="Edit Trainer Details" />
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Users size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Edit Trainer</h1>
                            <p className="text-sm text-slate-500">Update trainer details and permissions</p>
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

                                    <InputField label="Email Address" name="email" type="email" required />

                                    <div className="grid grid-cols-2 gap-6">
                                        <SelectField label="Nationality" name="nationality" options={nationalities} required />
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 block text-xs">
                                                New Password (leave empty to keep current)
                                            </label>
                                            <PasswordInput
                                                {...register("password", {
                                                    minLength: { value: 6, message: "Min 6 characters" }
                                                })}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm h-auto"
                                                placeholder="New password"
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
                                    {/* <div className="grid grid-cols-2 gap-6">
                                        <InputField label="Officer" name="officer" placeholder="e.g. Deck Officer" />
                                        <InputField label="Other Officer" name="other_officer" placeholder="e.g. Safety Officer" />
                                    </div> */}
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
    );
};

export default EditTrainer;
