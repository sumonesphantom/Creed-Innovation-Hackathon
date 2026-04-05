import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { createBuddyEmbeddings } from "@/lib/rag/buddy-embeddings";

const RAG_TOP_K = 5;

let cachedStore: PineconeStore | undefined;

export async function getBuddyVectorStore(): Promise<PineconeStore | null> {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;
  if (!apiKey || !indexName) {
    return null;
  }
  if (cachedStore) {
    return cachedStore;
  }
  try {
    const pinecone = new Pinecone({ apiKey });
    const embeddings = await createBuddyEmbeddings(pinecone, indexName);
    const index = pinecone.Index(indexName);
    cachedStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });
    return cachedStore;
  } catch (e) {
    console.error("Buddy vector store:", e);
    return null;
  }
}

export async function retrieveBuddyContext(
  userMessage: string,
  crisisContext?: string
): Promise<string> {
  const store = await getBuddyVectorStore();
  if (!store) {
    return "";
  }
  const query = [userMessage, crisisContext].filter(Boolean).join("\n");
  const docs = await store.similaritySearch(query, RAG_TOP_K);
  if (docs.length === 0) {
    return "";
  }
  return docs.map((d, i) => `[${i + 1}] ${d.pageContent}`).join("\n\n");
}
