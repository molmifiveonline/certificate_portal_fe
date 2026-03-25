import React, { useState } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import SystemManualForm from './SystemManualForm';
import { systemManualService } from '../../services/systemManualService';
import PageHeader from '../../components/common/PageHeader';

const CreateSystemManual = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('document_type', data.document_type);

            if (data.document_type === 'file' && data.document_file) {
                formData.append('document_file', data.document_file);
            } else if (data.document_type === 'url' && data.url_link) {
                formData.append('url_link', data.url_link);
            }

            await systemManualService.createSystemManual(formData);
            toast.success('System manual created successfully!');
            navigate('/system-manual');
        } catch (error) {
            console.error('Error creating system manual:', error);
            toast.error(error.response?.data?.message || 'Failed to create system manual.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add System Manual" description="Add New System Manual" />
            <div className="w-full mx-auto">
                <PageHeader
                    title="Add New System Manual"
                    subtitle="Upload a new document or add a URL link"
                    icon={FileText}
                    compact={true}
                    backTo="/system-manual"
                />

                {/* Form Container */}
                <SystemManualForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/system-manual')}
                />
            </div>
        </div>
    );
};

export default CreateSystemManual;
