// Define the expected shape of the document data
export interface DocumentData {
  id: number;
  created_at: string;
  fileName: string;
  fileUrl: string;
  user: string | null;
  type: string;
  size: number;
  process: boolean;
  storagePath: string;
}

const API_BASE_URL = "http://localhost:3000/api/documents";

export async function getDocumentById(
  id: number | string
): Promise<DocumentData> {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch document. Status: ${res.status}`);
    }

    const json = await res.json();
    return json.data as DocumentData; // only return the "data" part
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}
