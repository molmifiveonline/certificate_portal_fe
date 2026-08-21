import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '../../lib/utils/errorUtils';
import Meta from "../../components/common/Meta";
import { useNavigate, useParams } from 'react-router-dom';
import { Book } from 'lucide-react';
import { toast } from 'sonner';
import StudyMaterialForm from './StudyMaterialForm';
import { studyMaterialService } from '../../services/studyMaterialService';
import PageHeader from '../../components/common/PageHeader';
import ConfirmationModal from "../../components/ui/ConfirmationModal";

const EditStudyMaterial = () => {
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const response = await studyMaterialService.getStudyMaterialById(id);
                if (response.success) {
                    setInitialData(response.data);
                } else {
                    toast.error('Failed to load study material.');
                    navigate('/study-material');
                }
            } catch (error) {
                console.error('Error fetching study material:', error);
                toast.error(getErrorMessage(error, 'Failed to load study material.'));
                navigate('/study-material');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchMaterial();
        }
    }, [id, navigate]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await studyMaterialService.updateStudyMaterial(id, formData);
            toast.success('Study material updated successfully!');
            navigate('/study-material');
        } catch (error) {
            console.error('Error updating study material:', error);
            toast.error(getErrorMessage(error, 'Failed to update study material.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const response = await studyMaterialService.deleteStudyMaterial(id);
            if (response.success) {
                toast.success('Study material deleted successfully');
                navigate('/study-material');
            } else {
                toast.error(response.message || 'Failed to delete study material');
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete study material'));
        } finally {
            setIsSubmitting(false);
            setDeleteModalOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Edit Study Material" description="Edit Study Material" />
            <div className="w-full mx-auto">
                <PageHeader
                    title="Edit Study Material"
                    subtitle="Update existing course materials or upload new files"
                    icon={Book}
                    compact={true}
                    backTo="/study-material"
                />

                <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
                    <StudyMaterialForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate('/study-material')}
                        onDelete={() => setDeleteModalOpen(true)}
                    />
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Study Material"
                message="Are you sure you want to delete this study material? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
            />
        </div>
    );
};

export default EditStudyMaterial;
