import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield, Users, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';

const Login = () => {
    // const [role, setRole] = useState('Candidate'); // Role is now coming from backend
    const [selectedRole, setSelectedRole] = useState('Candidate');
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // const [loginError, setLoginError] = useState(null); // Removed for toast
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const userData = await login(data.email, data.password);
            // Navigate based on returned role
            const role = userData.role; // Verify exact property name from AuthContext/Backend

            toast.success('Login Successful');

            if (role === 'SuperAdmin' || role === 'Admin' || role === 'admin') navigate('/dashboard/super-admin');
            else if (role === 'Trainer' || role === 'trainer') navigate('/dashboard/trainer');
            else navigate('/dashboard/candidate');

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const RoleOption = ({ value, label, icon: Icon }) => (
        <button
            type="button"
            onClick={() => setSelectedRole(value)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${selectedRole === value
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
        >
            <Icon size={24} className="mb-2" />
            <span className="text-sm font-semibold">{label}</span>
        </button>
    );


    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-200 items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorative Blobs to make Glassmorphism visible */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>

            <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-white/60 backdrop-blur-xl border border-white/40 h-[650px] z-10 transition-all duration-300">

                {/* Left Side - Hero Section with Logo */}
                <div className="hidden lg:flex lg:w-1/2 relative justify-center items-center p-12 bg-blue-800/85 transition-colors duration-500">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center items-center text-center">
                        <div className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl mb-8 shadow-inner border border-white/20">
                            <img
                                src="/mol-logo.png"
                                alt="MOLMI Logo"
                                className="w-48 h-auto object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        {/* <h2 className="text-white text-2xl font-bold tracking-wide">MOLMI</h2> */}
                        <p className="text-blue-100 mt-2 text-lg font-medium">Maritime Online Learning</p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white/40 backdrop-blur-md">
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center">
                            {/* <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2> */}
                            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                            <p className="mt-2 text-gray-600">Please select your role and sign in.</p>
                        </div>

                        {/* Role Selection */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <RoleOption value="Admin" label="Admin" icon={Shield} />
                            <RoleOption value="Trainer" label="Trainer" icon={Users} />
                            <RoleOption value="Candidate" label="Candidate" icon={User} />
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        {...register('email', { required: 'Email is required' })}
                                        className="w-full px-4 py-3 rounded-lg bg-white/70 border border-gray-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none shadow-sm"
                                        placeholder="name@company.com"
                                        defaultValue="molmi.admin@molgroup.com"
                                    />
                                    {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...register('password', { required: 'Password is required' })}
                                            className="w-full px-4 py-3 rounded-lg bg-white/70 border border-gray-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-100 transition-all outline-none shadow-sm"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
                                </div>
                            </div>

                            <div className={`flex items-center justify-between text-sm h-5 transition-all duration-300 ${selectedRole !== 'Candidate' ? 'invisible opacity-0' : 'visible opacity-100'}`}>
                                <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="text-blue-700 hover:underline font-medium">
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                                {!isSubmitting && <ArrowRight size={20} />}
                            </button>

                            <div className={`text-center pt-4 h-8 transition-all duration-300 ${selectedRole !== 'Candidate' ? 'invisible opacity-0' : 'visible opacity-100'}`}>
                                <p className="text-gray-600 text-sm">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-blue-700 font-bold hover:underline">
                                        Register Here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />
        </div>
    );
};

export default Login;
