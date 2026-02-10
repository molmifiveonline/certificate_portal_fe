import React from 'react';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Header = () => {
    const { logout } = useAuth();

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100/50 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            {/* Left: Search or Title */}
            <div className="flex items-center md:pl-64 transition-all">
                {/* Note: Padding Left matches sidebar width on desktop */}
                <div className="relative hidden md:block w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                    <Input
                        type="text"
                        placeholder="Search for candidates, courses..."
                        className="pl-10 w-full bg-gray-50 focus:bg-white"
                    />
                </div>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
                    <Menu size={24} />
                </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative rounded-full text-gray-500 hover:bg-gray-100">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </Button>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <Button
                    variant="ghost"
                    onClick={logout}
                    className="flex items-center space-x-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;
