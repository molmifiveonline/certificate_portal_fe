import React, { useState } from 'react';
import { getErrorMessage } from '../../lib/utils/errorUtils';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { toast } from 'sonner';
import HotelForm from './HotelForm';
import hotelService from '../../services/hotelService';
import PageHeader from '../../components/common/PageHeader';

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
            toast.error(getErrorMessage(error, 'Failed to create hotel.'));
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add Hotel" description="Add New Hotel" />
            <div className="max-w-[1600px] mx-auto">
                <PageHeader
                    title="Add New Hotel"
                    subtitle="Register a new hotel for courses and certificates"
                    icon={Building}
                    compact={true}
                    backTo="/hotel-details"
                />

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
