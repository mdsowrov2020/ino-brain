// app/api/documents/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

// Import the processor functions with error handling
async function safeExtractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    const { extractText } = await import("@/lib/document-processor");
    return await extractText(buffer, mimeType);
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error(
      `Failed to extract text: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function safeChunkText(text: string): Promise<string[]> {
  try {
    const { chunkText } = await import("@/lib/document-processor");
    return chunkText(text);
  } catch (error) {
    console.error("Text chunking failed:", error);
    throw new Error(
      `Failed to chunk text: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("Document processing API called");

  try {
    // Parse request body with error handling
    let documentId: string;
    try {
      const body = await req.json();
      documentId = body.documentId;
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    console.log("Processing document ID:", documentId);

    // Fetch metadata from Supabase with better error handling
    const { data: docMeta, error: metaError } = await supabase
      .from("documents")
      .select("id, fileName, type,storagePath, fileUrl")
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

    console.log("Document metadata:", docMeta);

    // Extract storage path from fileUrl (assuming it's the filename)
    const storagePath = docMeta.storagePath;
    const mimeType = getMimeTypeFromExtension(docMeta.type);

    if (!mimeType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${docMeta.type}` },
        { status: 400 }
      );
    }

    // Download file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("documents")
      .download(storagePath);

    if (fileError) {
      console.error("Storage error:", fileError);
      return NextResponse.json(
        { error: "Failed to download file", details: fileError.message },
        { status: 500 }
      );
    }

    if (!fileData) {
      return NextResponse.json(
        { error: "File data is empty" },
        { status: 500 }
      );
    }

    console.log("File downloaded successfully, size:", fileData.size);

    // Convert to buffer with size limit
    if (fileData.size > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    console.log("Buffer created, size:", buffer.length);

    // Extract text with timeout
    let rawText: string;
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Processing timeout")), 30000)
      );

      rawText = await Promise.race([
        safeExtractText(buffer, mimeType),
        timeoutPromise,
      ]);
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
      chunks = await safeChunkText(rawText);
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

    return NextResponse.json({
      success: true,
      documentId,
      fileName: docMeta.fileName,
      textLength: rawText.length,
      chunkCount: chunks.length,
      rawText:
        rawText.substring(0, 1000) + (rawText.length > 1000 ? "..." : ""), // Truncate for response
      // chunks: chunks.slice(0, 5), // Only return first 5 chunks in response
      chunks: chunks, // Only return first 5 chunks in response
    });
  } catch (error) {
    console.error("Document processing failed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
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
