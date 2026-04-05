import { randomUUID } from "crypto";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { loadEnvConfig } from "@next/env";
import { Server } from "socket.io";
import {
  clearBuddyMessages,
  getBuddyMessages,
  handleBuddyChatMessage,
} from "./src/lib/buddy-chat-handler";
import { validateBuddyRoomKey } from "./src/lib/buddy-room-registry";

loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    void handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: dev ? true : false },
  });

  io.on("connection", (socket) => {
    const buildSocketRequest = () => {
      const host = socket.handshake.headers.host ?? `localhost:${port}`;
      return new Request(`http://${host}`, {
        headers: {
          cookie: socket.handshake.headers.cookie ?? "",
        },
      });
    };

    socket.on("buddy:join", async (payload: { roomKey: string }) => {
      const { roomKey } = payload;
      if (!roomKey || !validateBuddyRoomKey(roomKey)) {
        socket.emit("buddy:join_error", { message: "Invalid or expired room key." });
        return;
      }
      await socket.join(roomKey);
      socket.emit("buddy:joined", { roomKey });
    });

    socket.on(
      "buddy:history",
      async (payload: { requestId?: string; deviceId?: string }) => {
        const requestId = payload.requestId ?? randomUUID();
        const result = await getBuddyMessages(buildSocketRequest(), payload.deviceId);
        if (!result.ok) {
          socket.emit("buddy:history_error", {
            requestId,
            status: result.status,
            message: result.body.error,
          });
          return;
        }
        socket.emit("buddy:history_result", {
          requestId,
          messages: result.messages,
        });
      }
    );

    socket.on(
      "buddy:clear",
      async (payload: { requestId?: string; deviceId?: string }) => {
        const requestId = payload.requestId ?? randomUUID();
        const result = await clearBuddyMessages(buildSocketRequest(), payload.deviceId);
        if (!result.ok) {
          socket.emit("buddy:clear_error", {
            requestId,
            status: result.status,
            message: result.body.error,
          });
          return;
        }
        socket.emit("buddy:cleared", { requestId });
      }
    );

    socket.on(
      "buddy:send",
      async (payload: {
        roomKey?: string;
        requestId?: string;
        message: string;
        deviceId?: string;
        crisisContext?: string;
      }) => {
        const requestId = payload.requestId ?? randomUUID();
        const { roomKey } = payload;
        if (!roomKey || !validateBuddyRoomKey(roomKey)) {
          socket.emit("buddy:error", {
            requestId,
            status: 400,
            message: "Missing or invalid room. Refresh the page and try again.",
          });
          return;
        }
        if (!socket.rooms.has(roomKey)) {
          socket.emit("buddy:error", {
            requestId,
            status: 403,
            message: "Join your chat room before sending. Wait for the connection to finish.",
          });
          return;
        }
        const result = await handleBuddyChatMessage(buildSocketRequest(), payload);
        if (!result.ok) {
          socket.emit("buddy:error", {
            requestId,
            status: result.status,
            message: result.body.error,
          });
          return;
        }
        const buddyId = randomUUID();
        socket.emit("buddy:start", { requestId, id: buddyId });
        const reader = result.stream.getReader();
        const decoder = new TextDecoder();
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) {
              socket.emit("buddy:chunk", { requestId, id: buddyId, chunk });
            }
          }
          socket.emit("buddy:done", { requestId, id: buddyId });
        } catch {
          socket.emit("buddy:error", { requestId, status: 500, message: "Stream failed." });
        } finally {
          reader.releaseLock();
        }
      }
    );
  });

  httpServer
    .once("error", (err: NodeJS.ErrnoException) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
