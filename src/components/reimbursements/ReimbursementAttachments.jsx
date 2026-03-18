import React from "react";
import { Download, FileText, UploadCloud, X } from "lucide-react";

const ReimbursementAttachments = ({
  attachments = [],
  editable = false,
  onAddFiles,
  onRemoveFile,
}) => {
  return (
    <div className="space-y-4">
      {editable && (
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700">
          <UploadCloud className="h-5 w-5" />
          Upload supporting attachments
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => onAddFiles?.(event.target.files)}
          />
        </label>
      )}

      {attachments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
          No attachments added.
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment, index) => {
            const isUploaded = Boolean(attachment?.file_url);
            const name =
              attachment?.file_name || attachment?.name || `Attachment ${index + 1}`;

            return (
              <div
                key={attachment?.id || `${name}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {attachment?.size
                        ? `${Math.round(attachment.size / 1024)} KB`
                        : isUploaded
                          ? "Uploaded"
                          : "Ready to upload"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isUploaded && (
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      title="Open attachment"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  {editable && !isUploaded && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile?.(index)}
                      className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50"
                      title="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReimbursementAttachments;
