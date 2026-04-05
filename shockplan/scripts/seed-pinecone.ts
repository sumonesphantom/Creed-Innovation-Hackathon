import { config } from "dotenv";
import { resolve } from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { createBuddyEmbeddings } from "../src/lib/rag/buddy-embeddings";
import { BUDDY_KNOWLEDGE_DOCUMENTS } from "../src/lib/rag/knowledge-chunks";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const pineconeKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;
  if (!pineconeKey || !indexName) {
    console.error("Missing PINECONE_API_KEY or PINECONE_INDEX in .env.local");
    process.exit(1);
  }

  const pinecone = new Pinecone({ apiKey: pineconeKey });
  const embeddings = await createBuddyEmbeddings(pinecone, indexName);
  const index = pinecone.Index(indexName);

  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });
  const ids = BUDDY_KNOWLEDGE_DOCUMENTS.map((_, i) => `shockplan-kb-${i}`);
  await store.addDocuments(BUDDY_KNOWLEDGE_DOCUMENTS, { ids });

  console.log(`Upserted ${BUDDY_KNOWLEDGE_DOCUMENTS.length} documents into Pinecone index "${indexName}".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
