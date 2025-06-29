import { chatWithHuggingFace } from "@/lib/hugging-face/huggingface";
import { saveChatHistory } from "@/lib/saveChatHistory";
import { getChunksByDocumentId } from "@/lib/weaviate/getChunks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { documentId, userMessage, userId = null } = await req.json();

  if (!documentId || !userMessage) {
    return NextResponse.json(
      { error: "Missing documentId or userMessage" },
      { status: 400 }
    );
  }

  const chunks = await getChunksByDocumentId(documentId);
  const context = chunks.map((chunk: any) => chunk.text).join("\n");

  const prompt = `
You are a helpful assistant. Based on the following document content:
${context}

User: ${userMessage}
Assistant:
  `.trim();

  const reply = await chatWithHuggingFace(prompt);

  await saveChatHistory(
    documentId,
    [
      { role: "user", content: userMessage },
      { role: "assistant", content: reply },
    ],
    userId
  );

  return NextResponse.json({ reply });
}
