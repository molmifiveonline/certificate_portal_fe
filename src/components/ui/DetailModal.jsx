import React from 'react';
import { X, Info } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, data, config }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-white/40">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                            <Info size={18} />
                        </div>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-4">
                        {config.map((item, index) => {
                            const value = data[item.key];
                            if (item.hideIfEmpty && !value) return null;

                            return (
                                <div key={index} className="flex flex-col gap-1 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                    {item.render ? (
                                        item.render(value, data)
                                    ) : (
                                        <span className="text-sm font-medium text-slate-700">
                                            {value || <em className="text-slate-300 font-normal">Not provided</em>}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all shadow-sm group active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
