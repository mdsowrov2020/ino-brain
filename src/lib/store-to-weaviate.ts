import client from "./weaviate-client";
import { embedText } from "./hugging-face/embed-huggingface";

interface ChunkData {
  documentId: string | number; // Could be either
  fileName: string;
  chunks: string[];
}

// export async function storeChunksInWeaviate(data: ChunkData) {
//   try {
//     console.log("Storing chunks in Weaviate...");

//     // 🔧 FIX: Convert documentId to string
//     const documentIdString = String(data.documentId);

//     for (const chunk of data.chunks) {
//       console.log(`Processing chunk: ${chunk.substring(0, 50)}...`);

//       // Generate embedding
//       const vector = await embedText(chunk);
//       console.log(`Generated embedding with ${vector.length} dimensions`);

//       // 🔧 FIX: Ensure all properties are correct data types
//       await client.data
//         .creator()
//         .withClassName("DocumentChunk")
//         .withProperties({
//           chunk: chunk, // text - ✅ correct
//           fileName: data.fileName, // string - ✅ correct
//           documentId: documentIdString, // 🔧 FIX: Convert to string
//         })
//         .withVector(vector)
//         .do();

//       console.log("✅ Chunk stored successfully");
//     }

//     console.log(`✅ All ${data.chunks.length} chunks stored in Weaviate`);
//   } catch (error) {
//     console.error("❌ Error storing chunks in Weaviate:", error);
//     throw error;
//   }
// }

import { v5 as uuidv5 } from "uuid";

// You can use any fixed UUID as namespace, here is the DNS namespace as example
const NAMESPACE_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export async function storeChunksInWeaviate(data: ChunkData) {
  try {
    console.log("Storing chunks in Weaviate...");

    // Convert documentId to string
    const documentIdString = String(data.documentId);

    for (const chunk of data.chunks) {
      console.log(`Processing chunk: ${chunk.substring(0, 50)}...`);

      // Generate embedding
      const vector = await embedText(chunk);
      console.log(`Generated embedding with ${vector.length} dimensions`);

      // Generate deterministic UUID v5 using documentId + chunk text
      const chunkId = uuidv5(documentIdString + chunk, NAMESPACE_UUID);

      // Store chunk with valid UUID as id
      await client.data
        .creator()
        .withClassName("DocumentChunk")
        .withId(chunkId) // <-- IMPORTANT: valid UUID id to overwrite if exists
        .withProperties({
          chunk: chunk,
          fileName: data.fileName,
          documentId: documentIdString,
        })
        .withVector(vector)
        .do();

      console.log(`✅ Chunk stored/updated successfully with ID: ${chunkId}`);
    }

    console.log(`✅ All ${data.chunks.length} chunks stored in Weaviate`);
  } catch (error) {
    console.error("❌ Error storing chunks in Weaviate:", error);
    throw error;
  }
}

// Alternative version with better error handling and type safety
export async function storeChunksInWeaviateImproved(data: ChunkData) {
  try {
    console.log("Storing chunks in Weaviate...");

    // 🔧 Validate and convert data types
    const documentIdString = String(data.documentId);
    const fileNameString = String(data.fileName);

    if (!data.chunks || data.chunks.length === 0) {
      throw new Error("No chunks provided");
    }

    const results = [];

    for (let i = 0; i < data.chunks.length; i++) {
      const chunk = data.chunks[i];

      if (!chunk || chunk.trim().length === 0) {
        console.warn(`Skipping empty chunk at index ${i}`);
        continue;
      }

      console.log(
        `Processing chunk ${i + 1}/${data.chunks.length}: ${chunk.substring(
          0,
          50
        )}...`
      );

      try {
        // Generate embedding
        const vector = await embedText(chunk);
        console.log(`Generated embedding with ${vector.length} dimensions`);

        // Store in Weaviate with explicit type conversion
        const result = await client.data
          .creator()
          .withClassName("DocumentChunk")
          .withProperties({
            chunk: String(chunk), // Ensure it's a string
            fileName: fileNameString, // Ensure it's a string
            documentId: documentIdString, // Ensure it's a string
          })
          .withVector(vector)
          .do();

        results.push(result);
        console.log(`✅ Chunk ${i + 1} stored successfully`);
      } catch (chunkError) {
        console.error(`❌ Error processing chunk ${i + 1}:`, chunkError);
        throw new Error(
          `Failed to process chunk ${i + 1}: ${chunkError.message}`
        );
      }
    }

    console.log(`✅ Successfully stored ${results.length} chunks in Weaviate`);
    return results;
  } catch (error) {
    console.error("❌ Error storing chunks in Weaviate:", error);
    throw error;
  }
}

// Debug version to see exactly what data you're trying to store
export async function debugStoreChunks(data: ChunkData) {
  console.log("🔍 Debug - Input data types:");
  console.log(
    "documentId type:",
    typeof data.documentId,
    "value:",
    data.documentId
  );
  console.log("fileName type:", typeof data.fileName, "value:", data.fileName);
  console.log("chunks length:", data.chunks?.length);
  console.log("first chunk type:", typeof data.chunks?.[0]);

  // Show what will be sent to Weaviate
  const sampleProperties = {
    chunk: String(data.chunks?.[0] || ""),
    fileName: String(data.fileName),
    documentId: String(data.documentId),
  };

  console.log("🔍 Sample properties that will be sent to Weaviate:");
  console.log(JSON.stringify(sampleProperties, null, 2));
}
