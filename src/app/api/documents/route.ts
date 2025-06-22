import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    //  Unique file name

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

    const { error: dbError } = await supabase.from("documents").insert({
      fileName: file.name,
      fileUrl: urlData.publicUrl,
      type: fileType,
      size: fileSize,
    });

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
      { message: "Document uploaded successfully" },
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
