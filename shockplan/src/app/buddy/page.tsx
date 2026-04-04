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

function BuddyAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <Shield className="h-4 w-4 text-primary" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <BuddyAvatar />
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && <BuddyAvatar />}
      <div
        className={[
          "max-w-[80%] lg:max-w-[60%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-tl-sm",
        ].join(" ")}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}
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

  const STORAGE_KEY = "shockplan_buddy_messages";

  const saveToLocalStorage = (msgs: Message[]) => {
    try {
      const toSave = msgs.filter((m) => m.id !== "welcome");
      if (toSave.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch {}
  };

  const loadFromLocalStorage = (): Message[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map((m: { id: string; role: string; content: string; timestamp: string }) => ({
        ...m,
        role: m.role as "user" | "buddy",
        timestamp: new Date(m.timestamp),
      }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const deviceId = typeof window !== "undefined" ? localStorage.getItem("shockplan_device_id") || "" : "";

      // Load from localStorage immediately so history shows instantly
      const cached = loadFromLocalStorage();
      if (!cancelled && cached.length > 0) {
        setMessages(cached);
        setHistoryReady(true);
      }

      try {
        const res = await fetch(`/api/buddy?deviceId=${encodeURIComponent(deviceId)}`);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

    // Auto-resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

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

      if (!res.ok) {
        const fallback =
          "I'm having trouble connecting right now. Can you try again in a moment? In the meantime, if this is urgent, call 211 for immediate help.";
        setMessages((prev) => [
          ...prev,
          {
            id: `buddy-${Date.now()}`,
            role: "buddy",
            content: fallback,
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
            content:
              "I'm having trouble connecting right now. Can you try again in a moment? In the meantime, if this is urgent, call 211 for immediate help.",
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
        // Save to localStorage after stream completes
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
            content:
              "I'm having trouble connecting right now. Can you try again in a moment? In the meantime, if this is urgent, call 211 for immediate help.",
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
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const showChips = messages.length <= 1 && !isLoading && historyReady;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
        {/* Chat header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <BuddyAvatar />
              <div>
                <h1 className="text-base font-bold text-foreground">ShockPlan Buddy</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-powered financial companion
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={clearChat}
              disabled={
                !historyReady ||
                isLoading ||
                !messages.some((m) => m.id !== "welcome")
              }
              title="Clear saved chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear chat</span>
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {!historyReady ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading your chat…</p>
            ) : (
              messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
            )}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick action chips */}
        {showChips && (
          <div className="px-4 sm:px-6 lg:px-8 pb-2">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:bg-accent text-foreground transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading || !historyReady}
              />
            </div>
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading || !historyReady}
              className="rounded-xl h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="max-w-3xl mx-auto text-[10px] text-muted-foreground/50 mt-2 text-center">
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
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        </AppShell>
      }
    >
      <BuddyChatInner />
    </Suspense>
  );
}
