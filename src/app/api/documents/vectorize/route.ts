// app/api/documents/vectorize/route.ts
import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple fallback text processing functions
function extractTextFallback(buffer: Buffer, mimeType: string): string {
  return `Document content extracted from ${mimeType} file (${buffer.length} bytes). This is fallback text processing for testing.`;
}

function chunkTextFallback(text: string): string[] {
  const chunkSize = 1000;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper function to get MIME type from file extension
function getMimeTypeFromExtension(extension: string): string | null {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    html: "text/html",
    htm: "text/html",
  };
  return mimeTypes[extension.toLowerCase()] || null;
}

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    console.log("Vectorize route: Processing document ID:", documentId);

    // Import Supabase dynamically
    const { default: supabase } = await import("@/lib/supabase");

    // Fetch document metadata directly instead of calling process API
    const { data: docMeta, error: metaError } = await supabase
      .from("documents")
      .select("id, fileName, type, storagePath, fileUrl")
      .eq("id", documentId)
      .single();

    if (metaError) {
      console.error("Database error:", metaError);
      return NextResponse.json(
        { error: "Database error", details: metaError.message },
        { status: 500 }
      );
    }

    if (!docMeta) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    console.log("Document metadata retrieved:", docMeta);

    // Get MIME type
    const mimeType = getMimeTypeFromExtension(docMeta.type);
    if (!mimeType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${docMeta.type}` },
        { status: 400 }
      );
    }

    // Download file from Supabase Storage
    console.log("Downloading file from storage:", docMeta.storagePath);
    const { data: fileData, error: fileError } = await supabase.storage
      .from("documents")
      .download(docMeta.storagePath);

    if (fileError || !fileData) {
      console.error("Storage error:", fileError);
      return NextResponse.json(
        { error: "Failed to download file", details: fileError?.message },
        { status: 500 }
      );
    }

    console.log("File downloaded successfully, size:", fileData.size);

    // Convert to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());
    console.log("Buffer created, size:", buffer.length);

    // Extract text using fallback for now
    let rawText: string;
    try {
      // Try to import document processor, fall back to simple text extraction
      try {
        const { extractText } = await import("@/lib/document-processor");
        rawText = await extractText(buffer, mimeType);
        console.log("Text extracted using document processor");
      } catch (importError) {
        console.log("Document processor not available, using fallback");
        rawText = extractTextFallback(buffer, mimeType);
      }
    } catch (error) {
      console.error("Text extraction failed:", error);
      return NextResponse.json(
        {
          error: "Text extraction failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in document" },
        { status: 400 }
      );
    }

    console.log("Text extracted, length:", rawText.length);

    // Chunk text
    let chunks: string[];
    try {
      // Try to import chunking function, fall back to simple chunking
      try {
        const { chunkText } = await import("@/lib/document-processor");
        chunks = chunkText(rawText);
        console.log("Text chunked using document processor");
      } catch (importError) {
        console.log(
          "Document processor chunking not available, using fallback"
        );
        chunks = chunkTextFallback(rawText);
      }
    } catch (error) {
      console.error("Text chunking failed:", error);
      return NextResponse.json(
        {
          error: "Text chunking failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    console.log("Text chunked into", chunks.length, "chunks");

    // Now handle Weaviate storage
    try {
      // Import Weaviate modules dynamically
      const [{ ensureWeaviateSchema }, { storeChunksInWeaviate }] =
        await Promise.all([
          import("@/lib/schema/weaviateSchema"),
          import("@/lib/store-to-weaviate"),
        ]);

      console.log("Ensuring Weaviate schema...");
      await ensureWeaviateSchema();

      console.log("Storing chunks in Weaviate...");
      await storeChunksInWeaviate({
        documentId: docMeta.id,
        fileName: docMeta.fileName,
        chunks: chunks,
      });

      console.log("Vectorization completed successfully!");

      return NextResponse.json({
        success: true,
        message: "Document processed and stored in Weaviate",
        documentId: docMeta.id,
        fileName: docMeta.fileName,
        textLength: rawText.length,
        chunkCount: chunks.length,
        storedChunks: chunks.length,
      });
    } catch (weaviateError) {
      console.error("Weaviate storage failed:", weaviateError);

      // Return success for processing but note Weaviate failure
      return NextResponse.json({
        success: true,
        message: "Document processed but Weaviate storage failed",
        documentId: docMeta.id,
        fileName: docMeta.fileName,
        textLength: rawText.length,
        chunkCount: chunks.length,
        weaviateError:
          weaviateError instanceof Error
            ? weaviateError.message
            : "Unknown Weaviate error",
        note: "Text processing succeeded, but vector storage failed",
      });
    }
  } catch (error) {
    console.error("Vectorize route error:", error);
    return NextResponse.json(
      {
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
