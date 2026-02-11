import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import HotelForm from './HotelForm';
import hotelService from '../../services/hotelService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EditHotel = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await hotelService.getHotelById(id);
                // The backend returns { status, message, data }
                if (response.data) {
                    setHotel(response.data);
                } else {
                    toast.error('Hotel not found');
                    navigate('/hotel-details');
                }
            } catch (error) {
                console.error('Error fetching hotel:', error);
                toast.error('Failed to load hotel details.');
                navigate('/hotel-details');
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id, navigate]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('venue_name', data.venue_name);
            formData.append('venue_address', data.venue_address);
            formData.append('venue_contact', data.venue_contact || '');
            formData.append('venue_map_link', data.venue_map_link || '');
            formData.append('email', data.email || '');

            if (data.hotel_files && data.hotel_files.length > 0) {
                for (let i = 0; i < data.hotel_files.length; i++) {
                    formData.append('hotel_files', data.hotel_files[i]);
                }
            }

            await hotelService.updateHotel(id, formData);
            toast.success('Hotel updated successfully!');
            navigate('/hotel-details');
        } catch (error) {
            console.error('Error updating hotel:', error);
            toast.error(error.response?.data?.message || 'Failed to update hotel.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Hotel</h1>
                            <p className="text-slate-500 mt-1">Update details for {hotel?.venue_name}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/hotel-details')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-xl transition-all text-sm font-semibold border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft size={18} />
                        Back to List
                    </button>
                </div>

                {/* Form Container */}
                <HotelForm
                    initialData={hotel}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/hotel-details')}
                />
            </div>
        </div>
    );
};

export default EditHotel;
