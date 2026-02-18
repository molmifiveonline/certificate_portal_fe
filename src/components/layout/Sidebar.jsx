import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, ChevronRight, Dot } from "lucide-react";
import { cn } from "../../lib/utils/utils";
import { MenuItems } from "../../lib/utils/menu";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";

// Mock useMedia hook
const useMedia = () => {
    const getIconUrl = (name) => {
        // Assuming logo is available in public or we use a text fallback
        if (name.includes('logo')) return '/logo.svg';
        return '/favicon.ico';
    };
    return { getIconUrl };
};

// Mock useToast hook
const useToast = () => {
    return { showSuccessToast: (msg) => console.log(msg) };
};

const Sidebar = () => {
    const { isOpen, setIsOpen } = useLayout();
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showSuccessToast } = useToast();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (title) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    // Filter menu items based on user role and permissions
    const visibleItems = MenuItems.filter((item) => {
        // If no allowedRoles specified, show to everyone
        if (!item.allowedRoles) {
            return true;
        }
        // Check if user's role is in the allowedRoles array
        if (!user?.role) return false;

        // Use simpler check to handle various cases if needed
        const userRole = user.role.toLowerCase();
        const hasRole = item.allowedRoles.some(role => role.toLowerCase() === userRole);

        // If there's a requiredPermission, also check if user has that permission
        if (item.requiredPermission) {
            const userPermissions = user.permissions || [];
            const hasPermission = userPermissions.includes(item.requiredPermission);
            return hasRole && hasPermission;
        }

        return hasRole;
    });

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
        showSuccessToast("Logged out successfully");
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    const isLinkActive = (url) => {
        if (url === '/') {
            return location.pathname === '/' || location.pathname.startsWith('/dashboard');
        }
        return location.pathname === url || location.pathname.startsWith(`${url}/`);
    };

    return (
        <>
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out z-50 flex flex-col bg-white border-r border-slate-200 shadow-xl md:shadow-sm",
                    isOpen
                        ? "w-64 translate-x-0"
                        : "w-64 -translate-x-full md:w-20 md:translate-x-0 md:overflow-hidden"
                )}
            >
                {/* Logo Header */}
                <Link
                    to="/"
                    className="flex items-center justify-center py-6 hover:opacity-80 transition-opacity cursor-pointer border-b border-slate-100"
                >
                    {isOpen ? (
                        <img
                            src="/mol-logo.png"
                            alt="MOL Logo"
                            className="h-12 w-auto transition-all duration-300 object-contain px-4"
                        />
                    ) : (
                        <img
                            src="/mol-logo.png"
                            alt="MOL"
                            className="h-8 w-auto transition-all duration-300 object-contain"
                        />
                    )}
                </Link>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isExpanded = expandedMenus[item.title];

                        // Check if any subitem is active to highlight parent
                        const isParentActive = hasSubItems && item.subItems.some(sub => isLinkActive(sub.url));
                        const isActive = !hasSubItems && isLinkActive(item.url);

                        const handleNavClick = () => {
                            if (window.innerWidth < 768 && !hasSubItems) {
                                setIsOpen(false);
                            }
                        };

                        return (
                            <div key={item.title}>
                                {hasSubItems ? (
                                    <div
                                        onClick={() => {
                                            if (!isOpen) setIsOpen(true);
                                            toggleMenu(item.title);
                                        }}
                                        className={cn(
                                            "flex items-center py-3 rounded-lg transition-all duration-200 group relative cursor-pointer select-none",
                                            isOpen
                                                ? "px-4 gap-3 justify-between"
                                                : "justify-center",
                                            (isActive || isParentActive)
                                                ? "text-[#3a5f9e] bg-slate-50"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-[#3a5f9e]",
                                        )}
                                    >
                                        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
                                            <Icon
                                                className={cn(
                                                    "transition-all duration-200 shrink-0",
                                                    (isActive || isParentActive)
                                                        ? "text-[#3a5f9e]"
                                                        : "text-slate-500 group-hover:text-[#3a5f9e]",
                                                )}
                                                size={22}
                                            />
                                            {isOpen && (
                                                <span className="text-sm font-medium transition-all duration-200 whitespace-nowrap">
                                                    {item.title}
                                                </span>
                                            )}
                                        </div>
                                        {isOpen && (
                                            <div className="text-slate-400">
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.url}
                                        onClick={handleNavClick}
                                        className={cn(
                                            "flex items-center py-3 rounded-lg transition-all duration-200 group relative",
                                            isOpen
                                                ? "px-4 gap-3 justify-start"
                                                : "justify-center",
                                            isActive
                                                ? "bg-[#3a5f9e] text-white shadow-md shadow-blue-900/10"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-[#3a5f9e]",
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "transition-all duration-200 shrink-0",
                                                isActive
                                                    ? "text-white"
                                                    : "text-slate-500 group-hover:text-[#3a5f9e]",
                                            )}
                                            size={22}
                                        />
                                        {isOpen && (
                                            <span
                                                className={cn(
                                                    "text-sm transition-all duration-200 whitespace-nowrap",
                                                    isActive ? "font-semibold" : "font-medium",
                                                )}
                                            >
                                                {item.title}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Submenu */}
                                {hasSubItems && isOpen && isExpanded && (
                                    <div className="mt-1 ml-4 border-l border-slate-200 pl-2 space-y-1">
                                        {item.subItems.map((subItem) => {
                                            const isSubActive = isLinkActive(subItem.url);
                                            return (
                                                <Link
                                                    key={subItem.title}
                                                    to={subItem.url}
                                                    onClick={() => {
                                                        if (window.innerWidth < 768) setIsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                                                        isSubActive
                                                            ? "text-[#3a5f9e] bg-blue-50 font-medium"
                                                            : "text-slate-500 hover:text-[#3a5f9e] hover:bg-slate-50"
                                                    )}
                                                >
                                                    {/* Optional: Add a small dot or icon for deeper nesting */}
                                                    {/* <Dot size={16} className="mr-2" /> */}
                                                    {subItem.title}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
                {/* Logout Button at Bottom */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center py-2.5 rounded-lg transition-all duration-200 w-full group",
                            isOpen ? "px-4 gap-3 justify-start" : "justify-center",
                            "text-slate-500 hover:bg-red-50 hover:text-red-600",
                        )}
                    >
                        <LogOut
                            className="text-slate-500 group-hover:text-red-500 transition-colors shrink-0"
                            size={20}
                        />
                        {isOpen && (
                            <span className="font-medium text-sm transition-colors whitespace-nowrap">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
