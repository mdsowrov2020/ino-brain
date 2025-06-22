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

// Allowed types & max size
const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".html"];

const maxFileSize = 10 * 1024 * 1024; // 10MB

const UploadFile = () => {
  // State & Refs
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      return `File type ${extension} is not allowed. Accepted types: ${allowedExtensions.join(
        ", "
      )}`;
    }
    if (file.size > maxFileSize) {
      return `File size must be less than 10MB. Current size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`;
    }
    return null;
  };

  // API Calls
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Failed to fetch documents");

      const data = await response.json();
      const transformedFiles: FileItem[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.fileName || item.name,
        type: getFileType(item.fileName || item.name),
        size: item.formattedSize || formatFileSize(item.size),
        date: new Date(item.created_at || item.createdAt).toLocaleString(),
        status: "Uploaded",
        url: item.fileUrl || item.url,
      }));

      setFiles(transformedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      setErrors((prev) => [...prev, "Failed to load documents"]);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const newFile: FileItem = {
      id: tempId,
      name: file.name,
      type: getFileType(file.name),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      date: new Date().toLocaleString(),
      status: "Processing",
    };

    setFiles((prev) => [newFile, ...prev]);
    setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId
              ? {
                  ...f,
                  id: `uploaded-${Date.now()}`,
                  status: "Uploaded",
                  url: result.url,
                  size: result.fileSize || f.size,
                }
              : f
          )
        );
        setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));
        setTimeout(fetchFiles, 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, status: "Failed" } : f))
      );
      setErrors((prev) => [
        ...prev,
        `Failed to upload ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
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

  const removeFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/documents/${fileId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file");
      }
      setFiles((prev) => prev.filter((f) => +f.id !== fileId));
    } catch (error) {
      console.error("Delete error:", error);
      setErrors((prev) => [
        ...prev,
        `Failed to delete file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
    }
  };

  // Handlers
  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    filesArray.forEach((file) => {
      const error = validateFile(file);
      if (error) validationErrors.push(error);
      else validFiles.push(file);
    });

    setErrors(validationErrors);
    for (const file of validFiles) await uploadFile(file);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) handleFiles(event.target.files);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const refreshFiles = async () => {
    setIsRefreshing(true);
    await fetchFiles();
    setIsRefreshing(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearErrors = () => setErrors([]);

  // Columns
  const columns: ColumnDefinition<FileItem, keyof FileItem>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <FiFile className="h-5 w-5 text-gray-400" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-200 truncate max-w-xs">
              {value}
            </div>
            {uploadProgress[row.id] !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
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
      sortable: true,
      render: (value) => (
        <span className={`text-sm ${getTypeColor(value)}`}>{value}</span>
      ),
    },
    { key: "size", header: "Size", sortable: true },
    { key: "date", header: "Date", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value}
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
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-900 p-1"
            >
              <FiDownload className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => removeFile(row.id)}
            className="text-red-600 hover:text-red-900 p-1"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 p-1">
            <FiMoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Initial Load
  useEffect(() => {
    fetchFiles();
  }, []);

  // Render
  return (
    <>
      {/** Error Messages */}
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">
                Upload Errors
              </h3>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-400 hover:text-red-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2">
            {errors.map((err, idx) => (
              <p key={idx} className="text-sm text-red-700">
                {err}
              </p>
            ))}
          </div>
        </div>
      )}

      {/** Loading State */}
      {isLoading && (
        <div className="mb-4 p-8 text-center">
          <FiRefreshCw className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-2" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      )}

      {/** Drop Zone */}
      <div
        className={`rounded-md bg-gray-700/15 border-2 border-dashed h-[250px] w-full p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-blue-400 bg-blue-50/50 scale-105"
            : "border-gray-500/30 hover:border-gray-400/50 hover:bg-gray-50/50"
        }`}
        onClick={triggerFileInput}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEnter}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <FiUpload
            className={`w-12 h-12 ${
              isDragOver ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg font-medium ${
              isDragOver ? "text-blue-700" : "text-gray-700"
            }`}
          >
            {isDragOver ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-sm text-gray-500">or click to browse</p>
          <p className="text-xs text-gray-400">
            Accepted files: PDF, DOCX, TXT, MD, HTML (Max 10MB each)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept={allowedExtensions.join(",")}
        />
      </div>

      {/** Table */}
      {!isLoading && (
        <div className="mt-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-200">
              Documents ({files.length})
            </h3>
            <button
              onClick={refreshFiles}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiFile className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <Table data={files} columns={columns} rowKey={(row) => row.id} />
          )}
        </div>
      )}
    </>
  );
};

export default UploadFile;
