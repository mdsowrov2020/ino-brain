import supabase from "@/lib/supabase";
import { extractText, chunkText } from "@/lib/document-processor";

export async function parsePdfDocument(documentId: string) {
  const { data: docMeta, error: metaError } = await supabase
    .from("documents")
    .select("id, fileName, type, fileUrl")
    .eq("id", documentId)
    .single();

  if (metaError) {
    throw new Error(`Database error: ${metaError.message}`);
  }

  if (!docMeta) throw new Error("Document not found");

  if (docMeta.type !== "pdf") {
    throw new Error("Not a PDF file");
  }

  const fileName = docMeta.fileName;

  const { data: fileData, error: fileError } = await supabase.storage
    .from("documents")
    .download(fileName);

  if (fileError) {
    throw new Error(`Storage error: ${fileError.message}`);
  }

  if (!fileData) throw new Error("File data is empty");

  if (fileData.size > 10 * 1024 * 1024) {
    throw new Error("File too large (max 10MB)");
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const rawText = await extractText(buffer, "application/pdf");

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("No text found in PDF");
  }

  const chunks = chunkText(rawText);

  return {
    success: true,
    documentId,
    fileName: docMeta.fileName,
    textLength: rawText.length,
    chunkCount: chunks.length,
    rawText: rawText.substring(0, 1000) + (rawText.length > 1000 ? "..." : ""),
    chunks,
  };
}
