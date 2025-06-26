# Document Processing & Vector Search with Weaviate & HuggingFace

This project processes uploaded documents, extracts and chunks text, generates embeddings with HuggingFace models, and stores the chunks with vectors in a Weaviate Cloud instance. This enables semantic search, AI chat, summaries, and notes based on specific documents.

---

## Features

- Upload documents and extract text content
- Chunk large text into manageable pieces
- Generate semantic embeddings using HuggingFace API
- Store document chunks as vectors in Weaviate Cloud
- Query and interact with document-specific data via vector search

---

## Tech Stack

- Next.js API routes
- Weaviate Cloud vector database
- HuggingFace sentence-transformer embedding API
- Supabase storage for file hosting
- TypeScript

---

## Setup

### 1. Clone repo and install dependencies

```bash
git clone YOUR_REPO_URL
cd YOUR_PROJECT
npm install
```
