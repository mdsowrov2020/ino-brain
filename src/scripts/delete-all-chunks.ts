import client from "@/lib/weaviate-client";
import weaviate from "weaviate-ts-client";

async function deleteAllDocumentChunks() {
  try {
    // Weaviate uses a batch deleter by deleting objects individually,
    // so we have to fetch all IDs first then delete in batch or sequentially.

    // Step 1: Fetch all DocumentChunk objects with their IDs
    const result = await client.graphql
      .get()
      .withClassName("DocumentChunk")
      .withFields("_additional { id }")
      .withLimit(1000) // Adjust limit if needed
      .do();

    const objects = result.data.Get.DocumentChunk;

    if (!objects || objects.length === 0) {
      console.log("No DocumentChunk objects found to delete.");
      return;
    }

    // Step 2: Delete each object by ID
    for (const obj of objects) {
      const id = obj._additional.id;
      await client.data.deleter().withId(id).do();
      console.log(`Deleted DocumentChunk with ID: ${id}`);
    }

    console.log("All DocumentChunk objects deleted.");
  } catch (error) {
    console.error("Error deleting DocumentChunk objects:", error);
  }
}

deleteAllDocumentChunks();
