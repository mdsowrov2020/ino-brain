// app/api/chats/route.ts
import { saveChatHistory } from "@/lib/saveChatHistory";
import { getChunksByDocumentId } from "@/lib/weaviate/getChunks";
import { NextRequest, NextResponse } from "next/server";

// Function to chat with Ollama
async function chatWithOllama(prompt: string, model: string = "qwen2.5:0.5b") {
  try {
    console.log("🤖 Calling Ollama with model:", model);

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
      console.error("❌ Ollama API error:", response.status, errorText);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("No response from Ollama model");
    }

    console.log("✅ Got response from Ollama");
    return data.response;
  } catch (error) {
    console.error("Error calling Ollama:", error);
    throw error;
  }
}

// GET method to retrieve chat history
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
      `📚 Fetching chat history for documentId: ${documentId}, userId: ${
        userId || "null"
      }`
    );

    // Import supabase here to avoid circular dependencies
    const { getChatHistory } = await import("@/lib/saveChatHistory");
    const chatHistory = await getChatHistory(documentId, userId);

    console.log(`✅ Retrieved ${chatHistory?.length || 0} chat entries`);
    return NextResponse.json(chatHistory || [], { status: 200 });
  } catch (error) {
    console.error("❌ Unexpected error in chat history API:", error);
    return NextResponse.json(
      { error: "Failed to process chat history request" },
      { status: 500 }
    );
  }
}

// POST method to send a message and get AI response
export async function POST(req: NextRequest) {
  console.log("🚀 Chats API POST request received");

  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("📦 Request body parsed:", {
        documentId: requestBody.documentId,
        userMessage: requestBody.userMessage?.substring(0, 50) + "...",
        userId: requestBody.userId || "null",
      });
    } catch (error) {
      console.error("❌ Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { documentId, userMessage, userId = null } = requestBody;

    // Validate required fields
    if (!documentId || !userMessage) {
      console.warn("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing documentId or userMessage" },
        { status: 400 }
      );
    }

    if (typeof documentId !== "string" || typeof userMessage !== "string") {
      console.warn("❌ Invalid field types");
      return NextResponse.json(
        { error: "documentId and userMessage must be strings" },
        { status: 400 }
      );
    }

    console.log(
      `Processing chat for documentId: ${documentId}, userId: ${
        userId || "anonymous"
      }`
    );

    // Get chunks from Weaviate
    let chunks;
    try {
      console.log("📚 Getting chunks from Weaviate...");
      chunks = await getChunksByDocumentId(documentId);
      console.log(`✅ Retrieved ${chunks?.length || 0} chunks`);
    } catch (error) {
      console.error("❌ Error getting chunks from Weaviate:", error);
      return NextResponse.json(
        { error: "Failed to retrieve document chunks" },
        { status: 500 }
      );
    }

    // Check if chunks were found
    if (!chunks || chunks.length === 0) {
      console.warn("❌ No chunks found for document");
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
      console.warn("❌ No content found in chunks");
      return NextResponse.json(
        { error: "No content found in document chunks" },
        { status: 404 }
      );
    }

    console.log(`✅ Built context with ${context.length} characters`);

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
      console.error("❌ Error getting response from Ollama:", error);
      return NextResponse.json(
        {
          error:
            "Failed to get response from AI model. Make sure Ollama is running.",
        },
        { status: 500 }
      );
    }

    console.log("✅ Got response from Ollama, preparing to save chat history");

    // Save chat history to Supabase
    let chatSaved = false;
    try {
      await saveChatHistory(
        documentId,
        [
          { role: "user", content: userMessage },
          { role: "assistant", content: reply },
        ],
        userId
      );
      chatSaved = true;
      console.log(
        `✅ Chat history saved successfully for documentId: ${documentId}`
      );
    } catch (error) {
      console.error("❌ Error saving chat history:", error);
      // Don't return error as the main functionality worked
    }

    console.log("🎉 Chat request completed successfully");

    return NextResponse.json({
      reply,
      chatSaved,
      success: true,
    });
  } catch (error) {
    console.error("❌ Unexpected error in chats API:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
