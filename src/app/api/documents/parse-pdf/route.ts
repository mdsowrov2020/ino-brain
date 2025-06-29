import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // Return the parsed text (could be chunked here or elsewhere)
    return NextResponse.json({ text, length: text.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to parse PDF." },
      { status: 500 }
    );
  }
}
