import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils/utils';

const BackButton = ({ to, label = "Back to List", className }) => {
    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold",
                "text-slate-600 bg-white border border-slate-200 shadow-sm",
                "hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md",
                "transition-all duration-200 active:scale-95",
                className
            )}
        >
            <ArrowLeft className="w-4 h-4" />
            <span>{label}</span>
        </Link>
    );
};

export default BackButton;
