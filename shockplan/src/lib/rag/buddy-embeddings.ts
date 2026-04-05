import type { Pinecone } from "@pinecone-database/pinecone";
import type { Embeddings } from "@langchain/core/embeddings";
import { PineconeInferenceEmbeddings } from "@/lib/rag/pinecone-inference-embeddings";

const SUPPORTED_DIMS = new Set([384, 512, 768, 1024, 2048]);

export async function createBuddyEmbeddings(pinecone: Pinecone, indexName: string): Promise<Embeddings> {
  const meta = await pinecone.describeIndex(indexName);
  const indexDim = meta.dimension;
  if (indexDim === undefined) {
    throw new Error("Could not read Pinecone index dimension.");
  }
  if (!SUPPORTED_DIMS.has(indexDim)) {
    throw new Error(
      `Pinecone index dimension ${indexDim} is not supported for llama-text-embed-v2. Create an index with one of: ${[...SUPPORTED_DIMS].join(", ")}.`
    );
  }
  return new PineconeInferenceEmbeddings({
    pinecone,
    indexDimension: indexDim,
  });
}
