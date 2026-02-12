import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, FileText, Briefcase, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { PasswordInput } from '../ui/PasswordInput';
import candidateService from '../../services/candidateService';
import { toast } from 'sonner';
import { MANAGER_OPTIONS } from '../../lib/constants';

const CandidateForm = ({ onSubmit, defaultValues = {}, isSubmitting: parentIsSubmitting, submitLabel = "Register Now", showPassword = true, isAdmin = false }) => {
    // Pre-process defaultValues for Manager "Others" case
    const formattedDefaultValues = { ...defaultValues };
    if (formattedDefaultValues.manager && !MANAGER_OPTIONS.some(o => o.value === formattedDefaultValues.manager)) {
        formattedDefaultValues.otherManager = formattedDefaultValues.manager;
        formattedDefaultValues.manager = "Others";
    }

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: formattedDefaultValues
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const profileImage = watch("profileImage");
    const employeeType = watch("employeeType");
    const selectedManager = watch("manager");

    // If parent handles submission state, use it, otherwise local (though for now we assume parent handles it)
    const isSubmitting = parentIsSubmitting;

    const handleFormSubmit = (data) => {
        // Post-process data for Manager "Others" case
        if (data.manager === "Others" && data.otherManager) {
            data.manager = data.otherManager;
        }
        delete data.otherManager; // Clean up aux field
        onSubmit(data);
    };

    console.log("CandidateForm Debug:", { isAdmin, showPassword, showResetPassword });

    const SectionHeader = ({ title, icon: Icon }) => (
        <div className="flex items-center space-x-2 border-b pb-2 mb-6 mt-2 relative">
            <div className="absolute -bottom-[9px] left-0 w-12 h-0.5 bg-blue-600"></div>
            {Icon && <Icon size={20} className="text-blue-600" />}
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
        </div>
    );

    const InputField = ({ label, name, type = "text", required, rules, placeholder, className }) => (
        <div className={`space-y-1 ${className}`}>
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false, ...rules })}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                placeholder={placeholder || ""}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const SelectField = ({ label, name, required, options, className }) => (
        <div className={`space-y-1 ${className}`}>
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    {...register(name, { required: required ? `${label} is required` : false })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                >
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const data = await candidateService.uploadProfileImage(file);
            // Set the full URL or relative path depending on how backend returns and frontend displays
            // Assuming backend returns relative path like /uploads/candidate-profiles/filename.jpg
            // And we need to prepend API URL if it's not proxied, or use as is if served from same domain.
            // For now storing relative path.
            setValue("profileImage", data.filePath);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">

            {/* Employee Type Toggle */}
            <div className="flex justify-center mb-10">
                <div className="bg-gray-100 p-1.5 rounded-lg inline-flex">
                    <label className="cursor-pointer">
                        <input type="radio" value="MOLMI Employee" {...register("employeeType")} defaultChecked className="peer sr-only" />
                        <span className="px-6 py-2 rounded-md text-sm font-semibold text-gray-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all block">MOLMI Employee</span>
                    </label>
                    <label className="cursor-pointer ml-1">
                        <input type="radio" value="Others" {...register("employeeType")} className="peer sr-only" />
                        <span className="px-6 py-2 rounded-md text-sm font-semibold text-gray-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all block">Others</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* Column 1: Personal & ID */}
                <div className="md:col-span-6 space-y-8">
                    <div>
                        <SectionHeader title="Identification" icon={Briefcase} />
                        <div className="grid grid-cols-2 gap-4">
                            {employeeType !== 'Others' && <InputField label="Employee ID" name="employeeId" required />}
                            <InputField label="Passport Number" name="passportNumber" required />
                            <InputField label="INDOS No." name="indosNo" placeholder="(For Indian Seafarers)" className="col-span-2" />
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Professional Info" icon={FileText} />
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField label="Rank On Vessel" name="rank" required options={[{ value: 'Captain', label: 'Captain' }, { value: 'Chief Officer', label: 'Chief Officer' }]} />
                                <SelectField label="Manager" name="manager" options={MANAGER_OPTIONS} />
                                {selectedManager === 'Others' && (
                                    <InputField label="Specify Manager" name="otherManager" required placeholder="Enter Manager Name" className="col-span-2" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Contact Info" />
                        <div className="space-y-4">
                            <InputField label="Email Address" name="email" type="email" required />

                            {/* Password Section */}
                            {(showPassword || showResetPassword) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 block">
                                            {showResetPassword ? "New Password" : "Password"} <span className="text-red-500">*</span>
                                        </label>
                                        <PasswordInput
                                            {...register("password", {
                                                required: (showPassword || showResetPassword) ? "Password is required" : false,
                                                minLength: { value: 6, message: "Password must be at least 6 characters" }
                                            })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm h-auto"
                                            placeholder={showResetPassword ? "Enter new password" : "Enter password"}
                                        />
                                        {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 block">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <PasswordInput
                                            {...register("confirmPassword", {
                                                required: (showPassword || showResetPassword) ? "Confirm Password is required" : false,
                                                validate: (val, formValues) => {
                                                    if (showPassword || showResetPassword) {
                                                        return val === formValues.password || "Passwords do not match";
                                                    }
                                                    return true;
                                                }
                                            })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm h-auto"
                                            placeholder="Confirm password"
                                        />
                                        {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Reset Password Button for Admin Edit */}
                            {isAdmin && !showPassword && !showResetPassword && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowResetPassword(true)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            )}

                            {/* Cancel Reset Password */}
                            {isAdmin && !showPassword && showResetPassword && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetPassword(false);
                                            setValue("password", "");
                                            setValue("confirmPassword", "");
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                                    >
                                        Cancel Password Reset
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="WhatsApp Number" name="whatsapp" required placeholder="Primary Mobile" />
                                <InputField label="Alternate Number" name="alternateNumber" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Personal & Contact */}
                <div className="md:col-span-6 space-y-8">
                    <div>
                        <SectionHeader title="Personal Details" icon={User} />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <SelectField label="Prefix" name="prefix" required options={[{ value: 'Mr', label: 'Mr' }, { value: 'Ms', label: 'Ms' }, { value: 'Capt', label: 'Capt' }]} className="md:col-span-1" />
                            <InputField label="First Name" name="firstName" required className="md:col-span-3" />
                            <InputField label="Middle Name" name="middleName" className="md:col-span-2" />
                            <InputField label="Last Name" name="lastName" required className="md:col-span-2" />
                            <SelectField label="Gender" name="gender" required options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} className="md:col-span-2" />
                            <InputField label="Date of Birth" name="dob" type="date" required className="md:col-span-2" />
                            <SelectField label="Nationality" name="nationality" required options={[{ value: 'Indian', label: 'Indian' }, { value: 'Filipino', label: 'Filipino' }, { value: 'Others', label: 'Others' }]} className="md:col-span-2" />
                            <InputField label="Seaman Book No." name="seamanBookNo" className="md:col-span-2" />

                            <div className="md:col-span-4 space-y-1">
                                <label className="text-sm font-medium text-gray-700 block">Profile Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                        {profileImage ? (
                                            <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-400 w-8 h-8" />
                                        )}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors">
                                            <Upload size={16} />
                                            <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF. Max size: 5MB.</p>
                                        <input type="hidden" {...register("profileImage")} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Vessel & Experience" icon={Briefcase} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Designation" name="designation" />
                            <InputField label="Vessel Type" name="vesselType" />
                            <InputField label="Last Vessel Name" name="lastVesselName" />
                            <InputField label="Next Vessel Name" name="nextVesselName" />
                            <InputField label="Manning Company" name="manningCompany" />
                            <InputField label="Officer" name="officer" required />
                            <InputField label="Sign On Date" name="signOnDate" type="date" />
                            <InputField label="Sign Off Date" name="signOffDate" type="date" />
                        </div>
                    </div>

                    {/* Admin Status Section */}
                    {isAdmin && (
                        <div>
                            <SectionHeader title="Account Status" />
                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            {...register("status")}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer peer checked:right-0 right-6"
                                        />
                                        <div className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 peer-checked:bg-green-400 cursor-pointer"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {watch("status") ? "Active" : "Inactive"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Declaration */}
            <div className="mt-10 pt-6 border-t border-gray-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input type="checkbox" {...register("declaration", { required: true })} className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                        <svg className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-gray-700 leading-relaxed">
                        I hereby declare that all the information provided in this form is true and can be used by MOLMI for training purposes. This information will be subject to data protection as per the MOLMI data protection policy.
                    </span>
                </label>
                {errors.declaration && <p className="text-red-500 text-xs mt-2">You must accept the declaration</p>}

                <div className="mt-8 flex flex-col items-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-10 py-3.5 rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 w-full md:w-auto text-lg flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <span>{isSubmitting ? 'Processing...' : submitLabel}</span>
                        {!isSubmitting && <ArrowRight size={20} />}
                    </button>
                </div>
            </div>

        </form>
    );
};

export default CandidateForm;
