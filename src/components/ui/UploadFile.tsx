"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  FiUpload,
  FiX,
  FiFile,
  FiDownload,
  FiTrash2,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import Table, { ColumnDefinition } from "./Table";
import {
  getStatusColor,
  getTypeColor,
  formatFileSize,
  getFileType,
} from "@/utils/helper";
import { FileItem } from "@/features/upload-documents/types/fileItem";
import { useFiles } from "@/hooks/useFiles";
import { useUpload } from "@/hooks/useUpload";
import { useProcess } from "@/hooks/useProcess";

const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".html"];

const UploadFile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use custom hooks
  const {
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
  } = useFiles();

  // Transform raw API data to FileItem format
  const transformFilesData = useCallback((data: any[]) => {
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.fileName || item.name,
      type: getFileType(item.fileName || item.name),
      size: item.formattedSize || formatFileSize(item.size),
      date: new Date(item.created_at || item.createdAt).toLocaleString(),
      status: "Uploaded",
      url: item.fileUrl || item.url,
      process: item.process ?? false,
    }));
  }, []);

  // Load files on component mount
  const loadFiles = useCallback(async () => {
    const data = await fetchFiles();
    if (data) {
      const transformedFiles = transformFilesData(data);
      setFilesData(transformedFiles);
    }
  }, [fetchFiles, transformFilesData, setFilesData]);

  // Custom refresh function that handles transformation
  const handleRefreshFiles = useCallback(async () => {
    const data = await refreshFiles();
    if (data) {
      const transformedFiles = transformFilesData(data);
      setFilesData(transformedFiles);
    }
  }, [refreshFiles, transformFilesData, setFilesData]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const { processFile } = useProcess();

  const {
    uploadProgress,
    isDragOver,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  } = useUpload({
    onFileAdd: addFile,
    onFileUpdate: updateFileStatus,
    onError: addError,
    onProcessFile: processFile,
    onRefreshFiles: handleRefreshFiles, // Use the custom refresh function
  });

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
          className={`px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(
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

  return (
    <>
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">
                Upload Errors
              </h3>
            </div>
            <button onClick={clearErrors} className="text-red-400">
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? "bg-blue-50 border-blue-400"
            : "bg-gray-700/30 border-gray-800"
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
            <h3 className="text-lg font-medium text-gray-300">
              Documents ({files.length})
            </h3>
            <button
              onClick={handleRefreshFiles}
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
