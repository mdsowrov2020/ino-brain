import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/weaviate-client";
import { aiService } from "@/services/aiService";

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    // Get all content for the document
    const searchResults = await client.graphql
      .get()
      .withClassName("Document")
      .withFields("content")
      .withWhere({
        path: ["supabaseId"],
        operator: "Equal",
        valueText: documentId,
      })
      .do();

    const documents = searchResults?.data?.Get?.Document || [];
    const fullContent = documents.map((doc: any) => doc.content).join(" ");

    // Generate summary
    const summary = await aiService.summarizeText(fullContent);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
