import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageHeader from "../../components/common/PageHeader";
import { toast } from "sonner";
import { FileSpreadsheet, Sparkles } from "lucide-react";
import ReportService from "../../services/reportService";
import FeedbackReportCard from "./components/FeedbackReportCard";
import CertificateReportCard from "./components/CertificateReportCard";
import { parseBlobError } from "../../lib/utils/blobUtils";

const TODAY = new Date().toISOString().split("T")[0];

const getDateRangeError = (dates, maxDays) => {
  const { start_date, end_date } = dates;

  if (!start_date || !end_date) {
    return "Please select both start and end dates.";
  }

  const start = new Date(`${start_date}T00:00:00`);
  const end = new Date(`${end_date}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Please enter a valid date range.";
  }

  if (start > end) {
    return "Start date cannot be after end date.";
  }

  if (maxDays) {
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > maxDays) {
      return "Date range cannot exceed 3 months.";
    }
  }

  return "";
};

const downloadReport = (data, fileName) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const ReportDashboard = () => {
  const [feedbackDates, setFeedbackDates] = useState({ start_date: "", end_date: "" });
  const [certificateDates, setCertificateDates] = useState({ start_date: "", end_date: "" });
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingBulkFeedback, setLoadingBulkFeedback] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  const [filterOptions, setFilterOptions] = useState({ topics: [], managers: [], companies: [] });
  const [feedbackFilters, setFeedbackFilters] = useState({ topic: "", manager: "" });
  const [certificateFilters, setCertificateFilters] = useState({
    topic: "",
    manager: "",
    company: "",
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await ReportService.getFilterOptions();
        setFilterOptions(data);
      } catch (error) {
        console.error("Failed to load filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFeedbackDateChange = (e) => {
    setFeedbackDates({ ...feedbackDates, [e.target.name]: e.target.value });
  };

  const handleCertificateDateChange = (e) => {
    setCertificateDates({ ...certificateDates, [e.target.name]: e.target.value });
  };

  const handleFeedbackExport = async (e) => {
    e.preventDefault();

    const dateError = getDateRangeError(feedbackDates, 93);
    if (dateError) {
      toast.error(dateError);
      return;
    }

    setLoadingFeedback(true);
    try {
      const payload = { ...feedbackDates };
      if (feedbackFilters.topic) payload.topic = feedbackFilters.topic;
      if (feedbackFilters.manager) payload.manager = feedbackFilters.manager;

      const response = await ReportService.exportFeedbackReport(payload);
      downloadReport(response.data, "Feedback_Report.xlsx");
      toast.success("Feedback report downloaded successfully!");
    } catch (error) {
      console.error(error);
      let msg = "Failed to export report.";
      if (error instanceof Blob) {
        const errorData = await parseBlobError(error);
        if (errorData?.message) msg = errorData.message;
      } else if (typeof error === "string") {
        msg = error;
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleFeedbackBulkDownload = async (e) => {
    if (e) e.preventDefault();

    const dateError = getDateRangeError(feedbackDates, 93);
    if (dateError) {
      toast.error(dateError);
      return;
    }

    setLoadingBulkFeedback(true);
    try {
      const payload = { ...feedbackDates };
      if (feedbackFilters.topic) payload.topic = feedbackFilters.topic;
      if (feedbackFilters.manager) payload.manager = feedbackFilters.manager;

      const response = await ReportService.bulkDownloadFeedbackPDFs(payload);
      downloadReport(response.data, "Feedback_PDFs.zip");
      toast.success("Feedback PDFs downloaded successfully!");
    } catch (error) {
      console.error(error);
      let msg = "Failed to download PDFs.";
      if (error instanceof Blob) {
        const errorData = await parseBlobError(error);
        if (errorData?.message) msg = errorData.message;
      } else if (typeof error === "string") {
        msg = error;
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setLoadingBulkFeedback(false);
    }
  };

  const handleCertificateExport = async (e) => {
    e.preventDefault();

    const dateError = getDateRangeError(certificateDates);
    if (dateError) {
      toast.error(dateError);
      return;
    }

    setLoadingCertificate(true);
    try {
      const payload = { ...certificateDates };
      if (certificateFilters.topic) payload.topic = certificateFilters.topic;
      if (certificateFilters.manager) payload.manager = certificateFilters.manager;
      if (certificateFilters.company) payload.company = certificateFilters.company;

      const response = await ReportService.exportCertificateReport(payload);
      downloadReport(response.data, "Certificate_Report.xlsx");
      toast.success("Certificate report downloaded successfully!");
    } catch (error) {
      console.error(error);
      let msg = "Failed to export report.";
      if (error instanceof Blob) {
        const errorData = await parseBlobError(error);
        if (errorData?.message) msg = errorData.message;
      } else if (typeof error === "string") {
        msg = error;
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setLoadingCertificate(false);
    }
  };

  return (
    <div className="relative overflow-hidden p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Reports | MOLMI</title>
      </Helmet>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-12 -left-10 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="mb-8">
        <PageHeader
          title="Reports Dashboard"
          subtitle="Generate polished Excel exports with flexible filters for feedback and certificates."
          icon={FileSpreadsheet}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FeedbackReportCard
          dates={feedbackDates}
          onDateChange={handleFeedbackDateChange}
          filters={feedbackFilters}
          onFiltersChange={setFeedbackFilters}
          filterOptions={filterOptions}
          onSubmit={handleFeedbackExport}
          onBulkDownload={handleFeedbackBulkDownload}
          loading={loadingFeedback}
          loadingBulk={loadingBulkFeedback}
          today={TODAY}
        />

        <CertificateReportCard
          dates={certificateDates}
          onDateChange={handleCertificateDateChange}
          filters={certificateFilters}
          onFiltersChange={setCertificateFilters}
          filterOptions={filterOptions}
          onSubmit={handleCertificateExport}
          loading={loadingCertificate}
          today={TODAY}
        />
      </div>
    </div>
  );
};

export default ReportDashboard;
