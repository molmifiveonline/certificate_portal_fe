import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FileDown, Calendar, FileSpreadsheet } from "lucide-react";
import ReportService from "../../services/reportService";

const ReportDashboard = () => {
    const [feedbackDates, setFeedbackDates] = useState({ start_date: "", end_date: "" });
    const [certificateDates, setCertificateDates] = useState({ start_date: "", end_date: "" });
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [loadingCertificate, setLoadingCertificate] = useState(false);

    const handleFeedbackDateChange = (e) => {
        setFeedbackDates({ ...feedbackDates, [e.target.name]: e.target.value });
    };

    const handleCertificateDateChange = (e) => {
        setCertificateDates({ ...certificateDates, [e.target.name]: e.target.value });
    };

    const handleFeedbackExport = async (e) => {
        e.preventDefault();
        const { start_date, end_date } = feedbackDates;

        if (!start_date || !end_date) {
            toast.error("Please select both start and end dates.");
            return;
        }

        // Validate 3 months range
        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Approx 93 days for 3 months
        if (diffDays > 93) {
            toast.error("Date range cannot exceed 3 months.");
            return;
        }

        if (start > end) {
            toast.error("Start date cannot be after end date.");
            return;
        }

        setLoadingFeedback(true);
        try {
            const response = await ReportService.exportFeedbackReport(feedbackDates);

            // Create Blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Feedback_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Feedback report downloaded successfully!");
        } catch (error) {
            console.error(error);
            const msg = error.message && typeof error.message === 'string'
                ? error.message
                : "Failed to export report.";
            toast.error(msg);
        } finally {
            setLoadingFeedback(false);
        }
    };

    const handleCertificateExport = async (e) => {
        e.preventDefault();
        const { start_date, end_date } = certificateDates;

        if (!start_date || !end_date) {
            toast.error("Please select both start and end dates.");
            return;
        }

        if (new Date(start_date) > new Date(end_date)) {
            toast.error("Start date cannot be after end date.");
            return;
        }

        setLoadingCertificate(true);
        try {
            const response = await ReportService.exportCertificateReport(certificateDates);

            // Create Blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Certificate_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Certificate report downloaded successfully!");
        } catch (error) {
            console.error(error);
            const msg = error.message && typeof error.message === 'string'
                ? error.message
                : "Failed to export report.";
            toast.error(msg);
        } finally {
            setLoadingCertificate(false);
        }
    };

    return (
        <div className="p-6">
            <Helmet>
                <title>Reports | MOLMI</title>
            </Helmet>

            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                    Reports Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Export detailed reports for analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                {/* Feedback Report Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-white border-b border-blue-100">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <FileDown className="w-5 h-5 text-blue-600" />
                            Feedback Report
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Export candidate feedback with ratings and comments. <span className="text-red-500 font-medium">(Max 3 months)</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleFeedbackExport} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={feedbackDates.start_date}
                                        onChange={handleFeedbackDateChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={feedbackDates.end_date}
                                        onChange={handleFeedbackDateChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loadingFeedback}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loadingFeedback ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <FileDown className="w-4 h-4" /> Export To Excel
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Certificate Report Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-100">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                            Certificate Report
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Export list of certificates issued within a date range.
                        </p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleCertificateExport} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={certificateDates.start_date}
                                        onChange={handleCertificateDateChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={certificateDates.end_date}
                                        onChange={handleCertificateDateChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loadingCertificate}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loadingCertificate ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <FileDown className="w-4 h-4" /> Export To Excel
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;
