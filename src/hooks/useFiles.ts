// hooks/useFiles.ts
import { useState, useCallback } from "react";
import { FileItem } from "@/features/upload-documents/types/fileItem";

export const useFiles = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      return data; // Return raw data only
    } catch (e) {
      setErrors((prev) => [...prev, "Failed to load documents"]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    setIsRefreshing(true);
    const data = await fetchFiles();
    setIsRefreshing(false);
    return data;
  }, [fetchFiles]);

  const removeFile = useCallback(async (fileId: number | string) => {
    try {
      const res = await fetch(`/api/documents/${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
      setFiles((prev) => prev.filter((f) => f.id !== fileId.toString()));
    } catch (err: any) {
      setErrors((prev) => [...prev, `Delete error: ${err.message}`]);
    }
  }, []);

  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<FileItem>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const addFile = useCallback((file: FileItem) => {
    setFiles((prev) => [file, ...prev]);
  }, []);

  const setFilesData = useCallback((filesData: FileItem[]) => {
    setFiles(filesData);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addError = useCallback((error: string) => {
    setErrors((prev) => [...prev, error]);
  }, []);

  return {
    files,
    isLoading,
    isRefreshing,
    errors,
    fetchFiles,
    refreshFiles,
    removeFile,
    updateFileStatus,
    addFile,
    setFilesData,
    clearErrors,
    addError,
  };
};
