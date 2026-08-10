import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Info, RefreshCcw, FileSpreadsheet, Upload, BookOpen } from "lucide-react";
import { Button } from "../ui/Button";
import DataTable from "../ui/DataTable";
import TablePagination from "../ui/TablePagination";
import { toast } from "sonner";
import preActiveCourseService from "../../services/preActiveCourseService";
import { formatDate } from "../../lib/utils/dateUtils";

const ExcelUploadModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreviewData([]);
      setValidationErrors([]);
      setStats({ total: 0, valid: 0, invalid: 0 });
      setCurrentPage(1);
    }
  }, [isOpen]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split(".").pop().toLowerCase();
    if (fileExt !== "xlsx" && fileExt !== "xls") {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    const toastId = toast.loading("Parsing and validating Excel file...");

    try {
      const response = await preActiveCourseService.uploadExcelPreview(selectedFile);
      if (response.success) {
        setPreviewData(response.data || []);
        setValidationErrors(response.errors || []);
        setStats(response.stats || { total: 0, valid: 0, invalid: 0 });
        toast.success("Excel parsed successfully!", { id: toastId });
      } else {
        toast.error(response.message || "Failed to parse file", { id: toastId });
      }
    } catch (error) {
      console.error("Upload Excel preview error:", error);
      toast.error(
        error.response?.data?.message || "Failed to process Excel file. Please check format.",
        { id: toastId }
      );
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.loading("Generating template...");
      await preActiveCourseService.downloadExcelTemplate();
      toast.dismiss();
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.dismiss();
      console.error("Template download error:", error);
      toast.error("Failed to download template. Please try again.");
    }
  };

  const handleImport = async () => {
    if (stats.invalid > 0) {
      toast.error("Please fix all validation errors before importing.");
      return;
    }

    setImporting(true);
    const toastId = toast.loading("Importing courses...");
    try {
      const response = await preActiveCourseService.confirmExcelImport({
        courses: previewData
      });
      
      toast.success(
        `Import complete! ${response.stats.inserted} courses created, ${response.stats.skipped} duplicates skipped.`,
        { id: toastId, duration: 5000 }
      );
      onImportSuccess();
      onClose();
    } catch (error) {
      console.error("Confirm Excel import error:", error);
      toast.error(error.response?.data?.message || "Failed to import course data.", { id: toastId });
    } finally {
      setImporting(false);
    }
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return previewData.slice(startIndex, startIndex + limit);
  }, [previewData, currentPage, limit]);

  const totalPages = Math.ceil(previewData.length / limit) || 1;

  if (!isOpen) return null;

  const columns = [
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        if (row.hasError) {
          // Find error messages for this row
          const rowErr = validationErrors.find(e => e.rowNum === row.rowNum);
          const tooltipText = rowErr ? rowErr.errors.join(", ") : "Invalid row data";
          return (
            <span 
              className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-100 uppercase tracking-tighter cursor-help"
              title={tooltipText}
            >
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          );
        }
        if (row.isDuplicate) {
          return (
            <span 
              className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100 uppercase tracking-tighter"
              title="This course name, start date, and end date combination already exists in the system."
            >
              <AlertCircle className="w-3 h-3" /> Duplicate
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-tighter">
            <CheckCircle2 className="w-3 h-3" /> Valid
          </span>
        );
      }
    },
    {
      key: "course_name",
      label: "Course Name",
      className: "whitespace-normal min-w-[200px]",
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val || "N/A"}</span>
          {row.topic && (
            <div className="text-[10px] text-slate-400 font-medium">Topic: {row.topic}</div>
          )}
        </div>
      )
    },
    {
      key: "start_date",
      label: "Start Date",
      render: (val) => val ? formatDate(val) : "N/A"
    },
    {
      key: "end_date",
      label: "End Date",
      render: (val) => val ? formatDate(val) : "N/A"
    },
    {
      key: "days",
      label: "Days",
      align: "center"
    },
    {
      key: "type_of_course",
      label: "Course Type",
      render: (val) => val || "N/A"
    },
    {
      key: "type_of_location",
      label: "Location Type",
      render: (val) => val || "N/A"
    },
    {
      key: "location_id",
      label: "Venue",
      className: "max-w-[150px] truncate",
      render: (val, row) => {
        if (row.type_of_location === "Online") return <span className="text-slate-400">Online</span>;
        if (val === "other") return <span className="italic text-slate-600">Other: {row.other_location}</span>;
        return val ? <span className="font-medium text-slate-700">Database Venue</span> : <span className="text-slate-400">TBD</span>;
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden transform transition-all scale-100 border border-white/40 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-2.5 rounded-2xl text-green-600 shadow-sm">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Excel Bulk Upload Pre-Active Courses</h3>
              <p className="text-sm text-slate-500 font-medium">
                {file ? `${file.name} • ${stats.total} rows parsed` : "Upload spreadsheet to batch create courses"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {file && (
              <button 
                onClick={() => setFile(null)}
                disabled={loading || importing}
                className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                Change File
              </button>
            )}

            <button
              onClick={onClose}
              disabled={importing}
              className="text-slate-400 hover:text-slate-600 transition-all p-2 rounded-full hover:bg-slate-100 active:scale-90"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex-1 overflow-y-auto bg-white/50 flex flex-col">
          {!file ? (
            /* State 1: Upload Zone */
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div 
                className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  dragActive 
                    ? "border-green-500 bg-green-50/50 scale-[1.02]" 
                    : "border-slate-300 hover:border-green-400 hover:bg-slate-50/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <div className="bg-slate-100 p-5 rounded-full text-slate-500 mb-4 shadow-inner">
                  <Upload size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">Drag and drop your Excel file here</h4>
                <p className="text-sm text-slate-500 mb-6 font-medium">Only .xlsx or .xls file formats up to 5MB are supported</p>
                <Button 
                  type="button" 
                  className="px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 pointer-events-none"
                >
                  Select File
                </Button>
              </div>

              {/* Guide / Instruction */}
              <div className="mt-8 bg-slate-50 border border-slate-150 rounded-2xl p-5 max-w-2xl w-full flex items-start gap-4">
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h5 className="font-bold text-slate-800 text-sm mb-1">Need a template?</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                    Download our official template sheet which includes validations, drop-down selections, and format helpers to ensure a successful import.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="h-9 px-4 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Download Sample Template
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* State 2: Preview Table */
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-xl text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Rows</div>
                    <div className="text-xl font-bold text-slate-800">{stats.total}</div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-xl text-green-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valid Rows</div>
                    <div className="text-xl font-bold text-green-700">{stats.valid}</div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-xl text-red-600">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rows with Errors</div>
                    <div className={`text-xl font-bold ${stats.invalid > 0 ? "text-red-600" : "text-slate-500"}`}>{stats.invalid}</div>
                  </div>
                </div>
              </div>

              {stats.invalid > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-left text-sm text-red-800 font-medium">
                    <span className="font-bold">Excel contains validation errors.</span> Please resolve all errors highlighted in <span className="font-bold underline">Red</span> in the table below and re-upload the spreadsheet. The import option is disabled until all rows are valid.
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-[300px]">
                <DataTable
                  columns={columns}
                  data={paginatedData}
                  loading={loading}
                  rowKey="rowNum"
                  limit={limit}
                  emptyMessage="No preview data parsed."
                />
              </div>

              {!loading && previewData.length > 0 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={previewData.length}
                    onPageChange={setCurrentPage}
                    limit={limit}
                    onLimitChange={setLimit}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={importing}
            className="px-6 py-2.5 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-white active:scale-95"
          >
            Cancel
          </Button>

          {file && (
            <div className="flex items-center gap-4">
              {importing && (
                <div className="flex items-center gap-2 text-green-600 font-semibold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Import...
                </div>
              )}
              <Button
                onClick={handleImport}
                disabled={importing || loading || !previewData.length || stats.invalid > 0}
                className="px-10 py-3 rounded-xl font-extrabold shadow-xl shadow-green-500/20 bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 text-white border-none"
              >
                Confirm & Import Courses
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;
