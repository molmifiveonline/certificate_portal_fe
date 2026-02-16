import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LocationForm from './LocationForm';
import locationService from '../../services/locationService';
import { toast } from 'sonner';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading location details...</p>
    </div>
);

const EditLocation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationData, setLocationData] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const result = await locationService.getLocationById(id);
                if (result.success && result.data) {
                    setLocationData(result.data);
                } else {
                    toast.error('Location not found');
                    navigate('/location');
                }
            } catch (error) {
                console.error('Error fetching location:', error);
                toast.error('Failed to load location details');
                navigate('/location');
            } finally {
                setLoading(false);
            }
        };
        fetchLocation();
    }, [id, navigate]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await locationService.updateLocation(id, data);
            toast.success('Location updated successfully!');
            navigate('/location');
        } catch (error) {
            console.error('Error updating location:', error);
            toast.error(error.response?.data?.message || 'Failed to update location');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;



    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Edit Location" description="Edit Location Details" />
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Location</h1>
                        <p className="text-slate-500 mt-1">Update training center information</p>
                    </div>
                    <button
                        onClick={() => navigate('/location')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                        <ChevronLeft size={18} />
                        Back to List
                    </button>
                </div>

                <LocationForm
                    initialData={locationData}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/location')}
                />
            </div>
        </div>
    );
};

export default EditLocation;
