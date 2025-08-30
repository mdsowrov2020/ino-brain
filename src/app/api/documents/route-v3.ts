// app/api/documents/route.ts
import supabase from "@/lib/supabase";
import { formatFileSize } from "@/utils/helper";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

// --- Helper Functions ---

// --- API Route Handlers ---

// GET method to fetch all documents
export async function GET() {
  try {
    // Add authentication to GET as well
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to view documents" },
        { status: 401 }
      );
    }

    // Get user's email from database
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("clerk_id", userId)
      .single();

    if (!userData?.email) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 400 }
      );
    }

    // Fetch only user's documents
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("email", userData.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database fetch error:", error);
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
    console.error("Server error during GET documents:", error);
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
    // --- Authentication Check ---
    const { userId } = await auth();

    if (!userId) {
      console.warn("Unauthorized upload attempt - no user ID found.");
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to upload documents" },
        { status: 401 }
      );
    }

    console.log(`✅ User authenticated: ${userId}`);

    // --- Get User Email from Database ---
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData?.email) {
      console.error("User not found in database:", userError);
      return NextResponse.json(
        {
          error:
            "User profile not synced. Please refresh the page and try again.",
        },
        { status: 400 }
      );
    }

    const userEmail = userData.email;
    console.log(`✅ Using email: ${userEmail}`);

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
    const fileSize = file.size;
    const fileMimeType = file.type;

    // --- Generate Unique Storage Path (keeping old format for compatibility) ---
    const storagePath = `${uuidv4()}-${originalFileName}`;

    console.log(
      `Preparing to upload: User='${userEmail}', File='${originalFileName}', Size=${fileSize} bytes`
    );

    // --- Upload File to Supabase Storage ---
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: fileMimeType,
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
      .getPublicUrl(storagePath);

    if (!urlData || !urlData.publicUrl) {
      console.error("Failed to retrieve public URL for uploaded file.");
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
        fileName: originalFileName,
        storagePath: storagePath,
        fileUrl: urlData.publicUrl,
        type: fileExtension,
        size: fileSize,
        email: userEmail, // Add the email foreign key
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Clean up the uploaded file from storage if DB insert fails
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
      `✅ Document ${originalFileName} saved to DB with ID: ${insertData.id}`
    );

    // --- Respond to Client ---
    return NextResponse.json(
      {
        message: "Document uploaded successfully",
        id: insertData.id, // This is what your upload hook expects
        fileName: originalFileName,
        storagePath: storagePath,
        type: fileExtension,
        size: formatFileSize(fileSize),
        fileUrl: urlData.publicUrl,
        email: userEmail,
      },
      { status: 200 }
    );
  } catch (error) {
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
            : undefined,
      },
      { status: 500 }
    );
  }
}
