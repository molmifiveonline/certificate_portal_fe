import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Background Icon Decoration */}
            <div className={`absolute -right-4 -bottom-4 opacity-10 p-4 rounded-full ${color}`}>
                <Icon size={96} />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">{title}</h3>
                    <div className="text-3xl font-bold text-gray-800">{value}</div>
                </div>
                <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-blue-100`}>
                    <Icon size={24} />
                </div>
            </div>

            {/* Trend if available */}
            {trend && (
                <div className="mt-4 flex items-center text-sm font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span>+{trend}% this month</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
