import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import api from '../../lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import CandidateForm from '../../components/candidates/CandidateForm';
import Meta from '../../components/common/Meta';

const Register = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // Map frontend fields (camelCase) to backend fields (snake_case)
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                middle_name: data.middleName,
                email: data.email,
                // password: data.password, // Removed for self-registration
                mobile: data.whatsapp, // Using whatsapp as primary mobile
                prefix: data.prefix,
                gender: data.gender,
                dob: data.dob,
                nationality: data.nationality,
                passport_no: data.passportNumber,
                employee_id: data.employeeId,
                manager: data.manager,
                other_manager: null, // Default or add field if needed
                rank: data.rank,
                other_rank: null,
                whatsapp_number: data.whatsapp,
                alternate_mobile: data.alternateNumber,
                indos_number: data.indosNo,
                registration_type: data.employeeType,
                designation: data.designation,
                vessel_type: data.vesselType,
                last_vessel_name: data.lastVesselName,
                next_vessel_name: data.nextVesselName,
                manning_company: data.manningCompany,
                sign_on_date: data.signOnDate,
                sign_off_date: data.signOffDate,
                officer: data.officer,
                seaman_book_no: data.seamanBookNo,
                profile_image: data.profileImage
            };

            await api.post('/auth/register/candidate', payload);

            toast.success("Registration Successful! Please check your email to set your password.");
            navigate('/login');
        } catch (error) {
            console.error("Registration Error:", error);
            toast.error(error.response?.data?.message || "Registration failed. Please try again.");
            // Scroll to top to show error (optional, but good UX)
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-200 py-10 px-4 md:px-8 font-sans relative overflow-hidden">
            <Meta title="Register" description="Register a new account" />

            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>

            {/* Nav */}
            <div className="max-w-6xl mx-auto mb-6 flex items-center relative z-10">
                <Link to="/login" className="flex items-center text-gray-600 hover:text-blue-700 transition-colors bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-white/40">
                    <ChevronLeft size={20} />
                    <span className="ml-1 font-medium">Back to Login</span>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/40 relative z-10 transition-all duration-300">
                {/* Header */}
                <div className="bg-blue-800/85 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Registration</h1>
                        <p className="text-blue-100 opacity-80">Create your account to access the portal.</p>
                    </div>
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
                    </div>
                </div>

                <div className="p-8 md:p-12 bg-white/40 backdrop-blur-md">
                    <CandidateForm onSubmit={onSubmit} isSubmitting={isSubmitting} submitLabel="Register Now" showPassword={false} />
                </div>
            </div>
        </div>
    );
};

export default Register;
