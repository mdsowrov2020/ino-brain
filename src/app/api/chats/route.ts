// // app/api/chat/route.ts
// import { NextResponse } from "next/server";
// import { HuggingFaceService } from "@/services/aiService"; // adjust path

// const aiService = new HuggingFaceService(process.env.HUGGINGFACE_API_KEY!);

// export async function POST(req: Request) {
//   const { prompt } = await req.json();

//   try {
//     const response = await aiService.generateResponse(prompt);
//     return NextResponse.json({ response });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Failed to generate response." },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/weaviate-client";
import { aiService } from "@/services/aiService";

export async function POST(request: NextRequest) {
  try {
    const { message, documentId } = await request.json();

    // Search for relevant content in Weaviate
    const searchResults = await client.graphql
      .get()
      .withClassName("Document")
      .withFields("content title fileName")
      .withWhere({
        path: ["supabaseId"],
        operator: "Equal",
        valueText: documentId,
      })
      .withNearText({
        concepts: [message],
        distance: 0.7,
      })
      .withLimit(3)
      .do();

    const documents = searchResults?.data?.Get?.Document || [];
    const context = documents.map((doc: any) => doc.content).join("\n\n");

    // Generate response using AI
    const prompt = `Based on the following document content, please answer the user's question:
    
Context: ${context}

Question: ${message}

Answer:`;

    const response = await aiService.generateResponse(prompt);

    return NextResponse.json({
      response,
      sources: documents.map((doc: any) => ({
        title: doc.title,
        fileName: doc.fileName,
      })),
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
