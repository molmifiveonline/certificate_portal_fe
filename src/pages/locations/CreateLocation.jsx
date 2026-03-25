import React, { useState } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import LocationForm from './LocationForm';
import locationService from '../../services/locationService';
import { toast } from 'sonner';
import PageHeader from '../../components/common/PageHeader';

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
        <div className="w-full h-full pb-20">
            <Meta title="Add Location" description="Add New Location" />
            <div className="max-w-[1600px] mx-auto">
                <PageHeader
                    title="Add Location"
                    subtitle="Register a new training center or venue"
                    compact={true}
                    backTo="/location"
                />

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
