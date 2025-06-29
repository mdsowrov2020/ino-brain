// hooks/useUpload.ts
import { useState, useCallback } from "react";
import { FileItem } from "@/features/upload-documents/types/fileItem";
import { getFileType, waitForDocument } from "@/utils/helper";

const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".html"];
const maxFileSize = 10 * 1024 * 1024;

interface UseUploadProps {
  onFileAdd: (file: FileItem) => void;
  onFileUpdate: (fileId: string, updates: Partial<FileItem>) => void;
  onError: (error: string) => void;
  onProcessFile: (
    documentId: string
  ) => Promise<{ success: boolean; error?: string }>;
  onRefreshFiles: () => void;
}

export const useUpload = ({
  onFileAdd,
  onFileUpdate,
  onError,
  onProcessFile,
  onRefreshFiles,
}: UseUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(ext)) {
      return `File type ${ext} not allowed. Accepted: ${allowedExtensions.join(
        ", "
      )}`;
    }
    if (file.size > maxFileSize) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB). Max: 10MB`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const tempId = `temp-${Date.now()}`;
      const newFile: FileItem = {
        id: tempId,
        name: file.name,
        type: getFileType(file.name),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toLocaleString(),
        status: "Uploading",
        process: false,
      };

      onFileAdd(newFile);
      setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Non-JSON server response");
        }

        if (!response.ok) throw new Error(result.error || "Upload failed");

        const actualId = result.id;
        if (!actualId) throw new Error("No document ID returned from server");

        // Step 1: Update UI with uploaded status
        onFileUpdate(tempId, {
          id: actualId,
          status: "Uploaded",
          url: result.url,
          process: false,
        });
        setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));

        // Step 2: Wait for the document to exist in DB before processing
        const isReady = await waitForDocument(actualId);
        if (!isReady) throw new Error("Document not found in DB after upload");

        // Step 3: Process
        console.log("Starting file processing for ID:", actualId);
        onFileUpdate(actualId, { status: "Processing" });

        const processed = await onProcessFile(actualId);

        if (processed.success) {
          onFileUpdate(actualId, { status: "Processed", process: true });
        } else {
          onFileUpdate(actualId, {
            status: "Processing Failed",
            process: false,
          });
          onError(`Processing error: ${processed.error}`);
        }

        setTimeout(onRefreshFiles, 1000);
      } catch (err: any) {
        console.error("Upload error:", err);
        onFileUpdate(tempId, { status: "Upload Failed" });
        onError(`Upload error: ${err?.message || "Unknown"}`);
      } finally {
        setTimeout(() => {
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[tempId];
            return updated;
          });
        }, 2000);
      }
    },
    [onFileAdd, onFileUpdate, onError, onProcessFile, onRefreshFiles]
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesArr = Array.from(fileList);
      const errors: string[] = [];
      const valid: File[] = [];

      for (const f of filesArr) {
        const error = validateFile(f);
        if (error) errors.push(error);
        else valid.push(f);
      }

      errors.forEach(onError);
      for (const file of valid) await uploadFile(file);
    },
    [validateFile, uploadFile, onError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return {
    uploadProgress,
    isDragOver,
    handleFiles,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    validateFile,
    uploadFile,
  };
};
