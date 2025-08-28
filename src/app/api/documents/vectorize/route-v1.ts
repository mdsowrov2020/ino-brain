// app/api/documents/vectorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ensureWeaviateSchema } from "@/lib/schema/weaviateSchema";
import { storeChunksInWeaviate } from "@/lib/store-to-weaviate";

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    // Get processed document (from your process API)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/documents/process`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      }
    );

    const data = await res.json();

    console.log("Data from Vectorize route: ", data);

    if (!data?.chunks?.length) {
      return NextResponse.json(
        { error: "No chunks returned" },
        { status: 500 }
      );
    }

    await ensureWeaviateSchema();

    await storeChunksInWeaviate({
      documentId: data.documentId,
      fileName: data.fileName,
      chunks: data.chunks,
    });

    return NextResponse.json({
      success: true,
      message: "Chunks embedded and stored in Weaviate",
      storedChunks: data.chunks.length,
    });
  } catch (error) {
    console.error("Vectorize route error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
