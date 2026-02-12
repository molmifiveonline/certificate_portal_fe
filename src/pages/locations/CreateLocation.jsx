import React, { useState } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LocationForm from './LocationForm';
import locationService from '../../services/locationService';
import { toast } from 'sonner';

const CreateLocation = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await locationService.createLocation(data);
            toast.success('Location created successfully!');
            navigate('/location');
        } catch (error) {
            console.error('Error creating location:', error);
            toast.error(error.response?.data?.message || 'Failed to create location');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Add Location" description="Add New Location" />
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/location')}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Add Location</h1>
                            <p className="text-slate-500 mt-1">Register a new training center or venue</p>
                        </div>
                    </div>
                </div>

                <LocationForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/location')}
                />
            </div>
        </div>
    );
};

export default CreateLocation;
