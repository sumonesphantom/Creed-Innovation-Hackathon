import { Embeddings } from "@langchain/core/embeddings";
import type { Pinecone } from "@pinecone-database/pinecone";

const DEFAULT_MODEL = "llama-text-embed-v2";

type DenseEmbedding = { vectorType: "dense"; values: number[] };

function isDense(emb: { vectorType: string; values?: number[] }): emb is DenseEmbedding {
  return emb.vectorType === "dense" && Array.isArray(emb.values);
}

export class PineconeInferenceEmbeddings extends Embeddings {
  private readonly pinecone: Pinecone;
  private readonly model: string;
  private readonly indexDimension: number;

  constructor(fields: { pinecone: Pinecone; indexDimension: number; model?: string }) {
    super({});
    this.pinecone = fields.pinecone;
    this.indexDimension = fields.indexDimension;
    this.model = fields.model ?? DEFAULT_MODEL;
  }

  async embedQuery(text: string): Promise<number[]> {
    const params: Record<string, string> = {
      inputType: "query",
      dimension: String(this.indexDimension),
    };
    const res = await this.pinecone.inference.embed(this.model, [text], params);
    const first = res.data[0];
    if (!first || !isDense(first)) {
      throw new Error("Pinecone inference returned no dense embedding for query.");
    }
    return first.values;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const params: Record<string, string> = {
      inputType: "passage",
      dimension: String(this.indexDimension),
    };
    const out: number[][] = [];
    const batchSize = 32;
    for (let i = 0; i < documents.length; i += batchSize) {
      const chunk = documents.slice(i, i + batchSize);
      const res = await this.pinecone.inference.embed(this.model, chunk, params);
      for (const emb of res.data) {
        if (!isDense(emb)) {
          throw new Error("Pinecone inference returned a non-dense embedding for a document.");
        }
        out.push(emb.values);
      }
    }
    return out;
  }
}
