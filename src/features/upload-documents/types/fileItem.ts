export type FileItem = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "MD" | "HTML";
  size: string;
  date: string;
  status: "Uploaded" | "Processing" | "Failed";
  url?: string;
};
