// services/supabaseService.ts
import supabase from "@/lib/supabase";
import fs from "fs";
import path from "path";
import { Blob } from "buffer";

/**
 * Retrieves a document file from Supabase Storage or from the local file system (for test files).
 * @param documentId The storage path or test file path
 * @returns Blob containing file data
 */
export const getDocumentFromSupabase = async (documentId: string) => {
  console.log("Getting document with ID:", documentId);

  // Handle local file access in development for test documents
  if (
    process.env.NODE_ENV === "development" &&
    documentId.startsWith("test/")
  ) {
    console.log("Attempting to access local test file:", documentId);

    const filePath = path.join(process.cwd(), documentId);
    console.log("Full file path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`Local test file not found: ${filePath}`);
      // Instead of throwing error, fall back to Supabase storage
      console.log("Falling back to Supabase storage...");
    } else {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        console.log(
          "Successfully read local test file, size:",
          fileBuffer.length
        );
        return new Blob([fileBuffer]);
      } catch (err) {
        console.error(`Error reading local file: ${(err as Error).message}`);
        // Fall back to Supabase storage
        console.log("Falling back to Supabase storage...");
      }
    }
  }

  // Download from Supabase Storage
  console.log("Downloading from Supabase storage, documentId:", documentId);

  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(documentId);

    if (error) {
      console.error("Supabase storage error:", error);
      throw new Error(
        `Failed to download document from Supabase: ${error.message}`
      );
    }

    if (!data) {
      console.error("No data returned from Supabase storage");
      throw new Error("No data returned from Supabase storage");
    }

    console.log("Successfully downloaded from Supabase, size:", data.size);
    return data;
  } catch (supabaseError) {
    console.error("Supabase download failed:", supabaseError);
    throw new Error(
      `Failed to download document: ${
        supabaseError instanceof Error ? supabaseError.message : "Unknown error"
      }`
    );
  }
};

/**
 * Retrieves metadata for a document from the Supabase "documents" table.
 * @param documentId The UUID or ID string of the document
 * @returns Metadata object for the document
 */
export const getDocumentMetadata = async (documentId: string) => {
  console.log("Getting document metadata for ID:", documentId);

  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (error) {
      console.error("Supabase metadata error:", error);
      throw new Error(`Failed to get document metadata: ${error.message}`);
    }

    if (!data) {
      console.error("No metadata found for document ID:", documentId);
      throw new Error("Document not found in database");
    }

    console.log("Successfully retrieved metadata:", {
      id: data.id,
      fileName: data.file_name,
      size: data.size,
    });

    return data;
  } catch (metadataError) {
    console.error("Metadata retrieval failed:", metadataError);
    throw new Error(
      `Failed to get document metadata: ${
        metadataError instanceof Error ? metadataError.message : "Unknown error"
      }`
    );
  }
};

/**
 * Helper function to check if a document exists in Supabase
 * @param documentId The document ID to check
 * @returns boolean indicating if document exists
 */
export const documentExists = async (documentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
};

/**
 * Helper function to list all documents for debugging
 * @returns Array of document metadata
 */
export const listAllDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("id, file_name, size, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listing documents:", error);
      return [];
    }

    console.log("Available documents:", data);
    return data || [];
  } catch (error) {
    console.error("Failed to list documents:", error);
    return [];
  }
};
