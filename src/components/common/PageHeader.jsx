import React from 'react';
import { cn } from '../../lib/utils/utils';
import PageSubtitle from './PageSubtitle';

const PageHeader = ({ 
    title, 
    subtitle, 
    icon: Icon,
    actions,
    className,
    titleClassName,
    subtitleClassName,
    subtitleIcon,
    compact = false,
    backButton = null
}) => {
    return (
        <div className={cn(
            "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8",
            compact && "mb-4",
            className
        )}>
            <div className="space-y-1">
                <h1 className={cn("text-3xl font-bold tracking-tight page-title flex items-center gap-3", titleClassName)}>
                    {backButton}
                    {Icon && (
                        <div className="bg-blue-100 p-2 rounded-xl shrink-0">
                            <Icon className="w-8 h-8 text-blue-600" />
                        </div>
                    )}
                    {title}
                </h1>
                {subtitle && (
                    <PageSubtitle icon={subtitleIcon} className={subtitleClassName}>
                        {subtitle}
                    </PageSubtitle>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
