// import { chatWithHuggingFace } from "@/lib/hugging-face/huggingface";
// import { saveChatHistory } from "@/lib/saveChatHistory";
// import { getChunksByDocumentId } from "@/lib/weaviate/getChunks";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const { documentId, userMessage, userId = null } = await req.json();

//   if (!documentId || !userMessage) {
//     return NextResponse.json(
//       { error: "Missing documentId or userMessage" },
//       { status: 400 }
//     );
//   }

//   const chunks = await getChunksByDocumentId(documentId);
//   const context = chunks.map((chunk: any) => chunk.text).join("\n");

//   const prompt = `
// You are a helpful assistant. Based on the following document content:
// ${context}

// User: ${userMessage}
// Assistant:
//   `.trim();

//   const reply = await chatWithHuggingFace(prompt);

//   await saveChatHistory(
//     documentId,
//     [
//       { role: "user", content: userMessage },
//       { role: "assistant", content: reply },
//     ],
//     userId
//   );

//   return NextResponse.json({ reply });
// }

// =====================================================================================
import { saveChatHistory } from "@/lib/saveChatHistory";
import { getChunksByDocumentId } from "@/lib/weaviate/getChunks";
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs"; // For future Clerk auth
// import { createClient } from "@supabase/supabase-js"; // For future Supabase auth

// Function to chat with Ollama
async function chatWithOllama(prompt: string, model: string = "qwen2.5:0.5b") {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("No response from Ollama model");
    }

    return data.response;
  } catch (error) {
    console.error("Error calling Ollama:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { documentId, userMessage, userId = null } = requestBody;

    // Validate required fields
    if (!documentId || !userMessage) {
      return NextResponse.json(
        { error: "Missing documentId or userMessage" },
        { status: 400 }
      );
    }

    if (typeof documentId !== "string" || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "documentId and userMessage must be strings" },
        { status: 400 }
      );
    }

    // Future auth implementation with Clerk
    // const { userId: clerkUserId } = auth();
    // if (!clerkUserId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Future auth implementation with Supabase
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // );
    // const { data: { user }, error: authError } = await supabase.auth.getUser();
    // if (authError || !user) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Get chunks from Weaviate
    let chunks;
    try {
      chunks = await getChunksByDocumentId(documentId);
    } catch (error) {
      console.error("Error getting chunks from Weaviate:", error);
      return NextResponse.json(
        { error: "Failed to retrieve document chunks" },
        { status: 500 }
      );
    }

    // Check if chunks were found
    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "No document chunks found for the given documentId" },
        { status: 404 }
      );
    }

    // Build context from chunks - use chunk field if text is empty
    const context = chunks
      .map((chunk: any) => {
        const content = chunk.text || chunk.chunk || chunk.content || "";
        return content.trim();
      })
      .filter((content) => content.length > 0)
      .join("\n");

    if (!context.trim()) {
      return NextResponse.json(
        { error: "No content found in document chunks" },
        { status: 404 }
      );
    }

    // Create prompt
    const prompt =
      `You are a helpful assistant. Based on the following document content:

${context}

User: ${userMessage}
Assistant:`.trim();

    // Get response from Ollama
    let reply;
    try {
      reply = await chatWithOllama(prompt, "qwen2.5:0.5b");
    } catch (error) {
      console.error("Error getting response from Ollama:", error);
      return NextResponse.json(
        { error: "Failed to get response from AI model" },
        { status: 500 }
      );
    }

    // Save chat history (commented out for now)
    // try {
    //   await saveChatHistory(
    //     documentId,
    //     [
    //       { role: "user", content: userMessage },
    //       { role: "assistant", content: reply },
    //     ],
    //     userId // or clerkUserId/user.id from auth
    //   );
    // } catch (error) {
    //   console.error("Error saving chat history:", error);
    //   // Don't return error here as the main functionality worked
    // }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Unexpected error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
