import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../lib/utils/utils';

const TabsContext = createContext({});

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
    const [activeTab, setActiveTab] = useState(defaultValue || '');

    const current = value !== undefined ? value : activeTab;
    const handleChange = (val) => {
        if (onValueChange) onValueChange(val);
        if (value === undefined) setActiveTab(val);
    };

    return (
        <TabsContext.Provider value={{ activeTab: current, setActiveTab: handleChange }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        role="tablist"
        className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500',
            className
        )}
        {...props}
    />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    const isActive = activeTab === value;

    return (
        <button
            ref={ref}
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? 'active' : 'inactive'}
            onClick={() => setActiveTab(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
    const { activeTab } = useContext(TabsContext);

    if (activeTab !== value) return null;

    return (
        <div
            ref={ref}
            role="tabpanel"
            data-state={activeTab === value ? 'active' : 'inactive'}
            className={cn(
                'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
