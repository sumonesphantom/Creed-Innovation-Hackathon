"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Send, Shield, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";

interface Message {
  id: string;
  role: "user" | "buddy";
  content: string;
  timestamp: Date;
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

  const STORAGE_KEY = user?.sub
    ? `shockplan_buddy_messages_${user.sub}`
    : `shockplan_buddy_messages_anon_${localStorage.getItem("shockplan_device_id") || "unknown"}`;

  const saveToLocalStorage = (msgs: Message[]) => {
    try {
      const toSave = msgs.filter((m) => m.id !== "welcome");
      if (toSave.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  };

  const loadFromLocalStorage = (): Message[] => {
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
  };

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
        const res = await fetch(
          `/api/buddy?deviceId=${encodeURIComponent(deviceId)}`
        );
        const data = await res.json();
        const raw = data.messages ?? [];
        const list: Message[] = raw.map(
          (m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as "user" | "buddy",
            content: m.content,
            timestamp: new Date(m.createdAt),
          })
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const clearChat = async () => {
    if (isLoading || !historyReady) return;
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    try {
      await fetch("/api/buddy", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
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
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          deviceId,
          crisisContext: crisisContextRef.current,
        }),
      });

      const fallbackMsg =
        "I'm having trouble connecting right now. Can you try again in a moment? In the meantime, if this is urgent, call 211 for immediate help.";

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: fallbackMsg,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const body = res.body;
      if (!body) {
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: fallbackMsg,
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
        if (buddyId)
          setMessages((prev) => {
            saveToLocalStorage(prev);
            return prev;
          });
      } finally {
        reader.releaseLock();
      }

      if (!buddyId) {
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: fallbackMsg,
            timestamp: new Date(),
          },
        ]);
      }
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
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <Sparkles className="h-3 w-3" />
                  AI-powered financial companion
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
