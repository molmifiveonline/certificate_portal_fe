import React, { useState } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import { Building, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import HotelForm from './HotelForm';
import hotelService from '../../services/hotelService';

const CreateHotel = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

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

            await hotelService.createHotel(formData);
            toast.success('Hotel created successfully!');
            navigate('/hotel-details');
        } catch (error) {
            console.error('Error creating hotel:', error);
            toast.error(error.response?.data?.message || 'Failed to create hotel.');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Add Hotel" description="Add New Hotel" />
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Add New Hotel</h1>
                            <p className="text-slate-500 mt-1">Register a new hotel for courses and certificates</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/hotel-details')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>
                </div>

                {/* Form Container */}
                <HotelForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/hotel-details')}
                />
            </div>
        </div>
    );
};

export default CreateHotel;
