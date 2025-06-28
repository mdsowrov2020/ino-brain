import { FileItem } from "@/features/upload-documents/types/fileItem";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const getFileType = (fileName: string): FileItem["type"] => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "PDF";
    case "docx":
      return "DOCX";
    case "txt":
      return "TXT";
    case "md":
      return "MD";
    case "html":
      return "HTML";
    default:
      return "TXT";
  }
};

export const getTypeColor = (type: FileItem["type"]) => {
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

export const getStatusColor = (status: FileItem["status"]) => {
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

// utils/waitForDocument.ts
export async function waitForDocument(
  documentId: string,
  maxRetries = 10,
  delayMs = 300
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔄 Polling for document ${documentId}, attempt ${i + 1}`);
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return true;
      }
    } catch (e) {
      console.log("Polling failed:", e);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}
