// import weaviate from "weaviate-client";
// const initWeaviateClient = async () => {
//   const client = await weaviate.connectToWeaviateCloud(
//     process.env.NEXT_PUBLIC_WEAVIATE_URL!,
//     {
//       authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
//       headers: {
//         "X-HuggingFace-Api-Key": process.env.HUGGINGFACE_API_KEY!,
//       },
//     }
//   );
//   return client;
// };

// export default initWeaviateClient;

import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "https",
  host: process.env.NEXT_PUBLIC_WEAVIATE_URL!,
  apiKey: process.env.WEAVIATE_API_KEY
    ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
    : undefined,
});

export default client;
