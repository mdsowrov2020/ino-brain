import client from "../weaviate-client";

export async function getChunksByDocumentId(documentId: string) {
  const response = await client.graphql
    .get()
    .withClassName("DocumentChunks")
    .withFields("_additional { id } text documentId")
    .withWhere({
      path: ["documentId"],
      operator: "Equal",
      valueString: documentId,
    })
    .withLimit(100)
    .do();

  return response.data.Get.DocumentChunks;
}
