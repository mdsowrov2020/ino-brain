import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    // Fetch the document record to get fileUrl
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("fileUrl")
      .eq("id", numericId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document not found", details: fetchError },
        { status: 404 }
      );
    }

    let fullPath = "";

    try {
      // Extract path from URL, e.g. "https://xyz.supabase.co/storage/v1/object/public/documents/docs/file.txt"
      const url = new URL(document.fileUrl);

      // Supabase storage public URLs generally contain /documents/ after domain
      // We want the path inside bucket, i.e. after `/documents/`
      const bucketPrefix = "/documents/";
      const fullUrlPath = url.pathname; // e.g. "/storage/v1/object/public/documents/docs/file.txt"
      const idx = fullUrlPath.indexOf(bucketPrefix);

      if (idx === -1) {
        // If URL format unexpected, fallback to fileUrl as is
        fullPath = document.fileUrl;
      } else {
        fullPath = fullUrlPath.substring(idx + bucketPrefix.length); // e.g. "docs/file.txt"
      }
    } catch {
      // If invalid URL, fallback to fileUrl string
      fullPath = document.fileUrl.startsWith("documents/")
        ? document.fileUrl.substring("documents/".length)
        : document.fileUrl;
    }

    console.log("Deleting file from storage at path:", fullPath);

    // Remove file from storage bucket 'documents'
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([fullPath]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // You can choose to return here if you want to prevent DB deletion on storage failure
      // For now, continue to delete DB record anyway
    } else {
      console.log("File deleted successfully from storage:", fullPath);
    }

    // Now delete the document record from DB
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", numericId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete document", details: dbError },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ success: false }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json(); // expects JSON body with fields to update

    const { data, error } = await supabase
      .from("documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
