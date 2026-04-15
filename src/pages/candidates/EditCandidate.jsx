import React, { useState, useEffect } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import candidateService from '../../services/candidateService';
import CandidateForm from '../../components/candidates/CandidateForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EditCandidate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [candidateData, setCandidateData] = useState(null);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const data = await candidateService.getCandidateById(id);
                // Map snake_case to camelCase for the form
                const mappedData = {
                    firstName: data.first_name,
                    lastName: data.last_name,
                    middleName: data.middle_name,
                    email: data.email,
                    prefix: data.prefix,
                    gender: data.gender,
                    dob: data.dob ? data.dob.split('T')[0] : '',
                    nationality: data.nationality,
                    passportNumber: data.passport_no,
                    employeeId: data.employee_id,
                    manager: data.manager,
                    rank: data.rank,
                    whatsapp: data.whatsapp_number,
                    alternateNumber: data.alternate_mobile,
                    indosNo: data.indos_number,
                    employeeType: data.registration_type,
                    designation: data.designation,
                    vesselType: data.vessel_type,
                    lastVesselName: data.last_vessel_name,
                    nextVesselName: data.next_vessel_name,
                    manningCompany: data.manning_company,
                    signOnDate: (!data.sign_on_date || data.sign_on_date.includes('1899') || data.sign_on_date.includes('0000-00-00')) ? '' : data.sign_on_date.split('T')[0],
                    signOffDate: (!data.sign_off_date || data.sign_off_date.includes('1899') || data.sign_off_date.includes('0000-00-00')) ? '' : data.sign_off_date.split('T')[0],
                    officer: data.officer,
                    seamanBookNo: data.seaman_book_no,
                    profileImage: data.profile_image,
                    status: data.status === 1, // Map 1 to true, 0 to false
                    declaration: true // Pre-check since candidate already accepted during registration
                };
                setCandidateData(mappedData);
            } catch (error) {
                console.error("Error fetching candidate:", error);
                toast.error(getErrorMessage(error, "Failed to load candidate data"));
                navigate('/candidates/molmi');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id, navigate]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                middle_name: data.middle_name,
                email: data.email,
                prefix: data.prefix,
                gender: data.gender,
                dob: data.dob,
                nationality: data.nationality,
                passport_no: data.passportNumber,
                employee_id: data.employeeId,
                manager: data.manager,
                rank: data.rank,
                whatsapp_number: data.whatsapp,
                alternate_mobile: data.alternateNumber,
                indos_number: data.indosNo,
                registration_type: data.employeeType,
                designation: data.designation,
                vessel_type: data.vesselType,
                last_vessel_name: data.lastVesselName,
                next_vessel_name: data.nextVesselName,
                manning_company: data.manningCompany,
                sign_on_date: data.signOnDate || null,
                sign_off_date: data.signOffDate || null,
                officer: data.officer,
                seaman_book_no: data.seamanBookNo,
                profile_image: data.profileImage,
                status: data.status ? 1 : 0 // Map true to 1, false to 0
            };

            // Only add password if it was reset/changed (frontend sends it only if user typed it)
            if (data.password) {
                payload.password = data.password;
            }

            await candidateService.updateCandidate(id, payload);
            toast.success("Candidate Updated Successfully!");
            navigate(payload.registration_type === 'Others' ? '/candidates/others' : '/candidates/molmi');
        } catch (error) {
            console.error("Update Candidate Error:", error);
            toast.error(getErrorMessage(error, "Failed to update candidate."));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <Meta title="Edit Candidate" description="Edit Candidate Details" />
            <PageHeader
                title="Edit Candidate"
                subtitle="Modify candidate information"
                compact={true}
                backTo={candidateData?.employeeType === 'Others' ? '/candidates/others' : '/candidates/molmi'}
            />

            <div className="w-full">
                <CandidateForm
                    onSubmit={onSubmit}
                    defaultValues={candidateData}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Candidate"
                    showPassword={false}
                    isAdmin={true}
                    onCancel={() => navigate(candidateData?.employeeType === 'Others' ? '/candidates/others' : '/candidates/molmi')}
                />
            </div>
        </div>
    );
};

export default EditCandidate;
