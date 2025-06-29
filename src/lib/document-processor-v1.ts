// lib/document-processor/index.ts
import { parse } from "node-html-parser";

// PDF Processor with better error handling
export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    // Dynamic import to avoid module loading issues
    const pdf = (await import("pdf-parse")).default;

    const data = await pdf(buffer);

    if (!data || !data.text) {
      throw new Error("No text content found in PDF");
    }

    const text = data.text.trim();
    if (text.length === 0) {
      throw new Error("PDF contains no readable text");
    }

    return text;
  } catch (error) {
    console.error("PDF Extraction Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      bufferSize: buffer.length,
    });

    if (error instanceof Error && error.message.includes("Invalid PDF")) {
      throw new Error("Invalid or corrupted PDF file");
    }

    throw new Error(
      `PDF processing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// DOC/DOCX Processor with better error handling
export const extractTextFromDOC = async (buffer: Buffer): Promise<string> => {
  try {
    // Dynamic import to avoid module loading issues
    const mammoth = (await import("mammoth")).default;

    const result = await mammoth.extractRawText({ buffer });

    if (!result || !result.value) {
      throw new Error("No text content found in document");
    }

    const text = result.value.trim();
    if (text.length === 0) {
      throw new Error("Document contains no readable text");
    }

    // Log warnings if any
    if (result.messages && result.messages.length > 0) {
      console.warn("Document processing warnings:", result.messages);
    }

    return text;
  } catch (error) {
    console.error("DOC Extraction Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      bufferSize: buffer.length,
    });

    if (error instanceof Error && error.message.includes("not a valid")) {
      throw new Error("Invalid or corrupted document file");
    }

    throw new Error(
      `Document processing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// TXT Processor with encoding detection
export const extractTextFromTXT = async (buffer: Buffer): Promise<string> => {
  try {
    // Try different encodings
    let text: string;

    try {
      // Try UTF-8 first
      text = buffer.toString("utf-8").trim();
    } catch {
      try {
        // Try Latin-1 if UTF-8 fails
        text = buffer.toString("latin1").trim();
      } catch {
        // Fall back to ASCII
        text = buffer.toString("ascii").trim();
      }
    }

    if (!text || text.length === 0) {
      throw new Error("Empty or unreadable text file");
    }

    // Remove potential BOM
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }

    return text;
  } catch (error) {
    console.error("TXT Extraction Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      bufferSize: buffer.length,
    });

    throw new Error(
      `Text file processing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// HTML Processor with better parsing
export const extractTextFromHTML = async (buffer: Buffer): Promise<string> => {
  try {
    const html = buffer.toString("utf-8");

    if (!html || html.trim().length === 0) {
      throw new Error("Empty HTML file");
    }

    const root = parse(html, {
      blockTextElements: {
        script: false,
        noscript: false,
        style: false,
        pre: true,
      },
    });

    // Remove script and style elements
    root
      .querySelectorAll("script, style, noscript")
      .forEach((el) => el.remove());

    const text = root.structuredText
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    if (!text || text.length === 0) {
      throw new Error("No readable text content in HTML");
    }

    return text;
  } catch (error) {
    console.error("HTML Extraction Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      bufferSize: buffer.length,
    });

    throw new Error(
      `HTML processing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Unified Text Extractor with validation
export const extractText = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty or invalid buffer provided");
  }

  if (!mimeType) {
    throw new Error("MIME type is required");
  }

  console.log(
    `Extracting text from ${mimeType}, buffer size: ${buffer.length}`
  );

  switch (mimeType.toLowerCase()) {
    case "application/pdf":
      return await extractTextFromPDF(buffer);
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return await extractTextFromDOC(buffer);
    case "text/plain":
      return await extractTextFromTXT(buffer);
    case "text/html":
      return await extractTextFromHTML(buffer);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

// Enhanced Text Chunker with better overlap handling
export const chunkText = (
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] => {
  if (!text || typeof text !== "string") {
    console.warn("Invalid text provided to chunkText");
    return [];
  }

  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return [];
  }

  // If text is smaller than chunk size, return as single chunk
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let index = 0;

  while (index < cleanText.length) {
    const start = Math.max(0, index - overlap);
    const end = Math.min(cleanText.length, index + chunkSize);

    let chunk = cleanText.slice(start, end);

    // Try to break at sentence boundaries
    if (end < cleanText.length) {
      const lastSentenceEnd = Math.max(
        chunk.lastIndexOf("."),
        chunk.lastIndexOf("!"),
        chunk.lastIndexOf("?")
      );

      if (lastSentenceEnd > chunk.length * 0.7) {
        chunk = chunk.slice(0, lastSentenceEnd + 1);
      }
    }

    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > 0) {
      chunks.push(trimmedChunk);
    }

    index += chunkSize - overlap;

    // Prevent infinite loop
    if (index <= 0) break;
  }

  return chunks.filter((chunk) => chunk.trim().length > 10); // Remove very short chunks
};

// Type Guards and Utilities
export const isTextContent = (mimeType: string): boolean => {
  const supportedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/html",
  ];
  return supportedTypes.includes(mimeType.toLowerCase());
};

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const validateFileSize = (
  size: number,
  maxSize: number = 10 * 1024 * 1024
): boolean => {
  return size > 0 && size <= maxSize;
};
