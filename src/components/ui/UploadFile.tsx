"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FiUpload,
  FiX,
  FiCheck,
  FiFile,
  FiDownload,
  FiTrash2,
  FiMoreVertical,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import Table, { ColumnDefinition } from "./Table";
import {
  formatFileSize,
  getFileType,
  getStatusColor,
  getTypeColor,
} from "@/utils/helper";
import { FileItem } from "@/features/upload-documents/types/fileItem";

const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".html"];
const maxFileSize = 10 * 1024 * 1024;

const UploadFile = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
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
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      const transformed: FileItem[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.fileName || item.name,
        type: getFileType(item.fileName || item.name),
        size: item.formattedSize || formatFileSize(item.size),
        date: new Date(item.created_at || item.createdAt).toLocaleString(),
        status: "Uploaded",
        url: item.fileUrl || item.url,
        process: item.process ?? false,
      }));

      setFiles(transformed);
    } catch (e) {
      setErrors((prev) => [...prev, "Failed to load documents"]);
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (documentId: string) => {
    if (!documentId) return { success: false, error: "Missing document ID" };

    try {
      const response = await fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      const responseText = await response.text();

      if (!responseText.trim()) {
        return { success: false, error: "Empty server response" };
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        return responseText.includes("<html")
          ? { success: false, error: "Server returned HTML instead of JSON" }
          : {
              success: false,
              error: `Invalid JSON: ${responseText.slice(0, 200)}...`,
            };
      }

      if (!response.ok) {
        return { success: false, error: parsed?.error || "Processing failed" };
      }

      return parsed.success
        ? { success: true, data: parsed.data }
        : {
            success: false,
            error: parsed?.error || "Unknown processing error",
          };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Unexpected error",
      };
    }
  };

  const uploadFile = async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    const newFile: FileItem = {
      id: tempId,
      name: file.name,
      type: getFileType(file.name),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      date: new Date().toLocaleString(),
      status: "Processing",
      process: false,
    };

    setFiles((prev) => [newFile, ...prev]);
    setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      // ================

      // ===============

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

      const actualId = result.id || `uploaded-${Date.now()}`;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? {
                ...f,
                id: actualId,
                status: "Uploaded",
                url: result.url,
                process: false,
              }
            : f
        )
      );
      setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));

      const processed = await processFile(actualId);

      if (processed.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === actualId ? { ...f, status: "Processed", process: true } : f
          )
        );
        setIsProcessed(true);
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === actualId
              ? { ...f, status: "Processing Failed", process: false }
              : f
          )
        );
        setErrors((prev) => [...prev, `Processing error: ${processed.error}`]);
      }

      setTimeout(fetchFiles, 1000);
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, status: "Failed" } : f))
      );
      setErrors((prev) => [
        ...prev,
        `Upload error: ${err?.message || "Unknown"}`,
      ]);
    } finally {
      setTimeout(() => {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[tempId];
          return updated;
        });
      }, 2000);
    }
  };

  const removeFile = async (fileId: number | string) => {
    try {
      const res = await fetch(`/api/documents/${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
      setFiles((prev) => prev.filter((f) => f.id !== fileId.toString()));
    } catch (err: any) {
      setErrors((prev) => [...prev, `Delete error: ${err.message}`]);
    }
  };

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const filesArr = Array.from(fileList);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const f of filesArr) {
      const error = validateFile(f);
      if (error) errors.push(error);
      else valid.push(f);
    }

    setErrors(errors);
    for (const file of valid) await uploadFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const columns: ColumnDefinition<FileItem, keyof FileItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (val, row) => (
        <div className="flex items-center">
          <FiFile className="h-5 w-5 text-gray-400" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-200 truncate max-w-xs">
              {val}
            </div>
            {uploadProgress[row.id] !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all"
                  style={{ width: `${uploadProgress[row.id]}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (value) => (
        <span className={`text-sm ${getTypeColor(value)}`}>{value}</span>
      ),
    },
    { key: "size", header: "Size" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <span
          className={`px-2 text-xs font-semibold rounded-full ${getStatusColor(
            row.status
          )}`}
        >
          {row.process ? "Processed" : row.status}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.url && (
            <a
              href={row.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 p-1"
            >
              <FiDownload className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => removeFile(row.id)}
            className="text-red-600 p-1"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <>
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">
                Upload Errors
              </h3>
            </div>
            <button onClick={() => setErrors([])} className="text-red-400">
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-sm text-red-700 space-y-1">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-8">
          <FiRefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all ${
          isDragOver ? "bg-blue-50 border-blue-400" : "bg-white border-gray-300"
        }`}
      >
        <FiUpload className="w-10 h-10 mx-auto text-gray-400" />
        <p className="text-gray-700 mt-2">
          Drag & drop files here or click to upload
        </p>
        <p className="text-xs text-gray-400">
          Accepted: PDF, DOCX, TXT, MD, HTML • Max 10MB each
        </p>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedExtensions.join(",")}
          className="hidden"
        />
      </div>

      {!isLoading && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Documents ({files.length})
            </h3>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await fetchFiles();
                setIsRefreshing(false);
              }}
              className="flex items-center text-sm px-3 py-2 border rounded-md"
            >
              <FiRefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {files.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <FiFile className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              No documents uploaded
            </div>
          ) : (
            <Table data={files} columns={columns} rowKey={(r) => r.id} />
          )}
        </div>
      )}
    </>
  );
};

export default UploadFile;
