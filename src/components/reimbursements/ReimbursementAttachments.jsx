import { useState } from "react";
import { Download, Eye, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { buildUploadUrl, downloadFile } from "../../lib/utils/fileUtils";

const formatFileSize = (bytes) => {
  if (!bytes || Number.isNaN(Number(bytes))) return null;
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${Math.round(num / 1024)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const ReimbursementAttachments = ({
  attachments = [],
  editable = false,
  onAddFiles,
  onRemoveFile,
}) => {
  const [downloadingIndex, setDownloadingIndex] = useState(null);

  const handleDownload = async (attachment, index) => {
    const fileUrl = buildUploadUrl(attachment?.file_url);
    if (!fileUrl) {
      toast.error("File URL is not available");
      return;
    }

    const fileName =
      attachment?.file_name || attachment?.name || `attachment-${index + 1}`;

    try {
      setDownloadingIndex(index);
      toast.info(`Downloading ${fileName}...`);
      await downloadFile(fileUrl, fileName);
    } catch (error) {
      console.error("Failed to download attachment:", error);
      toast.error("Failed to download attachment");
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      {editable && (
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700">
          <UploadCloud className="h-5 w-5" />
          <div className="flex flex-col">
            <span>Upload supporting attachments</span>
            <span className="text-xs text-slate-400 font-normal">
              PDF, Images, Word, Excel (Max size: 5MB per file)
            </span>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                  toast.error(`File "${file.name}" exceeds 5MB limit.`);
                  event.target.value = "";
                  return;
                }
              }
              onAddFiles?.(event.target.files);
              event.target.value = "";
            }}
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
            const fileUrl = isUploaded ? buildUploadUrl(attachment.file_url) : null;
            const sizeLabel = formatFileSize(attachment?.size);
            const isDownloading = downloadingIndex === index;

            return (
              <div
                key={attachment?.id || `${name}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800" title={name}>
                      {name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {sizeLabel || (isUploaded ? "Uploaded" : "Ready to upload")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isUploaded && fileUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => window.open(fileUrl, "_blank", "noopener,noreferrer")}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        title="View attachment in new tab"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment, index)}
                        disabled={isDownloading}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                        title="Download attachment"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    </>
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

