import supabase from "@/lib/supabase";
import pdfParse from "pdf-parse";
import { chunkText } from "@/lib/document-processor";

export async function parsePdfDocument(documentId: string) {
  try {
    // Fetch document metadata
    const { data: docMeta, error: metaError } = await supabase
      .from("documents")
      .select("id, fileName, type, fileUrl")
      .eq("id", documentId)
      .single();

    if (metaError) {
      throw new Error(`Database error: ${metaError.message}`);
    }

    if (!docMeta) {
      throw new Error("Document not found");
    }

    // Normalize the type check
    const normalizedType = docMeta.type.toLowerCase();
    if (
      normalizedType !== "pdf" &&
      !docMeta.fileName.toLowerCase().endsWith(".pdf")
    ) {
      throw new Error(
        `Not a PDF file. Type: ${docMeta.type}, FileName: ${docMeta.fileName}`
      );
    }

    console.log(`Processing PDF: ${docMeta.fileName}, Type: ${docMeta.type}`);

    // Download file from Supabase storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("documents")
      .download(docMeta.fileName);

    if (fileError) {
      throw new Error(`Storage error: ${fileError.message}`);
    }

    if (!fileData) {
      throw new Error("File data is empty");
    }

    if (fileData.size > 10 * 1024 * 1024) {
      throw new Error("File too large (max 10MB)");
    }

    console.log(`Downloaded PDF buffer size: ${fileData.size}`);

    // Convert to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Add timeout for PDF parsing
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("PDF parsing timeout")), 30000)
    );

    // Parse PDF with timeout
    const pdfData = await Promise.race([
      pdfParse(buffer, {
        // PDF parsing options
        max: 0, // No page limit
        version: "v1.10.100", // Specify version if needed
      }),
      timeoutPromise,
    ]);

    const rawText = pdfData.text;
    console.log(`Extracted text length: ${rawText.length}`);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error(
        "No text found in PDF - document may be image-based or corrupted"
      );
    }

    // Clean and chunk the text
    const cleanedText = rawText
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .trim();

    const chunks = chunkText(cleanedText);
    console.log(`Created ${chunks.length} chunks`);

    return {
      success: true,
      documentId,
      fileName: docMeta.fileName,
      textLength: cleanedText.length,
      chunkCount: chunks.length,
      rawText:
        cleanedText.substring(0, 1000) +
        (cleanedText.length > 1000 ? "..." : ""),
      chunks,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw error; // Re-throw to be handled by the calling function
  }
}
