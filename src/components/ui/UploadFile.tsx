"use client";
import React, { useRef, useState } from "react";
import {
  FiUpload,
  FiX,
  FiCheck,
  FiFile,
  FiDownload,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import Table from "./Table";
type FileItem = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "MD" | "HTML";
  size: string;
  date: string;
  status: "Uploaded" | "Processing" | "Failed";
};

export type ColumnDefinition<T, K extends keyof T> = {
  key: K; // Property key from the data type T
  header: string; // Column header text
  width?: string; // Optional width (e.g., "200px")
  render?: (value: T[K], row: T) => React.ReactNode; // Custom render function
  sortable?: boolean; // Whether column is sortable
  align?: "left" | "center" | "right"; // Text alignment
  hidden?: boolean; // Whether to hide the column
};
const UploadFile = () => {
  // Dummy data
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Project_Proposal.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "2023-05-15 14:30",
      status: "Uploaded",
    },
    {
      id: "2",
      name: "User_Manual.docx",
      type: "DOCX",
      size: "1.8 MB",
      date: "2023-05-14 10:15",
      status: "Processing",
    },
    {
      id: "3",
      name: "Notes.txt",
      type: "TXT",
      size: "12 KB",
      date: "2023-05-13 16:45",
      status: "Uploaded",
    },
    {
      id: "4",
      name: "README.md",
      type: "MD",
      size: "8 KB",
      date: "2023-05-12 09:20",
      status: "Uploaded",
    },
    {
      id: "5",
      name: "index.html",
      type: "HTML",
      size: "45 KB",
      date: "2023-05-10 11:10",
      status: "Failed",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Allowed file types
  const allowedExtensions = [".pdf", ".docx", ".txt", ".md", ".html"];
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/html",
  ];

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Columns

  const getTypeColor = (type: FileItem["type"]) => {
    switch (type) {
      case "PDF":
        return "text-red-500";
      case "DOCX":
        return "text-blue-500";
      case "TXT":
        return "text-gray-500";
      case "MD":
        return "text-gray-700";
      case "HTML":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusColor = (status: FileItem["status"]) => {
    switch (status) {
      case "Uploaded":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDefinition<FileItem, keyof FileItem>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <FiFile className="flex-shrink-0 h-5 w-5 text-gray-400" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-400 truncate max-w-xs">
              {value}
            </div>
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
    {
      key: "size",
      header: "Size",
      sortable: true,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
    },
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
          <button className="text-blue-600 hover:text-blue-900 p-1">
            <FiDownload className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-900 p-1">
            <FiTrash2 className="h-4 w-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 p-1">
            <FiMoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className="rounded-md bg-gray-700/15 border-2 border-dashed border-gray-500/30 h-[250px] w-full p-8 text-center cursor-pointer"
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <FiUpload className="w-12 h-12 text-gray-400" />
          <p className="text-lg font-medium text-gray-700">
            Drag and drop files here
          </p>
          <p className="text-sm text-gray-500">or click to browse</p>
          <p className="text-xs text-gray-400">
            Accepted files: PDF, DOCX, TXT, MD, HTML
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          // onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".pdf,.docx,.txt,.md,.html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/html"
        />
      </div>

      <div className="mt-5">
        <Table
          data={files}
          columns={columns}
          // sortConfig={sortConfig}
          // onSort={handleSort}
          rowKey={(row) => row.id}
        />
      </div>
    </>
  );
};

export default UploadFile;
