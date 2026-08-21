import React, { useEffect, useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";

const SecureDocumentViewer = ({ fileUrl, fileName, accessType, onClose }) => {
  const isViewOnly = accessType === "view";
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    if (!isViewOnly) return;

    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    // Listen to focus and blur events on the window
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Also handle visibility change (switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Disable print screen key if possible (only limited support, but good deterrent)
    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
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

  const handleContextMenu = (e) => {
    if (isViewOnly) {
      e.preventDefault();
    }
  };

  // Check if file is image or PDF/other
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl || "");

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm select-none"
      onContextMenu={handleContextMenu}
      style={{ userSelect: isViewOnly ? "none" : "auto" }}
    >
      {/* CSS to hide during printing */}
      <style>{`
        @media print {
          body {
            display: none !important;
          }
          .secure-viewer-container {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 text-white shrink-0">
        <div className="flex items-center gap-3">
          {isViewOnly && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              View Only Mode
            </div>
          )}
          <span className="font-semibold text-slate-200 truncate max-w-md">{fileName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full w-8 h-8 p-0 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Document Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-slate-950 secure-viewer-container">
        
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
          className="w-full h-full max-w-5xl rounded-lg overflow-hidden border border-slate-800 bg-white transition-all duration-300 shadow-2xl relative z-10"
          style={{ 
            filter: isBlurred && isViewOnly ? "blur(40px) brightness(0.5)" : "none",
            pointerEvents: isBlurred ? "none" : "auto"
          }}
        >
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4 bg-slate-100 overflow-auto relative">
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="max-w-full max-h-full object-contain shadow-md relative z-10"
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          ) : (
            <iframe
              src={`${fileUrl}#toolbar=${isViewOnly ? 0 : 1}&navpanes=0&statusbar=0`}
              title={fileName}
              className="w-full h-full border-none relative z-10"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureDocumentViewer;
