import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: [
        "@pinecone-database/pinecone",
        "@langchain/pinecone",
        "@langchain/google-genai",
        "langchain",
        "socket.io",
        "socket.io-client",
    ],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "s.gravatar.com",
            },
        ],
    },
};

export default nextConfig;
