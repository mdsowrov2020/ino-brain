// Using Hugging Face (Free alternative to OpenAI)
export class HuggingFaceService {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
      `${this.baseUrl}/sentence-transformers/all-MiniLM-L6-v2`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate embedding");
    }

    return await response.json();
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/microsoft/DialoGPT-medium`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const result = await response.json();
    return (
      result[0]?.generated_text || "Sorry, I could not generate a response."
    );
  }

  async summarizeText(text: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/facebook/bart-large-cnn`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 150,
          min_length: 30,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to summarize text");
    }

    const result = await response.json();
    return result[0]?.summary_text || "Summary not available.";
  }
}

export const aiService = new HuggingFaceService(
  process.env.HUGGINGFACE_API_KEY!
);
