import client from "../weaviate-client";

// export async function getChunksByDocumentId(documentId: string) {
//   const response = await client.graphql
//     .get()
//     .withClassName("DocumentChunk")
//     .withFields("_additional { id } text documentId")
//     .withWhere({
//       path: ["documentId"],
//       operator: "Equal",
//       valueString: documentId,
//     })
//     .withLimit(100)
//     .do();

//   return response.data.Get.DocumentChunks;
// }
export async function getChunksByDocumentId(documentId: string) {
  try {
    console.log("Getting chunks for documentId:", documentId);

    if (!documentId || typeof documentId !== "string") {
      throw new Error("Invalid documentId provided");
    }

    // First try querying with valueString (matches your schema)
    const response = await client.graphql
      .get()
      .withClassName("DocumentChunk")
      .withFields("_additional { id } chunk documentId fileName") // Only query existing fields
      .withWhere({
        path: ["documentId"],
        operator: "Equal",
        valueString: documentId, // Matches your schema's string type
      })
      .withLimit(100)
      .do();

    console.log("Query response:", JSON.stringify(response, null, 2));

    if (!response?.data?.Get?.DocumentChunk) {
      throw new Error("No DocumentChunk class found in response");
    }

    if (response.data.Get.DocumentChunk.length === 0) {
      throw new Error(`No chunks found for documentId: ${documentId}`);
    }

    // Process chunks - using only the fields that exist
    return response.data.Get.DocumentChunk.map((chunk) => ({
      id: chunk._additional?.id,
      text: chunk.chunk || "", // Map 'chunk' to 'text' for consistency
      content: chunk.chunk || "",
      documentId: chunk.documentId,
      fileName: chunk.fileName,
    }));
  } catch (error) {
    console.error("Error in getChunksByDocumentId:", error);
    throw new Error(`Failed to retrieve chunks: ${error.message}`);
  }
}
