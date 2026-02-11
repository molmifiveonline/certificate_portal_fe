import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import candidateService from '../../services/candidateService';
import CandidateForm from '../../components/candidates/CandidateForm';
import { Card, CardContent } from "../../components/ui/card";
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
                    employeeType: data.registration_type
                };
                setCandidateData(mappedData);
            } catch (error) {
                console.error("Error fetching candidate:", error);
                toast.error("Failed to load candidate data");
                navigate('/candidates');
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
                registration_type: data.employeeType
            };

            await candidateService.updateCandidate(id, payload);
            toast.success("Candidate Updated Successfully!");
            navigate('/candidates');
        } catch (error) {
            console.error("Update Candidate Error:", error);
            toast.error(error.response?.data?.message || "Failed to update candidate.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/candidates')}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Candidate</h1>
                    <p className="text-slate-500 mt-1">Modify candidate information</p>
                </div>
            </div>

            <Card className="rounded-3xl border-slate-200/60 bg-white shadow-xl overflow-hidden">
                <CardContent className="p-8">
                    <CandidateForm
                        onSubmit={onSubmit}
                        defaultValues={candidateData}
                        isSubmitting={isSubmitting}
                        submitLabel="Update Candidate"
                        showPassword={false}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default EditCandidate;
