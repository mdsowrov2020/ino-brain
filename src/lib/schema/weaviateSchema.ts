import client from "../weaviate-client";

export async function ensureWeaviateSchema() {
  try {
    const classes = await client.schema.getter().do();
    const exists = classes.classes?.some(
      (cls) => cls.class === "DocumentChunk"
    );

    if (!exists) {
      await client.schema
        .classCreator()
        .withClass({
          class: "DocumentChunk",
          description: "A chunk of a document with its embedding",
          vectorizer: "none", // ✅ Correct - you're providing your own vectors
          properties: [
            {
              name: "chunk",
              dataType: ["text"], // ✅ Correct
              description: "The text content of the document chunk",
            },
            {
              name: "fileName",
              dataType: ["string"], // 🔄 Consider "string" instead of "text"
              description: "Name of the source file",
            },
            {
              name: "documentId",
              dataType: ["string"], // 🔄 Consider "string" instead of "text"
              description: "Unique identifier for the document",
            },
            // 💡 Consider adding these additional useful fields:
            {
              name: "chunkIndex",
              dataType: ["int"],
              description: "Index of this chunk within the document",
            },
            {
              name: "createdAt",
              dataType: ["date"],
              description: "When this chunk was created",
            },
          ],
        })
        .do();

      console.log("✅ DocumentChunk class created in Weaviate");
    } else {
      console.log("✅ DocumentChunk class already exists");
    }
  } catch (err) {
    console.error("❌ Failed to check/create schema:", err);
    throw err; // Re-throw to handle upstream
  }
}

/*
// Alternative: More comprehensive schema with better data types
export async function ensureWeaviateSchemaImproved() {
  try {
    const classes = await client.schema.getter().do();
    const exists = classes.classes?.some(
      (cls) => cls.class === "DocumentChunk"
    );

    if (!exists) {
      await client.schema
        .classCreator()
        .withClass({
          class: "DocumentChunk",
          description: "A chunk of a document with its embedding",
          vectorizer: "none",
          properties: [
            { 
              name: "content", // More descriptive than "chunk"
              dataType: ["text"], 
              description: "The text content of the document chunk"
            },
            { 
              name: "fileName", 
              dataType: ["string"], // Better for exact matches
              description: "Name of the source file"
            },
            { 
              name: "documentId", 
              dataType: ["string"], // Better for exact matches
              description: "Unique identifier for the document"
            },
            { 
              name: "chunkIndex", 
              dataType: ["int"],
              description: "Order of this chunk within the document"
            },
            { 
              name: "wordCount", 
              dataType: ["int"],
              description: "Number of words in this chunk"
            },
            { 
              name: "createdAt", 
              dataType: ["date"],
              description: "When this chunk was processed"
            }
          ],
        })
        .do();

      console.log("✅ Enhanced DocumentChunk class created in Weaviate");
    } else {
      console.log("✅ DocumentChunk class already exists");
    }
  } catch (err) {
    console.error("❌ Failed to check/create schema:", err);
    throw err;
  }
}

// Function to check existing schema structure
export async function inspectWeaviateSchema() {
  try {
    const schema = await client.schema.getter().do();
    const documentChunkClass = schema.classes?.find(
      (cls) => cls.class === "DocumentChunk"
    );
    
    if (documentChunkClass) {
      console.log("📋 Current DocumentChunk schema:");
      console.log("Properties:", documentChunkClass.properties);
      console.log("Vectorizer:", documentChunkClass.vectorizer);
      return documentChunkClass;
    } else {
      console.log("❌ DocumentChunk class not found");
      return null;
    }
  } catch (err) {
    console.error("❌ Failed to inspect schema:", err);
    throw err;
  }
}

*/
