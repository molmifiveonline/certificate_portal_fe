import React, { useState } from 'react';
import { getErrorMessage } from '../../lib/utils/errorUtils';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import { toast } from 'sonner';
import StudyMaterialForm from './StudyMaterialForm';
import { studyMaterialService } from '../../services/studyMaterialService';
import PageHeader from '../../components/common/PageHeader';

const CreateStudyMaterial = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await studyMaterialService.createStudyMaterial(formData);
            toast.success('Study material created successfully!');
            navigate('/study-material');
        } catch (error) {
            console.error('Error creating study material:', error);
            toast.error(getErrorMessage(error, 'Failed to create study material.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add Study Material" description="Add New Study Material" />
            <div className="w-full mx-auto">
                <PageHeader
                    title="Add New Study Material"
                    subtitle="Upload course materials for candidates and trainers"
                    icon={Book}
                    compact={true}
                    backTo="/study-material"
                />

                <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
                    <StudyMaterialForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate('/study-material')}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateStudyMaterial;
