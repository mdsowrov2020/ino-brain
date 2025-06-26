import initWeaviateClient from "@/lib/weaviate-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await initWeaviateClient();

    // Use the HTTP client to fetch the /v1/meta endpoint
    const metaResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_WEAVIATE_URL}/v1/meta`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WEAVIATE_API_KEY}`,
        },
      }
    );

    if (!metaResponse.ok) {
      throw new Error(`Failed to fetch meta: ${metaResponse.statusText}`);
    }

    const meta = await metaResponse.json();
    await client.close();
    return NextResponse.json({ status: "Weaviate is ready", meta });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to connect to Weaviate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
