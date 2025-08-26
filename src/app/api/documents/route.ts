// app/api/documents/route.ts
import supabase from "@/lib/supabase";
import { formatFileSize } from "@/utils/helper";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

// --- Helper Functions ---

// --- API Route Handlers ---

// GET method to fetch all documents
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database fetch error:", error); // More specific error logging
      return NextResponse.json(
        { error: "Failed to retrieve documents", details: error.message },
        { status: 500 }
      );
    }

    // Transform data to include formatted file size
    const transformedData = data.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.size),
    }));

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    console.error("Server error during GET documents:", error); // More specific error logging
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// POST method to upload a document
export async function POST(request: Request) {
  console.log("Document upload POST request received.");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("No file provided in the request.");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // --- File Information Extraction ---
    const originalFileName = file.name;
    const fileExtension =
      originalFileName.split(".").pop()?.toLowerCase() || "unknown";
    const fileSize = file.size; // Size in bytes
    const fileMimeType = file.type; // Get MIME type from the file object itself if possible, falls back to extension if needed.

    // --- Generate Unique Storage Path ---
    // This combines a UUID with the original filename to create a unique key for Supabase Storage.
    // Example: "e4d7b3a9-1f2c-4e5a-8b9c-0d1e2f3a4b5c-MyDocument.pdf"
    const storagePath = `${uuidv4()}-${originalFileName}`;

    console.log(
      `Preparing to upload: Original Name='${originalFileName}', Storage Path='${storagePath}', Size=${fileSize} bytes, Type='${fileMimeType}'`
    );

    // --- Upload File to Supabase Storage ---
    // The `upload` method expects the storagePath (key) and the file blob/File object.
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents") // Ensure 'documents' is the correct bucket name
      .upload(storagePath, file, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: false, // Do not overwrite if a file with storagePath already exists (though uuid prevents this)
        contentType: fileMimeType, // Set content type explicitly
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: "Failed to upload file to storage",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    console.log(`File uploaded to storage: ${uploadData.path}`);

    // --- Get Public URL for the Uploaded File ---
    const { data: urlData } = await supabase.storage
      .from("documents")
      .getPublicUrl(storagePath); // Use the unique storagePath to get the URL

    if (!urlData || !urlData.publicUrl) {
      console.error("Failed to retrieve public URL for uploaded file.");
      // Optional: Clean up the uploaded file if URL retrieval fails
      await supabase.storage.from("documents").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to retrieve public file URL after upload." },
        { status: 500 }
      );
    }

    console.log(`Public URL obtained: ${urlData.publicUrl}`);

    // --- Insert Document Metadata into PostgreSQL Database ---
    const { data: insertData, error: dbError } = await supabase
      .from("documents")
      .insert({
        fileName: originalFileName, // Store original name for display to the user
        storagePath: storagePath, // Store the unique key used in Supabase Storage
        fileUrl: urlData.publicUrl, // The publicly accessible URL
        type: fileExtension, // File extension (e.g., 'pdf', 'docx')
        size: fileSize, // Size in bytes
        // Add any other relevant metadata fields here (e.g., user_id, uploaded_by, etc.)
      })
      .select() // Selects the newly inserted row
      .single(); // Expects a single result

    if (dbError) {
      console.error("Database insert error:", dbError);
      // IMPORTANT: Clean up the uploaded file from storage if DB insert fails
      await supabase.storage.from("documents").remove([storagePath]);
      return NextResponse.json(
        {
          error: "Failed to save document info to database",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      `Document ${originalFileName} metadata saved to DB with ID: ${insertData.id}`
    );

    // --- Respond to Client ---
    return NextResponse.json(
      {
        message: "Document uploaded successfully",
        id: insertData.id,
        fileName: originalFileName,
        storagePath: storagePath, // Include storagePath in response for client-side reference if needed
        type: fileExtension,
        size: formatFileSize(fileSize),
        fileUrl: urlData.publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch any unexpected errors during the entire process
    console.error("Server error during document upload process:", error);
    return NextResponse.json(
      {
        error: "Internal server error during upload",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined, // Include stack in dev
      },
      { status: 500 }
    );
  }
}
