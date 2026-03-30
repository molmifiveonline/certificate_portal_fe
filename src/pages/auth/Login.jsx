import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Shield, Users, User, ArrowRight } from "lucide-react";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal";
import Meta from "../../components/common/Meta";

const Login = () => {
  // const [role, setRole] = useState('Candidate'); // Role is now coming from backend
  const [selectedRole, setSelectedRole] = useState("Candidate");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  // const [showPassword, setShowPassword] = useState(false); // Managed by PasswordInput
  // const [loginError, setLoginError] = useState(null); // Removed for toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Map selected tab to accepted backend role names (lowercase)
  const ROLE_TAB_MAP = {
    Admin: ["superadmin", "admin"],
    Trainer: ["trainer"],
    Candidate: ["candidate"],
  };

  const ROLE_INDEX_MAP = {
    Admin: 0,
    Trainer: 1,
    Candidate: 2,
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const userData = await login(data.email, data.password);
      const role = userData.role; // role name returned from backend
      const roleLower = (role || "").toLowerCase();

      // Validate that the user's actual role matches the selected tab
      const allowedRoles = ROLE_TAB_MAP[selectedRole] || [];
      if (!allowedRoles.includes(roleLower)) {
        // Clear the session that login() just persisted
        logout();
        toast.error(
          `This account does not have ${selectedRole} access. Please select the correct login tab.`,
        );
        return;
      }

      toast.success("Login Successful");

      if (roleLower === "superadmin" || roleLower === "admin")
        navigate("/dashboard/super-admin");
      else if (roleLower === "trainer") navigate("/dashboard/trainer");
      else navigate("/dashboard/candidate");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleOption = ({ value, label, icon: Icon, showDivider }) => (
    <div className="flex-1 flex items-center">
      <button
        type="button"
        onClick={() => setSelectedRole(value)}
        className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-500 z-10 relative ${
          selectedRole === value
            ? "text-white"
            : "text-gray-500 hover:text-blue-600 hover:bg-white/50"
        }`}
      >
        <Icon
          size={22}
          className={`mb-1.5 transition-transform duration-500 ${selectedRole === value ? "scale-110" : "scale-100"}`}
        />
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      </button>
      {showDivider && (
        <div className="h-8 w-[1.5px] bg-gray-300/50 rounded-full mx-0.5 self-center" />
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-200 items-center justify-center p-4 relative overflow-hidden">
      <Meta title="Login" description="Login to Employee Management System" />

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
            <p className="text-blue-100 mt-2 text-lg font-medium">
              Maritime Online Learning
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white/40 backdrop-blur-md">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              {/* <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2> */}
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-gray-600">
                Please select your role and sign in.
              </p>
            </div>

            {/* Role Selection Tabs with Sliding Indicator and Dividers */}
            <div className="relative mt-8">
              <div className="flex p-1 bg-gray-100/80 rounded-2xl border border-gray-200 shadow-inner overflow-hidden">
                {/* Sliding Background Indicator */}
                <div
                  className="absolute top-1 bottom-1 left-1 w-[calc(33.33%-2.67px)] bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{
                    transform: `translateX(${ROLE_INDEX_MAP[selectedRole] * 100}%)`,
                  }}
                />

                <RoleOption
                  value="Admin"
                  label="Admin"
                  icon={Shield}
                  showDivider={true}
                />
                <RoleOption
                  value="Trainer"
                  label="Trainer"
                  icon={Users}
                  showDivider={true}
                />
                <RoleOption
                  value="Candidate"
                  label="Candidate"
                  icon={User}
                  showDivider={false}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className={`w-full px-4 py-3 rounded-lg bg-white/70 border ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none shadow-sm`}
                    placeholder="name@company.com"
                    defaultValue="molmi.admin@molgroup.com"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Password
                  </label>
                  <PasswordInput
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`w-full px-4 py-3 rounded-lg bg-white/70 border ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none shadow-sm h-auto`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div
                className={`flex items-center justify-between text-sm h-5 transition-all duration-500 ${selectedRole !== "Candidate" ? "invisible opacity-0 -translate-y-2" : "visible opacity-100 translate-y-0"}`}
              >
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-blue-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white font-bold py-3.5 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
                {!isSubmitting && <ArrowRight size={20} />}
              </button>

              <div
                className={`text-center pt-4 h-8 transition-all duration-500 ${selectedRole !== "Candidate" ? "invisible opacity-0 translate-y-2" : "visible opacity-100 translate-y-0"}`}
              >
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-700 font-bold hover:underline"
                  >
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
