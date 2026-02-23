import React from "react";
import { LayoutProvider, useLayout } from "../../context/LayoutContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { cn } from "../../lib/utils/utils";
import { useLocation } from "react-router-dom";
import { MenuItems } from "../../lib/utils/menu";
import Meta from "../common/Meta";

const MainLayoutInner = ({ children }) => {
    const { isOpen } = useLayout();
    const location = useLocation();

    const getPageTitle = (pathname) => {
        // 1. Try to find exact match in MenuItems
        const findInMenu = (items) => {
            for (const item of items) {
                if (item.url === pathname) return item.title;
                if (item.subItems) {
                    const subMatch = findInMenu(item.subItems);
                    if (subMatch) return subMatch;
                }
            }
            return null;
        };

        const titleFromMenu = findInMenu(MenuItems);
        if (titleFromMenu) return titleFromMenu;

        // 2. Fallbacks for common patterns (Add, Edit, Details)
        const segments = pathname.split('/').filter(Boolean);

        if (segments.includes('add')) {
            const baseSegment = segments[0];
            const parentTitle = MenuItems.find(i => i.url.includes(baseSegment))?.title || baseSegment;
            // Clean up title (e.g., "Active Courses" -> "Active Course")
            const singularTitle = parentTitle.endsWith('s') ? parentTitle.slice(0, -1) : parentTitle;
            return `Add ${singularTitle}`;
        }

        if (segments.includes('edit')) {
            const baseSegment = segments[0];
            const parentTitle = MenuItems.find(i => i.url.includes(baseSegment))?.title || baseSegment;
            const singularTitle = parentTitle.endsWith('s') ? parentTitle.slice(0, -1) : parentTitle;
            return `Edit ${singularTitle}`;
        }

        if (segments.includes('submitted') && segments.length > 2) {
            return "Submission Details";
        }

        // 3. Last fallback: Format segments[0]
        if (segments.length > 0) {
            const title = segments[0]
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            return title;
        }

        return "Dashboard";
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="relative flex h-[100dvh] w-full overflow-hidden bg-slate-50/50">
            <Meta title={pageTitle} />
            {/* Mesh Gradient Background */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundColor: "#f8fafc",
                    backgroundImage: `
                radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 0.1) 0, transparent 50%), 
                radial-gradient(at 50% 10%, hsla(225, 39%, 30%, 0.1) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 0.1) 0, transparent 50%), 
                radial-gradient(at 0% 50%, hsla(210, 78%, 85%, 0.5) 0, transparent 50%), 
                radial-gradient(at 100% 100%, hsla(280, 85%, 90%, 0.5) 0, transparent 50%),
                radial-gradient(at 0% 100%, hsla(220, 85%, 90%, 0.5) 0, transparent 50%)
            `,
                }}
            />

            <Sidebar />

            <main
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 min-w-0 h-full overflow-y-auto relative", // Changed overflow-hidden to overflow-y-auto and added relative
                    // Fix margin based on new Sidebar width
                    isOpen ? "md:pl-64" : "md:pl-20",
                    "pl-0"
                )}
            >
                <div className="sticky top-0 z-30">
                    <Navbar />
                </div>

                <div className="flex-1 p-3 sm:p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

const MainLayout = ({ children }) => {
    return (
        <LayoutProvider>
            <MainLayoutInner>{children}</MainLayoutInner>
        </LayoutProvider>
    );
};

export default MainLayout;
