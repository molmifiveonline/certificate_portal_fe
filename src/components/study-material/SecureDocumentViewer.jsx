import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ShieldAlert, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "../ui/Button";
import axios from "axios";
import * as XLSX from "xlsx";
import { renderAsync } from "docx-preview";

const SecureDocumentViewer = ({ fileUrl, fileName, originalName, accessType, onClose }) => {
  const isViewOnly = accessType === "view";
  const [isBlurred, setIsBlurred] = useState(false);

  // Reliably determine file extension from originalName, fileUrl, or fileName
  const ext = useMemo(() => {
    // 1. Check originalName (e.g. "DESERT TRIBE WEBSITE FEEDBACK.docx")
    if (originalName && originalName.includes(".")) {
      const parts = originalName.split(".");
      const candidate = parts[parts.length - 1].toLowerCase().trim();
      if (candidate && candidate.length <= 5) return candidate;
    }
    // 2. Check fileUrl (e.g. "http://localhost:8000/uploads/study_material/both/files-12345.docx")
    if (fileUrl) {
      const cleanUrl = fileUrl.split("?")[0].split("#")[0];
      if (cleanUrl.includes(".")) {
        const parts = cleanUrl.split(".");
        const candidate = parts[parts.length - 1].toLowerCase().trim();
        if (candidate && candidate.length <= 5) return candidate;
      }
    }
    // 3. Check fileName if it contains a dot
    if (fileName && fileName.includes(".")) {
      const parts = fileName.split(".");
      const candidate = parts[parts.length - 1].toLowerCase().trim();
      if (candidate && candidate.length <= 5) return candidate;
    }
    return "";
  }, [originalName, fileUrl, fileName]);

  const isImage = useMemo(
    () => ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext),
    [ext]
  );
  const isVideo = useMemo(
    () => ["mp4", "webm", "mkv", "mov", "avi", "m4v", "3gp"].includes(ext),
    [ext]
  );
  const isAudio = useMemo(
    () => ["mp3", "wav", "ogg", "aac", "m4a", "flac"].includes(ext),
    [ext]
  );
  const isDocx = useMemo(() => ["docx", "doc"].includes(ext), [ext]);
  const isExcel = useMemo(() => ["xlsx", "xls", "csv"].includes(ext), [ext]);
  const isPdf = useMemo(() => ext === "pdf", [ext]);

  // DOCX rendering state
  const docxContainerRef = useRef(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(null);

  // Excel rendering state
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");

  // Window blur / screenshot protection for View Only mode
  useEffect(() => {
    if (!isViewOnly) return;

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard?.writeText?.("");
        alert("Screenshots are disabled for this document.");
      }
    };
    window.addEventListener("keyup", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keyup", handleKeyDown);
    };
  }, [isViewOnly]);

  // Load and render DOCX file
  useEffect(() => {
    if (!isDocx || !fileUrl) return;
    let isMounted = true;
    setDocLoading(true);
    setDocError(null);

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch document (${res.status})`);
        return res.blob();
      })
      .then(async (blob) => {
        if (!isMounted || !docxContainerRef.current) return;
        docxContainerRef.current.innerHTML = "";
        await renderAsync(blob, docxContainerRef.current, null, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          useBase64URL: true,
        });
        if (isMounted) setDocLoading(false);
      })
      .catch((err) => {
        console.error("DOCX render error:", err);
        if (isMounted) {
          setDocError("Failed to render Word document preview.");
          setDocLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileUrl, isDocx]);

  // Load and render Excel / CSV file
  useEffect(() => {
    if (!isExcel || !fileUrl) return;
    let isMounted = true;
    setExcelLoading(true);
    setExcelError(null);

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch spreadsheet (${res.status})`);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        if (!isMounted) return;
        const wb = XLSX.read(buffer, { type: "array" });
        setWorkbook(wb);
        setSheets(wb.SheetNames || []);
        setActiveSheet(wb.SheetNames?.[0] || "");
        setExcelLoading(false);
      })
      .catch((err) => {
        console.error("Excel render error:", err);
        if (isMounted) {
          setExcelError("Failed to render spreadsheet preview.");
          setExcelLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileUrl, isExcel]);

  // Extract sheet rows
  const sheetData = useMemo(() => {
    if (!workbook || !activeSheet || !workbook.Sheets?.[activeSheet]) return [];
    const ws = workbook.Sheets[activeSheet];
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  }, [workbook, activeSheet]);

  const handleContextMenu = (e) => {
    if (isViewOnly) {
      e.preventDefault();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm select-none"
      onContextMenu={handleContextMenu}
      style={{ userSelect: isViewOnly ? "none" : "auto" }}
    >
      {/* CSS to hide during printing & docx container styling */}
      <style>{`
        @media print {
          body {
            display: none !important;
          }
          .secure-viewer-container {
            display: none !important;
          }
        }
        .docx-wrapper {
          background: transparent !important;
          padding: 24px 16px !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .docx-wrapper > section.docx {
          background: #ffffff !important;
          color: #1e293b !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2) !important;
          border-radius: 4px;
          margin-bottom: 24px !important;
          max-width: 100% !important;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {isViewOnly && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
              View Only Mode
            </div>
          )}
          <span className="font-semibold text-slate-200 truncate">{fileName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full w-8 h-8 p-0 flex items-center justify-center shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Document Container */}
      <div className="flex-1 overflow-hidden p-4 flex items-center justify-center relative bg-slate-950 secure-viewer-container">
        {isBlurred && isViewOnly && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 text-white p-6 text-center backdrop-blur-xl">
            <ShieldAlert className="w-16 h-16 text-amber-500 mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Viewing Paused</h3>
            <p className="text-slate-300 max-w-md text-base leading-relaxed">
              This document is protected. Content has been hidden to prevent unauthorized capture.
            </p>
            <button
              onClick={() => setIsBlurred(false)}
              className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
            >
              Resume Viewing
            </button>
          </div>
        )}

        <div
          className="w-full h-full max-w-5xl rounded-lg overflow-hidden border border-slate-800 bg-white transition-all duration-300 shadow-2xl relative z-10 flex flex-col"
          style={{
            filter: isBlurred && isViewOnly ? "blur(40px) brightness(0.5)" : "none",
            pointerEvents: isBlurred ? "none" : "auto",
          }}
        >
          {/* Image */}
          {isImage && (
            <div className="w-full h-full flex items-center justify-center p-4 bg-slate-100 overflow-auto relative">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain shadow-md relative z-10"
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          )}

          {/* Video */}
          {isVideo && (
            <div className="w-full h-full flex items-center justify-center p-4 bg-black overflow-hidden relative">
              <video
                src={fileUrl}
                controls
                controlsList={isViewOnly ? "nodownload" : undefined}
                disablePictureInPicture={isViewOnly}
                className="max-w-full max-h-full rounded relative z-10"
                onContextMenu={handleContextMenu}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Audio */}
          {isAudio && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 relative">
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-xl max-w-md w-full text-center space-y-4">
                <p className="text-white font-medium truncate">{fileName}</p>
                <audio
                  src={fileUrl}
                  controls
                  controlsList={isViewOnly ? "nodownload" : undefined}
                  className="w-full"
                  onContextMenu={handleContextMenu}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {/* Word Document (.docx) */}
          {isDocx && (
            <div className="w-full h-full flex flex-col bg-slate-200/80 overflow-hidden relative">
              {docLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Loading Word Document...</p>
                </div>
              )}
              {docError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <FileText className="w-12 h-12 text-slate-400" />
                  <p className="text-sm text-slate-600">{docError}</p>
                </div>
              ) : (
                <div
                  ref={docxContainerRef}
                  className="w-full h-full overflow-auto flex-1 custom-scrollbar"
                />
              )}
            </div>
          )}

          {/* Excel Spreadsheet (.xlsx, .xls, .csv) */}
          {isExcel && (
            <div className="w-full h-full flex flex-col bg-slate-100 overflow-hidden relative">
              {excelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Loading Spreadsheet...</p>
                </div>
              )}

              {excelError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <FileSpreadsheet className="w-12 h-12 text-slate-400" />
                  <p className="text-sm text-slate-600">{excelError}</p>
                </div>
              ) : (
                <>
                  {/* Spreadsheet Grid */}
                  <div className="flex-1 overflow-auto p-4">
                    {sheetData.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 text-sm">
                        Sheet is empty
                      </div>
                    ) : (
                      <div className="inline-block min-w-full align-middle shadow-sm border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 divide-x divide-slate-200">
                              <th className="w-12 px-2 py-2 text-slate-400 font-mono text-center select-none bg-slate-200/70">
                                #
                              </th>
                              {sheetData[0]?.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="px-3 py-2 text-left font-semibold text-slate-700 whitespace-nowrap bg-slate-100"
                                >
                                  {col !== "" && col !== undefined ? String(col) : `Col ${idx + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sheetData.slice(1).map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="hover:bg-indigo-50/30 divide-x divide-slate-100 transition-colors"
                              >
                                <td className="w-12 px-2 py-1.5 text-slate-400 font-mono text-center select-none bg-slate-50">
                                  {rowIdx + 1}
                                </td>
                                {sheetData[0]?.map((_, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-3 py-1.5 text-slate-700 whitespace-nowrap overflow-hidden max-w-xs truncate"
                                    title={row[colIdx] !== undefined ? String(row[colIdx]) : ""}
                                  >
                                    {row[colIdx] !== undefined && row[colIdx] !== null
                                      ? String(row[colIdx])
                                      : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Excel Sheet Tabs */}
                  {sheets.length > 0 && (
                    <div className="flex items-center gap-1 px-4 py-2 bg-slate-200 border-t border-slate-300 overflow-x-auto shrink-0">
                      {sheets.map((sheetName) => (
                        <button
                          key={sheetName}
                          onClick={() => setActiveSheet(sheetName)}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-t transition-all ${
                            activeSheet === sheetName
                              ? "bg-white text-emerald-700 shadow-sm border-t-2 border-emerald-600 font-semibold"
                              : "text-slate-600 hover:bg-slate-300/70"
                          }`}
                        >
                          {sheetName}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PDF & Other supported formats via Iframe */}
          {!isImage && !isVideo && !isAudio && !isDocx && !isExcel && (
            <iframe
              src={
                isPdf
                  ? `${fileUrl}#toolbar=${isViewOnly ? 0 : 1}&navpanes=0&statusbar=0`
                  : `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`
              }
              title={fileName}
              className="w-full h-full border-none relative z-10"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SecureDocumentViewer;
