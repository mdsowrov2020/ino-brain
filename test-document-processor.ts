// test-document-processor.ts
import fs from "fs";
import path from "path";
import {
  extractTextFromPDF,
  extractTextFromDOC,
  extractTextFromTXT,
  extractTextFromHTML,
  extractText,
  chunkText,
  isTextContent,
} from "@/lib/document-processor";

// Helper function to read test files
const readTestFile = (filename: string): Buffer => {
  const filePath = path.join(__dirname, "test-files", filename);
  return fs.readFileSync(filePath);
};

// Test cases
async function runTests() {
  console.log("=== Starting Document Processor Tests ===\n");

  // Test isTextContent first
  console.log("Testing isTextContent():");
  console.log("PDF:", isTextContent("application/pdf")); // true
  console.log(
    "DOCX:",
    isTextContent(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  ); // true
  console.log("TXT:", isTextContent("text/plain")); // true
  console.log("HTML:", isTextContent("text/html")); // true
  console.log("JPEG:", isTextContent("image/jpeg")); // false
  console.log("");

  try {
    // Test PDF extraction
    const pdfBuffer = readTestFile("sample.pdf");
    console.log("Testing extractTextFromPDF():");
    const pdfText = await extractTextFromPDF(pdfBuffer);
    console.log(
      "Extracted PDF text (first 200 chars):",
      pdfText.substring(0, 200)
    );
    console.log("");

    // Test DOCX extraction
    const docxBuffer = readTestFile("sample.docx");
    console.log("Testing extractTextFromDOC():");
    const docxText = await extractTextFromDOC(docxBuffer);
    console.log(
      "Extracted DOCX text (first 200 chars):",
      docxText.substring(0, 200)
    );
    console.log("");

    // Test TXT extraction
    const txtBuffer = readTestFile("sample.txt");
    console.log("Testing extractTextFromTXT():");
    const txtText = await extractTextFromTXT(txtBuffer);
    console.log(
      "Extracted TXT text (first 200 chars):",
      txtText.substring(0, 200)
    );
    console.log("");

    // Test HTML extraction
    const htmlBuffer = readTestFile("sample.html");
    console.log("Testing extractTextFromHTML():");
    const htmlText = await extractTextFromHTML(htmlBuffer);
    console.log(
      "Extracted HTML text (first 200 chars):",
      htmlText.substring(0, 200)
    );
    console.log("");

    // Test unified extractor
    console.log("Testing extractText():");
    const pdfTextViaExtract = await extractText(pdfBuffer, "application/pdf");
    console.log(
      "PDF via extractText (first 100 chars):",
      pdfTextViaExtract.substring(0, 100)
    );
    const docxTextViaExtract = await extractText(
      docxBuffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    console.log(
      "DOCX via extractText (first 100 chars):",
      docxTextViaExtract.substring(0, 100)
    );
    console.log("");

    // Test chunking
    console.log("Testing chunkText():");
    const longText = "This is a sample text that will be chunked. ".repeat(100);
    const chunks = chunkText(longText, 100, 20);
    console.log(`Generated ${chunks.length} chunks:`);
    console.log("First chunk:", chunks[0]);
    console.log("Second chunk:", chunks[1]);
    console.log(
      "Overlap check:",
      chunks[0].endsWith(chunks[1].substring(0, 20))
    );
    console.log("");

    console.log("=== All tests completed ===");
  } catch (error) {
    console.error(
      "Test failed:",
      error instanceof Error ? error.message : error
    );
  }
}

runTests();
