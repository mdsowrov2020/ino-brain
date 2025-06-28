// export async function embedText(text: string): Promise<number[]> {
//   const res = await fetch(
//     "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ inputs: text }),
//     }
//   );

//   const json = await res.json();

//   if (!Array.isArray(json)) {
//     throw new Error("❌ Invalid embedding response from Hugging Face");
//   }

//   // Average over token-level vectors
//   if (Array.isArray(json[0])) {
//     return json[0].reduce((acc: number[], vec: number[], _, arr) => {
//       vec.forEach((v, i) => {
//         acc[i] = (acc[i] || 0) + v / arr.length;
//       });
//       return acc;
//     }, []);
//   }

//   return json;
// }
// Option 3: Use a different sentence transformer model endpoint
// Alternative Option 2: Use the model endpoint with correct format
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          source_sentence: text,
          sentences: [text],
        },
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Hugging Face error:", errorText);
    throw new Error(
      `❌ Hugging Face API error: ${res.status} ${res.statusText}`
    );
  }

  const json = await res.json();

  // This endpoint typically returns similarity scores, but some models return embeddings
  // You might need to adjust based on the actual response format
  console.log("Response format:", json);

  if (!Array.isArray(json)) {
    throw new Error("❌ Invalid embedding response from Hugging Face");
  }

  return Array.isArray(json[0]) ? json[0] : json;
}
