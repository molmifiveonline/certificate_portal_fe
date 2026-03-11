import React, { useState } from 'react';
import { Calendar, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

const DateSelectionModal = ({ isOpen, onClose, onConfirm }) => {
    const [date, setDate] = useState('1970-01-01');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                            <Calendar size={20} />
                        </div>
                        Select Synchronization Date
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fetch changes since</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-semibold text-slate-700"
                    />
                    <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">
                        Data updated on or after this date will be fetched from the external MOLMI API. Default is 1970-01-01 to fetch all records.
                    </p>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-semibold">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => onConfirm(date)} 
                        className="px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Fetch Records
                        <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DateSelectionModal;
