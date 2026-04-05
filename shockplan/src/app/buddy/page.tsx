"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { io, type Socket } from "socket.io-client";
import { Send, Shield, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";

interface Message {
  id: string;
  role: "user" | "buddy";
  content: string;
  timestamp: Date;
}

interface StoredBuddyMessage {
  id: string;
  role: "user" | "buddy";
  content: string;
  createdAt: string | Date;
}

const QUICK_CHIPS = [
  "I just lost my job — what do I do first?",
  "How do I start an emergency fund?",
  "Explain health insurance deductibles",
  "I got a surprise medical bill",
  "Help me make a crisis budget",
  "What government aid am I eligible for?",
];

// Dark bg + yellow shield icon — matches app-shell logo style
function BuddyAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div
      className={`${dim} rounded-lg bg-[#1A1A1A] dark:bg-white/10 flex items-center justify-center shrink-0`}
    >
      <Shield className={`${icon} text-[#F5C518]`} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BuddyAvatar size="sm" />
      <div className="bg-card border border-border rounded-[10px] rounded-bl-sm px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && <BuddyAvatar size="sm" />}
      <div
        className="flex flex-col gap-1"
        style={{ alignItems: isUser ? "flex-end" : "flex-start", maxWidth: "78%" }}
      >
        <div
          className={[
            "px-4 py-3 text-sm leading-relaxed shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
            isUser
              ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[10px] rounded-br-sm"
              : "bg-card border border-border text-foreground rounded-[10px] rounded-bl-sm",
          ].join(" ")}
        >
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {line}
            </p>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/50 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function getWelcomeMessage(firstName?: string) {
  return firstName
    ? `Hey ${firstName}! I'm your ShockPlan Buddy. I'm here to help you navigate financial challenges — no judgment, just real talk. What's on your mind?`
    : `Hey! I'm your ShockPlan Buddy. I'm here to help you navigate financial challenges — no judgment, just real talk. What's on your mind?`;
}

function BuddyChatInner() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0];
  const searchParams = useSearchParams();
  const crisisContextRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const c = searchParams.get("context");
    crisisContextRef.current = c || undefined;
  }, [searchParams]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const fallbackConnectMsg =
    "I'm having trouble connecting right now. Can you try again in a moment? In the meantime, if this is urgent, call 211 for immediate help.";

  const STORAGE_KEY = user?.sub
    ? `shockplan_buddy_messages_${user.sub}`
    : `shockplan_buddy_messages_anon_${
        typeof window !== "undefined"
          ? localStorage.getItem("shockplan_device_id") || "unknown"
          : "unknown"
      }`;

  const saveToLocalStorage = useCallback(
    (msgs: Message[]) => {
      try {
        const toSave = msgs.filter((m) => m.id !== "welcome");
        if (toSave.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
    },
    [STORAGE_KEY]
  );

  const loadFromLocalStorage = useCallback((): Message[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map(
        (m: { id: string; role: string; content: string; timestamp: string }) => ({
          ...m,
          role: m.role as "user" | "buddy",
          timestamp: new Date(m.timestamp),
        })
      );
    } catch {
      return [];
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!firstName) return;
    setMessages((prev) => {
      const w = prev[0];
      if (!w || w.id !== "welcome") return prev;
      const personalized = getWelcomeMessage(firstName);
      if (w.content === personalized) return prev;
      return [{ ...w, content: personalized }, ...prev.slice(1)];
    });
  }, [firstName]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [socketUsable, setSocketUsable] = useState(false);
  const [roomKeyLabel, setRoomKeyLabel] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const roomKeyRef = useRef<string | null>(null);

  const toUiMessages = useCallback(
    (raw: StoredBuddyMessage[]): Message[] =>
      raw.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
      })),
    []
  );

  const fetchHistoryOverHttp = useCallback(
    async (deviceId: string) => {
      const res = await fetch(`/api/buddy?deviceId=${encodeURIComponent(deviceId)}`);
      const data = (await res.json()) as { messages?: StoredBuddyMessage[] };
      return toUiMessages(data.messages ?? []);
    },
    [toUiMessages]
  );

  const fetchHistoryOverSocket = useCallback(
    async (deviceId: string) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        return fetchHistoryOverHttp(deviceId);
      }

      const requestId = crypto.randomUUID();
      return await new Promise<Message[]>((resolve, reject) => {
        const cleanup = () => {
          socket.off("buddy:history_result", onResult);
          socket.off("buddy:history_error", onError);
        };

        const onResult = (payload: {
          requestId: string;
          messages: StoredBuddyMessage[];
        }) => {
          if (payload.requestId !== requestId) return;
          cleanup();
          resolve(toUiMessages(payload.messages ?? []));
        };

        const onError = (payload: { requestId?: string; message?: string }) => {
          if (payload.requestId !== requestId) return;
          cleanup();
          reject(new Error(payload.message ?? fallbackConnectMsg));
        };

        socket.on("buddy:history_result", onResult);
        socket.on("buddy:history_error", onError);
        socket.emit("buddy:history", { requestId, deviceId });
      });
    },
    [fallbackConnectMsg, fetchHistoryOverHttp, toUiMessages]
  );

  const clearChatOverHttp = useCallback(async (deviceId: string) => {
    await fetch("/api/buddy", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
  }, []);

  const clearChatOverSocket = useCallback(
    async (deviceId: string) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        await clearChatOverHttp(deviceId);
        return;
      }

      const requestId = crypto.randomUUID();
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          socket.off("buddy:cleared", onCleared);
          socket.off("buddy:clear_error", onError);
        };

        const onCleared = (payload: { requestId: string }) => {
          if (payload.requestId !== requestId) return;
          cleanup();
          resolve();
        };

        const onError = (payload: { requestId?: string; message?: string }) => {
          if (payload.requestId !== requestId) return;
          cleanup();
          reject(new Error(payload.message ?? fallbackConnectMsg));
        };

        socket.on("buddy:cleared", onCleared);
        socket.on("buddy:clear_error", onError);
        socket.emit("buddy:clear", { requestId, deviceId });
      });
    },
    [clearChatOverHttp, fallbackConnectMsg]
  );

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_SOCKET_URL;
    const socket = io(base && base.length > 0 ? base : undefined, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    const joinRoom = () => {
      const key = roomKeyRef.current;
      if (!key || cancelled) return;
      socket.emit("buddy:join", { roomKey: key });
    };

    socket.on("connect", () => {
      if (!cancelled) setSocketUsable(true);
      joinRoom();
    });

    socket.on("disconnect", () => {
      if (!cancelled) {
        setSocketUsable(false);
        setRoomJoined(false);
      }
    });

    socket.on("connect_error", () => {
      if (!cancelled) {
        setSocketUsable(false);
        setRoomJoined(false);
      }
    });

    socket.on("buddy:joined", (p: { roomKey: string }) => {
      if (!cancelled && p.roomKey === roomKeyRef.current) {
        setRoomJoined(true);
      }
    });

    socket.on("buddy:join_error", () => {
      if (!cancelled) setRoomJoined(false);
    });

    (async () => {
      try {
        const res = await fetch("/api/buddy/room");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { roomKey?: string };
        if (!data.roomKey || cancelled) return;
        roomKeyRef.current = data.roomKey;
        setRoomKeyLabel(data.roomKey.slice(0, 8));
        if (socket.connected) joinRoom();
      } catch {
        if (!cancelled) setRoomJoined(false);
      }
    })();

    return () => {
      cancelled = true;
      socket.disconnect();
      socketRef.current = null;
      roomKeyRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const deviceId =
        typeof window !== "undefined"
          ? localStorage.getItem("shockplan_device_id") || ""
          : "";
      const cached = loadFromLocalStorage();
      if (!cancelled && cached.length > 0) {
        setMessages(cached);
        setHistoryReady(true);
      }
      try {
        const list = await fetchHistoryOverSocket(deviceId);
        if (!cancelled) {
          if (list.length > 0) {
            setMessages(list);
            saveToLocalStorage(list);
          } else if (cached.length === 0) {
            setMessages([
              {
                id: "welcome",
                role: "buddy",
                content: getWelcomeMessage(undefined),
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch {
        if (!cancelled && cached.length === 0) {
          setMessages([
            {
              id: "welcome",
              role: "buddy",
              content: getWelcomeMessage(undefined),
              timestamp: new Date(),
            },
          ]);
        }
      } finally {
        if (!cancelled) setHistoryReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchHistoryOverSocket, loadFromLocalStorage, saveToLocalStorage]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const clearChat = async () => {
    if (isLoading || !historyReady) return;
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    try {
      await clearChatOverSocket(deviceId);
    } catch {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        id: "welcome",
        role: "buddy",
        content: getWelcomeMessage(firstName),
        timestamp: new Date(),
      },
    ]);
  };

  const emptyReplyMsg =
    "I didn't get any text back from the model. Please try again in a moment.";

  const streamBuddyOverHttp = useCallback(
    async (text: string, deviceId: string) => {
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          deviceId,
          crisisContext: crisisContextRef.current,
        }),
      });

      const ct = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        let errText = fallbackConnectMsg;
        try {
          if (ct.includes("application/json")) {
            const j = (await res.json()) as { error?: string };
            if (j.error) errText = j.error;
          }
        } catch {
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: errText,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (ct.includes("application/json")) {
        try {
          const j = (await res.json()) as { error?: string };
          setMessages((prev) => [
            ...prev,
            {
              id: `buddy-${Date.now()}`,
              role: "buddy",
              content: j.error ?? fallbackConnectMsg,
              timestamp: new Date(),
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              id: `buddy-${Date.now()}`,
              role: "buddy",
              content: fallbackConnectMsg,
              timestamp: new Date(),
            },
          ]);
        }
        return;
      }

      const body = res.body;
      if (!body) {
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: fallbackConnectMsg,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buddyId: string | null = null;

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          if (!buddyId) {
            buddyId = `buddy-${Date.now()}`;
            setMessages((prev) => [
              ...prev,
              {
                id: buddyId!,
                role: "buddy",
                content: accumulated,
                timestamp: new Date(),
              },
            ]);
            setIsLoading(false);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === buddyId ? { ...m, content: accumulated } : m
              )
            );
          }
        }
        if (buddyId) {
          setMessages((prev) => {
            saveToLocalStorage(prev);
            return prev;
          });
        }
      } finally {
        reader.releaseLock();
      }

      if (!buddyId) {
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: accumulated.trim() ? accumulated : emptyReplyMsg,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [fallbackConnectMsg, saveToLocalStorage]
  );

  const streamBuddyOverSocket = useCallback(
    async (text: string, deviceId: string) => {
      const socket = socketRef.current;
      const rk = roomKeyRef.current;
      if (
        !socket?.connected ||
        !roomJoined ||
        !rk
      ) {
        await streamBuddyOverHttp(text, deviceId);
        return;
      }

      const requestId = crypto.randomUUID();
      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve();
        };

        const cleanup = () => {
          socket.off("buddy:start", onStart);
          socket.off("buddy:chunk", onChunk);
          socket.off("buddy:done", onDone);
          socket.off("buddy:error", onErr);
        };

        let accumulated = "";

        function onStart(p: { requestId: string; id: string }) {
          if (p.requestId !== requestId) return;
          accumulated = "";
          setMessages((prev) => [
            ...prev,
            {
              id: p.id,
              role: "buddy",
              content: "",
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }

        function onChunk(p: { requestId: string; id: string; chunk: string }) {
          if (p.requestId !== requestId) return;
          accumulated += p.chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === p.id ? { ...m, content: accumulated } : m
            )
          );
        }

        function onDone(p: { requestId: string; id: string }) {
          if (p.requestId !== requestId) return;
          setMessages((prev) => {
            saveToLocalStorage(prev);
            return prev;
          });
          finish();
        }

        function onErr(p: {
          requestId?: string;
          status: number;
          message: string;
        }) {
          if (p.requestId !== undefined && p.requestId !== requestId) return;
          setMessages((prev) => [
            ...prev,
            {
              id: `buddy-${Date.now()}`,
              role: "buddy",
              content: p.message || fallbackConnectMsg,
              timestamp: new Date(),
            },
          ]);
          finish();
        }

        socket.on("buddy:start", onStart);
        socket.on("buddy:chunk", onChunk);
        socket.on("buddy:done", onDone);
        socket.on("buddy:error", onErr);

        socket.emit("buddy:send", {
          roomKey: rk,
          requestId,
          message: text,
          deviceId,
          crisisContext: crisisContextRef.current,
        });
      });
    },
    [fallbackConnectMsg, roomJoined, saveToLocalStorage, streamBuddyOverHttp]
  );

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !historyReady) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const deviceId = localStorage.getItem("shockplan_device_id") || "";
      await streamBuddyOverSocket(text.trim(), deviceId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `buddy-error-${Date.now()}`,
          role: "buddy",
          content:
            "Something went wrong on my end. Please try again — I'm here for you.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const showChips = messages.length <= 1 && !isLoading && historyReady;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">

        {/* ── Header ── */}
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-card">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <BuddyAvatar />
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">
                  ShockPlan Buddy
                </h1>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 flex-wrap">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
                      roomJoined && socketUsable ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>
                    {roomJoined && socketUsable && roomKeyLabel
                      ? `Room ${roomKeyLabel}… · socket`
                      : socketUsable
                        ? "Joining room…"
                        : "HTTP fallback — use npm run dev (root script) for Socket.io"}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearChat}
              disabled={
                !historyReady ||
                isLoading ||
                !messages.some((m) => m.id !== "welcome")
              }
              title="Clear saved chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-muted-foreground border border-border bg-background
                         hover:bg-muted hover:text-foreground transition-colors
                         disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear chat</span>
            </button>
          </div>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-background">
          <div className="max-w-3xl mx-auto space-y-4">
            {!historyReady ? (
              <div className="flex items-center justify-center gap-1.5 py-16">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:300ms]" />
              </div>
            ) : (
              messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
            )}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Quick chips ── */}
        {showChips && (
          <div className="px-4 sm:px-6 pb-2 bg-card border-t border-border">
            <div className="max-w-3xl mx-auto pt-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Try asking
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background
                               hover:bg-[#FEFAE8] hover:border-[#F5C518]/40 text-foreground
                               transition-all duration-150"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Input area ── */}
        <div className="px-4 sm:px-6 py-3 border-t border-border bg-card">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your finances…"
                rows={1}
                className="w-full resize-none rounded-[10px] border border-border bg-background
                           px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-[#F5C518]/40 focus:border-[#F5C518]/50
                           transition-all disabled:opacity-50"
                disabled={isLoading || !historyReady}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading || !historyReady}
              className="flex items-center justify-center w-10 h-10 rounded-[10px] shrink-0
                         bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]
                         hover:bg-[#333] dark:hover:bg-gray-100
                         disabled:opacity-40 disabled:pointer-events-none
                         transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="max-w-3xl mx-auto text-[10px] text-muted-foreground/40 mt-2 text-center">
            ShockPlan provides educational information only — not financial advice.
          </p>
        </div>

      </div>
    </AppShell>
  );
}

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center h-screen gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:0ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:300ms]" />
          </div>
        </AppShell>
      }
    >
      <BuddyChatInner />
    </Suspense>
  );
}
