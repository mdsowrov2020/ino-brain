import { NextRequest, NextResponse } from "next/server";
// import { parsePdfDocument } from "@/lib/document-processor/pdfParser";

export async function POST(req: NextRequest) {
  const { documentId } = await req.json();

  if (!documentId) {
    return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
  }

  try {
    // const result = await parsePdfDocument(documentId);
    // return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "PDF processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
