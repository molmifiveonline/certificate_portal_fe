import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, ChevronRight, Dot } from "lucide-react";
import { cn } from "../../lib/utils/utils";
import { MenuItems } from "../../lib/utils/menu";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip";

// Mock useMedia hook
// const useMedia = () => {
//     const getIconUrl = (name) => {
//         // Assuming logo is available in public or we use a text fallback
//         if (name.includes('logo')) return '/logo.svg';
//         return '/favicon.ico';
//     };
//     return { getIconUrl };
// };

// Mock useToast hook
const useToast = () => {
    return { showSuccessToast: (msg) => console.log(msg) };
};

const TooltipWrapper = ({ isOpen, title, children }) => {
    if (isOpen) return children;
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent 
                side="right" 
                className="font-medium bg-[#3a5f9e] text-white border-none shadow-md dark:bg-[#3a5f9e] dark:text-white"
            >
                {title}
            </TooltipContent>
        </Tooltip>
    );
};

const Sidebar = () => {
    const { isOpen, setIsOpen } = useLayout();
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showSuccessToast } = useToast();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (title) => {
        setExpandedMenus((prev) => {
            const isCurrentlyOpen = prev[title];
            // Close all other menus, only keep the toggled one open
            if (isCurrentlyOpen) {
                // If closing the current menu, just close it
                return { ...prev, [title]: false };
            }
            // If opening a new menu, close all others
            const newState = {};
            newState[title] = true;
            return newState;
        });
    };

    // Filter menu items based on user role and permissions
    const visibleItems = MenuItems.filter((item) => {
        // If no allowedRoles specified, show to everyone
        if (!item.allowedRoles) {
            return true;
        }
        // Check if user's role is in the allowedRoles array
        if (!user?.role) return false;

        const userRole = user.role.toLowerCase();
        const hasRole = item.allowedRoles.some(role => role.toLowerCase() === userRole);
        if (!hasRole) return false;

        // For admin users with an assigned admin_role (adminRolePermissions is an array, not null):
        // only show items where their slug is in the adminRolePermissions list.
        // SuperAdmins (adminRolePermissions === null) always see everything.
        // Admins without an assigned role (adminRolePermissions === null) also see everything.
        const adminRolePermissions = user.adminRolePermissions; // null = unrestricted, array = restricted
        if (adminRolePermissions !== null && adminRolePermissions !== undefined && userRole === 'admin') {
            if (item.permissionSlug) {
                // Home has no permissionSlug — always visible
                return adminRolePermissions.includes(item.permissionSlug);
            }
            // Items without permissionSlug (e.g. Home) are always shown
            return true;
        }

        // Legacy: trainer/candidate permission check
        if (item.requiredPermission) {
            const userPermissions = user.permissions || [];
            const hasPermission = userPermissions.includes(item.requiredPermission);
            return hasPermission;
        }

        return true;
    });

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
        showSuccessToast("Logged out successfully");
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    const isLinkActive = (url, siblings = []) => {
        if (url === '/') {
            return location.pathname === '/' || location.pathname.startsWith('/dashboard');
        }

        const isBaseMatch = location.pathname === url || location.pathname.startsWith(`${url}/`);
        if (!isBaseMatch) return false;

        // If there's a more specific (longer) match among siblings, this one is not the "active" one
        const hasBetterMatch = siblings.some(siblingUrl => {
            if (!siblingUrl || siblingUrl === url) return false;
            return siblingUrl.length > url.length &&
                (location.pathname === siblingUrl || location.pathname.startsWith(`${siblingUrl}/`));
        });

        return !hasBetterMatch;
    };

    useEffect(() => {
        visibleItems.forEach(item => {
            if (item.subItems && item.subItems.length > 0) {
                const subItemUrls = item.subItems.map(i => i.url);
                const isParentActive = item.subItems.some(sub => isLinkActive(sub.url, subItemUrls));
                if (isParentActive) {
                    setExpandedMenus(prev => {
                        if (prev[item.title]) return prev;
                        return { ...prev, [item.title]: true };
                    });
                }
            }
        });
    }, [location.pathname]);

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
                <TooltipProvider delayDuration={200}>
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

                        const topLevelUrls = visibleItems.map(i => i.url);
                        const subItemUrls = item.subItems?.map(i => i.url) || [];

                        // Check if any subitem is active to highlight parent
                        const isParentActive = hasSubItems && item.subItems.some(sub => isLinkActive(sub.url, subItemUrls));
                        const isActive = !hasSubItems && isLinkActive(item.url, topLevelUrls);

                        const handleNavClick = () => {
                            // Close all expanded submenus when navigating to a different module
                            if (!hasSubItems) {
                                setExpandedMenus({});
                            }
                            if (window.innerWidth < 768 && !hasSubItems) {
                                setIsOpen(false);
                            }
                        };

                        return (
                            <div key={item.title}>
                                {hasSubItems ? (
                                    <TooltipWrapper title={item.title} isOpen={isOpen}>
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
                                                ? "bg-gradient-to-r from-[#3a5f9e] via-[#4c78c7] to-[#2b4b80] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                                                : "text-slate-600 hover:bg-[#3a5f9e]/5 hover:text-[#3a5f9e] hover:shadow-[0_2px_8px_rgba(58,95,158,0.05)] hover:translate-x-1",
                                        )}
                                    >
                                        {(isActive || isParentActive) && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#3a5f9e] to-[#4c78c7] rounded-lg blur-lg opacity-50 -z-10" />
                                        )}
                                        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
                                            <Icon
                                                className={cn(
                                                    "transition-all duration-200 shrink-0",
                                                    (isActive || isParentActive)
                                                        ? (!isOpen ? "text-white" : "text-[#3a5f9e]")
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
                                    </TooltipWrapper>
                                ) : (
                                    <TooltipWrapper title={item.title} isOpen={isOpen}>
                                    <Link
                                        to={item.url}
                                        onClick={handleNavClick}
                                        className={cn(
                                            "flex items-center py-3 rounded-lg transition-all duration-200 group relative",
                                            isOpen
                                                ? "px-4 gap-3 justify-start"
                                                : "justify-center",
                                            isActive
                                                ? "bg-gradient-to-r from-[#3a5f9e] via-[#4c78c7] to-[#2b4b80] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                                                : "text-slate-600 hover:bg-[#3a5f9e]/5 hover:text-[#3a5f9e] hover:shadow-[0_2px_8px_rgba(58,95,158,0.05)] hover:translate-x-1",
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#3a5f9e] to-[#4c78c7] rounded-lg blur-lg opacity-50 -z-10" />
                                        )}
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
                                    </TooltipWrapper>
                                )}

                                {/* Submenu */}
                                {hasSubItems && isOpen && isExpanded && (
                                    <div className="mt-1 ml-4 border-l border-slate-200 pl-2 space-y-1">
                                        {item.subItems.map((subItem) => {
                                            const subItemUrls = item.subItems.map(i => i.url);
                                            const isSubActive = isLinkActive(subItem.url, subItemUrls);
                                            return (
                                                <Link
                                                    key={subItem.title}
                                                    to={subItem.url}
                                                    onClick={() => {
                                                        if (window.innerWidth < 768) setIsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center py-2 px-3 rounded-md text-sm transition-all duration-200",
                                                        isSubActive
                                                            ? "text-[#3a5f9e] bg-blue-100 font-bold shadow-sm ring-1 ring-blue-200"
                                                            : "text-slate-500 hover:text-[#3a5f9e] hover:bg-[#3a5f9e]/5 hover:translate-x-1 hover:shadow-sm"
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
                    <TooltipWrapper title="Logout" isOpen={isOpen}>
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
                    </TooltipWrapper>
                </div>
                </TooltipProvider>
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
