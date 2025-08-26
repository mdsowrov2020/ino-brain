import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    // Step 1: Get the document record to retrieve storagePath
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("storagePath")
      .eq("id", numericId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document not found", details: fetchError },
        { status: 404 }
      );
    }

    const storagePath = document.storagePath;

    // Step 2: Remove file from Supabase storage
    const { error: storageError } = await supabase.storage
      .from("documents") // 👈 bucket name
      .remove([storagePath]); // 👈 using stored path directly

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      return NextResponse.json(
        { error: "Failed to delete file from storage", details: storageError },
        { status: 500 }
      );
    }

    // Step 3: Delete DB record
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", numericId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete document from database", details: dbError },
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
  try {
    const { id } = await params;

    // Validate that id is a valid number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return Response.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", numericId)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
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
