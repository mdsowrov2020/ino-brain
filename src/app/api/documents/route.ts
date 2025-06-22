// api/documents/route.ts
import supabase from "@/lib/supabase";
import { formatFileSize } from "@/utils/helper";
import { NextResponse } from "next/server";

// GET method to fetch all documents
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
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
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    console.log(formData);
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Unique file name
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `documents/${fileName}`;
    const fileType = fileName.split(".").pop()?.toLowerCase() || "unknown";
    const fileSize = file.size;

    // Store file on bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // get file url
    const { data: urlData } = await supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // insert into documents
    const { data: insertData, error: dbError } = await supabase
      .from("documents")
      .insert({
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        type: fileType,
        size: fileSize,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Clean up the uploaded file if DB insert fails
      await supabase.storage.from("documents").remove([filePath]);

      return NextResponse.json(
        { error: "Failed to save document info" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Document uploaded successfully",
        fileName,
        fileType,
        fileSize: formatFileSize(fileSize),
        url: urlData.publicUrl,
        id: insertData.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
