import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageHeader from "../../components/common/PageHeader";
import { toast } from "sonner";
import { FileSpreadsheet } from "lucide-react";
import ReportService from "../../services/reportService";
import FeedbackReportCard from "./components/FeedbackReportCard";
import CertificateReportCard from "./components/CertificateReportCard";
import TrainingRecordReportCard from "./components/TrainingRecordReportCard";
import TrainingActivitiesReportCard from "./components/TrainingActivitiesReportCard";
import ReportAiChatPanel from "./components/ReportAiChatPanel";
import { parseBlobError } from "../../lib/utils/blobUtils";

const TODAY = new Date().toISOString().split("T")[0];
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const AI_REPORT_TYPES = [
  { value: "feedback", label: "Feedback Report" },
  { value: "certificate", label: "Certificate Report" },
  { value: "training_record", label: "TRG-218 Training Record" },
  { value: "training_activities", label: "TRG-219 Training Activities" },
  { value: "hotel", label: "Hotel Report" },
];

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

const getApiErrorMessage = (error, fallback) => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  return fallback;
};

const ReportDashboard = () => {
  const [feedbackDates, setFeedbackDates] = useState({ start_date: "", end_date: "" });
  const [certificateDates, setCertificateDates] = useState({ start_date: "", end_date: "" });
  const [trainingRecordYear, setTrainingRecordYear] = useState(String(CURRENT_YEAR));
  const [trainingActivitiesForm, setTrainingActivitiesForm] = useState({
    start_month: String(CURRENT_MONTH),
    year: String(CURRENT_YEAR),
  });
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingBulkFeedback, setLoadingBulkFeedback] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [loadingTrainingRecord, setLoadingTrainingRecord] = useState(false);
  const [loadingTrainingActivities, setLoadingTrainingActivities] = useState(false);
  const [aiReportType, setAiReportType] = useState("feedback");
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiReportMeta, setAiReportMeta] = useState(null);

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

  const handleTrainingRecordYearChange = (e) => {
    setTrainingRecordYear(e.target.value);
  };

  const handleTrainingActivitiesChange = (e) => {
    setTrainingActivitiesForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

  const handleTrainingRecordExport = async (e) => {
    e.preventDefault();

    const parsedYear = Number(trainingRecordYear);
    if (
      !trainingRecordYear ||
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > CURRENT_YEAR
    ) {
      toast.error(`Please enter a valid year between 2000 and ${CURRENT_YEAR}.`);
      return;
    }

    setLoadingTrainingRecord(true);
    try {
      const response = await ReportService.exportTrainingRecordReport({
        year: parsedYear,
      });
      downloadReport(response.data, `TRG-218_Training_Record_${parsedYear}.xlsx`);
      toast.success("TRG-218 report downloaded successfully!");
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
      setLoadingTrainingRecord(false);
    }
  };

  const handleTrainingActivitiesExport = async (e) => {
    e.preventDefault();

    const parsedMonth = Number(trainingActivitiesForm.start_month);
    const parsedYear = Number(trainingActivitiesForm.year);

    if (
      !trainingActivitiesForm.start_month ||
      !Number.isInteger(parsedMonth) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      toast.error("Please select a valid start month.");
      return;
    }

    if (
      !trainingActivitiesForm.year ||
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > 2100
    ) {
      toast.error("Please enter a valid year between 2000 and 2100.");
      return;
    }

    setLoadingTrainingActivities(true);
    try {
      const response = await ReportService.exportTrainingActivitiesReport({
        start_month: parsedMonth,
        year: parsedYear,
      });
      downloadReport(
        response.data,
        `TRG-219_Training_Activities_${parsedMonth}_${parsedYear}.xlsx`,
      );
      toast.success("TRG-219 report downloaded successfully!");
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
      setLoadingTrainingActivities(false);
    }
  };

  const getAiReportPayload = () => {
    if (aiReportType === "feedback") {
      const dateError = getDateRangeError(feedbackDates, 93);
      if (dateError) return { error: dateError };

      const params = { ...feedbackDates };
      if (feedbackFilters.topic) params.topic = feedbackFilters.topic;
      if (feedbackFilters.manager) params.manager = feedbackFilters.manager;
      return { params };
    }

    if (aiReportType === "certificate") {
      const dateError = getDateRangeError(certificateDates);
      if (dateError) return { error: dateError };

      const params = { ...certificateDates };
      if (certificateFilters.topic) params.topic = certificateFilters.topic;
      if (certificateFilters.manager) params.manager = certificateFilters.manager;
      if (certificateFilters.company) params.company = certificateFilters.company;
      return { params };
    }

    if (aiReportType === "training_record") {
      const parsedYear = Number(trainingRecordYear);
      if (
        !trainingRecordYear ||
        !Number.isInteger(parsedYear) ||
        parsedYear < 2000 ||
        parsedYear > CURRENT_YEAR
      ) {
        return { error: `Please enter a valid year between 2000 and ${CURRENT_YEAR}.` };
      }
      return { params: { year: parsedYear } };
    }

    if (aiReportType === "training_activities") {
      const parsedMonth = Number(trainingActivitiesForm.start_month);
      const parsedYear = Number(trainingActivitiesForm.year);
      if (
        !trainingActivitiesForm.start_month ||
        !Number.isInteger(parsedMonth) ||
        parsedMonth < 1 ||
        parsedMonth > 12
      ) {
        return { error: "Please select a valid start month." };
      }
      if (
        !trainingActivitiesForm.year ||
        !Number.isInteger(parsedYear) ||
        parsedYear < 2000 ||
        parsedYear > 2100
      ) {
        return { error: "Please enter a valid year between 2000 and 2100." };
      }
      return {
        params: {
          start_month: parsedMonth,
          year: parsedYear,
        },
      };
    }

    return { params: {} };
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();

    if (!aiPrompt.trim()) {
      toast.error("Please enter a question for AI.");
      return;
    }

    const payload = getAiReportPayload();
    if (payload.error) {
      toast.error(payload.error);
      return;
    }

    setLoadingAi(true);
    setAiResponse(null);
    setAiReportMeta(null);
    try {
      const response = await ReportService.askReportAi({
        report_type: aiReportType,
        params: payload.params,
        prompt: aiPrompt,
      });
      setAiResponse(response);
      setAiReportMeta(response.report);
      toast.success("AI report analysis generated.");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to generate AI report analysis."));
    } finally {
      setLoadingAi(false);
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

      <div className="mb-6">
        <ReportAiChatPanel
          reportTypes={AI_REPORT_TYPES}
          reportType={aiReportType}
          onReportTypeChange={(value) => {
            setAiReportType(value);
            setAiResponse(null);
            setAiReportMeta(null);
          }}
          prompt={aiPrompt}
          onPromptChange={setAiPrompt}
          onPromptPick={setAiPrompt}
          onSubmit={handleAiSubmit}
          loading={loadingAi}
          response={aiResponse}
          reportMeta={aiReportMeta}
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

        <TrainingRecordReportCard
          year={trainingRecordYear}
          onYearChange={handleTrainingRecordYearChange}
          onSubmit={handleTrainingRecordExport}
          loading={loadingTrainingRecord}
          minYear={2000}
          maxYear={CURRENT_YEAR}
        />

        <TrainingActivitiesReportCard
          form={trainingActivitiesForm}
          onChange={handleTrainingActivitiesChange}
          onSubmit={handleTrainingActivitiesExport}
          loading={loadingTrainingActivities}
          minYear={2000}
          maxYear={CURRENT_YEAR}
        />
      </div>
    </div>
  );
};

export default ReportDashboard;
