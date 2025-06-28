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
  waitForDocument,
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
  /*
  const processFile = async (documentId: string) => {
  if (!documentId) return { success: false, error: "Missing document ID" };

  try {
    // Step 1: Call /api/documents/process
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

    // Step 2: If process is true, call the update API
    if (parsed?.data?.process === true) {
      const updateRes = await fetch(`/api/documents/${documentId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process: true }),
      });

      const updateJson = await updateRes.json();

      if (!updateRes.ok || !updateJson.success) {
        return {
          success: false,
          error: updateJson?.error || "Failed to update process field",
        };
      }

      return {
        success: true,
        data: updateJson.data,
      };
    }

    return {
      success: false,
      error: "Processing did not return process: true",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Unexpected error",
    };
  }
};

*/

  const processFile = async (documentId: string) => {
    console.log("🚀 Starting processFile for documentId:", documentId);

    if (!documentId) {
      console.error("❌ Missing document ID");
      return { success: false, error: "Missing document ID" };
    }

    try {
      // Step 1: Call /api/documents/vectorize (which calls process internally)
      console.log("📡 Step 1: Calling vectorize API...");

      const response = await fetch("/api/documents/vectorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      console.log(
        "📡 Vectorize response status:",
        response.status,
        response.statusText
      );
      console.log(
        "📡 Vectorize response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("📡 Vectorize raw response:", responseText.substring(0, 500));

      if (!responseText.trim()) {
        console.error("❌ Empty server response from vectorize");
        return { success: false, error: "Empty server response" };
      }

      // Parse response
      let parsed;
      try {
        parsed = JSON.parse(responseText);
        console.log("✅ Vectorize parsed response:", parsed);
      } catch (parseError) {
        console.error("❌ Failed to parse vectorize response:", parseError);
        return responseText.includes("<html")
          ? { success: false, error: "Server returned HTML instead of JSON" }
          : {
              success: false,
              error: `Invalid JSON: ${responseText.slice(0, 200)}...`,
            };
      }

      if (!response.ok) {
        console.error("❌ Vectorize API failed:", parsed?.error);
        return {
          success: false,
          error: parsed?.error || "Vectorization failed",
        };
      }

      // Step 2: If vectorize was successful, mark as processed in DB
      if (parsed?.success) {
        console.log("📡 Step 2: Updating process field in DB...");

        const updateRes = await fetch(`/api/documents/${documentId}/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ process: true }),
        });

        console.log(
          "📡 Process update response status:",
          updateRes.status,
          updateRes.statusText
        );

        const updateResponseText = await updateRes.text();
        console.log("📡 Process update raw response:", updateResponseText);

        let updateJson;
        try {
          updateJson = JSON.parse(updateResponseText);
          console.log("✅ Process update parsed response:", updateJson);
        } catch (parseError) {
          console.error(
            "❌ Failed to parse process update response:",
            parseError
          );
          return {
            success: false,
            error: `Failed to parse update response: ${updateResponseText.slice(
              0,
              200
            )}`,
          };
        }

        if (!updateRes.ok || !updateJson.success) {
          console.error(
            "❌ Failed to update process field:",
            updateJson?.error
          );
          return {
            success: false,
            error: updateJson?.error || "Failed to update process field",
          };
        }

        console.log("✅ Successfully processed file!");
        return {
          success: true,
          data: {
            vectorizeMessage: parsed.message,
            storedChunks: parsed.storedChunks,
            updatedDocument: updateJson.data,
          },
        };
      }

      console.error("❌ Vectorization did not return success flag");
      return {
        success: false,
        error: "Vectorization completed but success flag not set",
      };
    } catch (err: any) {
      console.error("❌ Unexpected error in processFile:", err);
      console.error("❌ Error stack:", err.stack);
      return {
        success: false,
        error: err?.message || "Unexpected error",
      };
    }
  };

  /*  ====== Old ====================
  const uploadFile = async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    const newFile: FileItem = {
      id: tempId,
      name: file.name,
      type: getFileType(file.name),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      date: new Date().toLocaleString(),
      status: "Uploading", // Changed from "Processing" to be more clear
      process: false,
    };

    setFiles((prev) => [newFile, ...prev]);
    setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload the file
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

      // Step 1: Update status to "Uploaded" after successful upload
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

      // Step 2: Process the file
      console.log("Starting file processing for ID:", actualId);

      // Update status to show processing is in progress
      setFiles((prev) =>
        prev.map((f) =>
          f.id === actualId ? { ...f, status: "Processing" } : f
        )
      );

      const processed = await processFile(actualId);
      console.log("Processing result from frontend:", processed);

      // Step 3: Update status based on processing result
      if (processed.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === actualId ? { ...f, status: "Processed", process: true } : f
          )
        );
        setIsProcessed(true);
        console.log("File successfully processed:", actualId);
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === actualId
              ? { ...f, status: "Processing Failed", process: false }
              : f
          )
        );
        setErrors((prev) => [...prev, `Processing error: ${processed.error}`]);
        console.error("Processing failed:", processed.error);
      }

      // Refresh the files list after a short delay to sync with server
      setTimeout(fetchFiles, 1000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "Upload Failed" } : f
        )
      );
      setErrors((prev) => [
        ...prev,
        `Upload error: ${err?.message || "Unknown"}`,
      ]);
    } finally {
      // Clean up progress indicator after a delay
      setTimeout(() => {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[tempId];
          return updated;
        });
      }, 2000);
    }
  };

  */

  const uploadFile = async (file: File) => {
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

    setFiles((prev) => [newFile, ...prev]);
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

      // Step 2: Wait for the document to exist in DB before processing
      const isReady = await waitForDocument(actualId);
      if (!isReady) throw new Error("Document not found in DB after upload");

      // Step 3: Process
      console.log("Starting file processing for ID:", actualId);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === actualId ? { ...f, status: "Processing" } : f
        )
      );

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
      console.error("Upload error:", err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "Upload Failed" } : f
        )
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
        <div className="mb-4 p-4 bg-gray-50 border border-red-200 rounded-md">
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
