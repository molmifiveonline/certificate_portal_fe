import React, { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import UserProfileModal from './UserProfileModal';
import notificationService from '../../services/notificationService';

const Navbar = () => {
    const { toggleSidebar } = useLayout();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const role = user?.role?.toLowerCase();
    const isAdminUser = role === 'admin' || role === 'superadmin';

    useEffect(() => {
        let ignore = false;

        const loadNotificationCount = async () => {
            if (!isAdminUser) {
                setNotificationCount(0);
                return;
            }

            try {
                const response = await notificationService.getAdminNotifications();
                if (!ignore) {
                    setNotificationCount(response?.summary?.totalPending || 0);
                }
            } catch (error) {
                if (!ignore) {
                    setNotificationCount(0);
                }
            }
        };

        loadNotificationCount();

        return () => {
            ignore = true;
        };
    }, [isAdminUser]);

    const getInitials = () => {
        const firstInitial = user?.first_name?.[0] || user?.name?.[0] || 'U';
        const lastInitial = user?.last_name?.[0] || 'S';
        return `${firstInitial}${lastInitial}`.toUpperCase();
    };

    const profileImage = user?.user_image;

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
        navigate('/auth/login');
    };

    return (
        <>
            <div className='flex justify-between items-center py-2 px-3 sm:py-3 sm:px-4 z-20 mt-2 sm:mt-4 mx-2 sm:mr-4 sm:ml-4 rounded-2xl sm:rounded-3xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-xl'>
                <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className='p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 active:bg-gray-200'
                    >
                        <Menu className='w-6 h-6' />
                    </button>

                    {/* Greeting */}
                    <div className="flex flex-col">
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                            Hi, <span className="hidden sm:inline">{user?.name || user?.first_name || 'User'}</span> <span className="animate-wave origin-[70%_70%]">👋</span>
                        </h1>
                    </div>
                </div>

                {/* Right Side Icons */}
                <div className='flex items-center gap-2 sm:gap-4'>
                    {isAdminUser && (
                        <button
                            type="button"
                            onClick={() => navigate('/admin/notifications')}
                            className='relative flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/60 text-slate-600 shadow-sm transition hover:bg-white hover:text-[#3a5f9e]'
                            title="Notifications"
                            aria-label={`Notifications${notificationCount ? `, ${notificationCount} pending` : ''}`}
                        >
                            <Bell className='h-5 w-5' />
                            {notificationCount > 0 && (
                                <span className='absolute -right-1 -top-1 min-w-[1.2rem] rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow'>
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* User Info */}
                    <div className='flex items-center gap-3'>
                        <div className='text-right hidden sm:block'>
                            <p className='text-sm font-bold text-slate-700 leading-none mb-1'>
                                {user?.name || user?.first_name || 'User'}
                            </p>
                            <p className='text-xs text-blue-600 font-semibold capitalize bg-blue-50 px-2 py-0.5 rounded-full inline-block'>
                                {user?.role || 'User'}
                            </p>
                        </div>

                        {/* Profile Photo */}
                        <div className='relative'>
                            <div
                                onClick={() => setIsProfileOpen(true)}
                                className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#3a5f9e] to-[#6fa8dc] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg ring-2 ring-white cursor-pointer hover:scale-105 transition-transform'
                            >
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="User"
                                        className='w-full h-full rounded-full object-cover'
                                    />
                                ) : (
                                    <span>{getInitials()}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onLogout={handleLogout}
            />
        </>
    );
};

export default Navbar;
