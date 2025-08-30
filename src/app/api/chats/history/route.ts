// app/api/chat/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");
    const userId = searchParams.get("userId");

    // Validate required documentId
    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId parameter" },
        { status: 400 }
      );
    }

    console.log(
      `Fetching chat history for documentId: ${documentId}, userId: ${
        userId || "null"
      }`
    );

    // Build query
    let query = supabase
      .from("chats")
      .select("*")
      .eq("documentId", documentId)
      .order("created_at", { ascending: true }); // Chronological order

    // If userId is provided, filter by user as well
    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error retrieving chat history:", error);
      return NextResponse.json(
        { error: "Failed to retrieve chat history", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Retrieved ${data?.length || 0} chat entries`);
    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error("Unexpected error in chat history API:", error);
    return NextResponse.json(
      { error: "Failed to process chat history request" },
      { status: 500 }
    );
  }
}
