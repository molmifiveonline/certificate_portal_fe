import React from 'react';
import { cn } from '../../lib/utils/utils';
import { Sparkles } from 'lucide-react'; // Default icon

const PageSubtitle = ({ children, className, icon: Icon = Sparkles }) => {
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-transparent border border-blue-100/40 shadow-sm shadow-blue-500/5 backdrop-blur-sm",
            className
        )}>
            {Icon && <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-pulse" />}
            <p className="text-xs font-semibold text-slate-600/90 tracking-wide">
                {children}
            </p>
        </div>
    );
};

export default PageSubtitle;
