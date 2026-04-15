import React, { useState, useEffect } from 'react';
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import nominatorService from '../../services/nominatorService';
import { Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import NominatorForm from './NominatorForm';

const EditNominator = () => {
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNominator = async () => {
            try {
                const data = await nominatorService.getNominatorById(id);
                setInitialData(data);
            } catch (error) {
                console.error(error);
                toast.error(getErrorMessage(error, "Failed to load nominator details"));
                navigate('/nominators');
            } finally {
                setLoading(false);
            }
        };
        fetchNominator();
    }, [id, navigate]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data };
            if (!payload.password) {
                delete payload.password;
            }
            await nominatorService.updateNominator(id, payload);
            toast.success('Nominator updated successfully!');
            navigate('/nominators');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update nominator.'));
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) return <LoadingSpinner />;

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Edit Nominator" description="Edit Nominator Details" />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                <PageHeader
                    title="Edit Nominator"
                    subtitle="Update nominator details"
                    icon={Users}
                    compact={true}
                    backTo="/nominators"
                />
                <div className="mt-6">
                    <NominatorForm
                        initialData={initialData}
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate('/nominators')}
                        submitLabel="Save Changes"
                    />
                </div>
            </div>
        </div>
    );
};

export default EditNominator;
