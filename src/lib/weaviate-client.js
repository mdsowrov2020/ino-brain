"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
// export default initWeaviateClient;
var weaviate_ts_client_1 = require("weaviate-ts-client");
var client = weaviate_ts_client_1.default.client({
    scheme: "https",
    host: process.env.NEXT_PUBLIC_WEAVIATE_URL,
    apiKey: process.env.WEAVIATE_API_KEY
        ? new weaviate_ts_client_1.default.ApiKey(process.env.WEAVIATE_API_KEY)
        : undefined,
});
exports.default = client;
