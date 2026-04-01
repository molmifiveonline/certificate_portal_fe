import React, { useEffect } from "react";
import { X, Mail, Shield, LogOut, User } from "lucide-react";

const UserProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const firstInitial = user?.first_name?.[0] || user?.name?.[0] || "U";
  const lastInitial = user?.last_name?.[0] || "S";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();
  const displayName =
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "User";
  const profileImage = user?.user_image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20 sm:pt-24"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden border border-white/40 animate-in slide-in-from-top-2 fade-in duration-200 mr-2 sm:mr-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-[#3a5f9e] to-[#6fa8dc] p-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
          >
            <X size={18} />
          </button>
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-3 ring-white/30">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{displayName}</h3>
              <span className="text-white/80 text-xs mt-0.5 capitalize bg-white/15 px-3 py-0.5 rounded-full">
                {user?.role || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Fields */}
        <div className="px-6 py-4 space-y-3 mt-4 mx-3 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-sm font-medium text-slate-700 truncate">
                {displayName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
              <Mail size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Email
              </p>
              <p className="text-sm font-medium text-slate-700 truncate">
                {user?.email || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg text-green-500">
              <Shield size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Role
              </p>
              <p className="text-sm font-medium text-slate-700 capitalize">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-6 py-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all active:scale-[0.98]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
