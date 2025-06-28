import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

// export async function POST(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const body = await request.json();

//     if (body?.process !== true) {
//       return NextResponse.json(
//         { success: false, error: "Invalid payload: 'process' must be true" },
//         { status: 400 }
//       );
//     }

//     const { data, error } = await supabase
//       .from("documents")
//       .update({ process: true })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error || !data) {
//       return NextResponse.json(
//         { success: false, error: "Failed to update process field" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true, data }, { status: 200 });
//   } catch (error) {
//     console.error("Server error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Route handler started");

    // 🔧 FIX: Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log("🔍 Extracted ID:", id, "Type:", typeof id);

    // Parse request body
    const contentType = request.headers.get("content-type");
    console.log("🔍 Content-Type:", contentType);

    let body;
    try {
      body = await request.json();
      console.log("🔍 Request body:", body);
    } catch (bodyError) {
      console.error("❌ Failed to parse request body:", bodyError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate that body has update fields
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      console.log("❌ Empty or invalid body:", body);
      return NextResponse.json(
        { success: false, error: "Request body must contain fields to update" },
        { status: 400 }
      );
    }

    // 🔧 IMPROVEMENT: Use body data instead of hardcoded values
    console.log(
      "🔍 About to query Supabase with ID:",
      id,
      "and update data:",
      body
    );

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error("Invalid numeric ID:", id);
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const { data: doc } = await supabase
      .from("documents")
      .select("*")
      .eq("id", numericId)
      .maybeSingle();

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("documents")
      .update(body) // 🔧 Use the entire body for updates
      .eq("id", numericId)
      .select()
      .maybeSingle();

    console.log("🔍 Supabase response - data:", data);
    console.log("🔍 Supabase response - error:", error);

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      console.error("❌ No data returned from Supabase");
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    console.log("✅ Success! Returning data:", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("❌ Server error:", error);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
