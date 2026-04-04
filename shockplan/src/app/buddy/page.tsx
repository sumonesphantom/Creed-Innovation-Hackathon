"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Send, Shield, Sparkles } from "lucide-react";
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

export default function BuddyPage() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "buddy",
      content:
        "Hey! I'm your ShockPlan Buddy. I'm here to help you navigate financial challenges — no judgment, just real talk. What's on your mind?",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    if (!firstName) return;
    setMessages((prev) => {
      const w = prev[0];
      if (!w || w.id !== "welcome") return prev;
      const personalized = `Hey ${firstName}! I'm your ShockPlan Buddy. I'm here to help you navigate financial challenges — no judgment, just real talk. What's on your mind?`;
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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

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
        body: JSON.stringify({ message: text.trim(), deviceId }),
      });

      let buddyText: string;
      if (res.ok) {
        const data = await res.json();
        buddyText = data.response;
      } else {
        buddyText =
          "I'm having trouble connecting right now. Can you try again in a moment? In the meantime, if this is urgent, call 211 for immediate help.";
      }

      const buddyMessage: Message = {
        id: `buddy-${Date.now()}`,
        role: "buddy",
        content: buddyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, buddyMessage]);
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

  const showChips = messages.length <= 1 && !isLoading;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
        {/* Chat header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <BuddyAvatar />
            <div>
              <h1 className="text-base font-bold text-foreground">ShockPlan Buddy</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-powered financial companion
              </p>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
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
                disabled={isLoading}
              />
            </div>
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
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
