"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoaderIcon, SendIcon } from "lucide-react";
import { useGetAgents } from "@/features/admin/settings/hooks/use-agents";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import { Agent } from "../../../../../convex/types/convexTypes";

type ChatMessage = { role: "user" | "assistant"; content: string };

export type ModelPlaygroundSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string;
  model: string;
};

const ModelPlaygroundSheet = ({
  open,
  onOpenChange,
  provider,
  model,
}: ModelPlaygroundSheetProps) => {
  const agents = useGetAgents();
  const topics = useGetTopics();

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAgent = agents?.find((a) => a._id === selectedAgentId) ?? null;
  const selectedTopic = topics?.find((t) => t._id === selectedTopicId) ?? null;
  const isReady = !!selectedAgent && !!selectedTopic;

  const triggerOpeningMessage = async (agent: Agent, issue: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          messages: [
            {
              role: "user",
              content: `Please open the debate on this topic: "${issue}"`,
            },
          ],
          systemPrompt: `${agent.systemPrompt}\n\nDebate topic: "${issue}"`,
        }),
      });
      const data = await res.json();
      setMessages([
        { role: "assistant", content: data.text ?? "No response." },
      ]);
    } catch {
      setMessages([
        { role: "assistant", content: "Error: failed to get opening message." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    setMessages([]);
    const agent = agents?.find((a) => a._id === agentId);
    // Use freshly resolved topic from state — avoids stale closure on selectedTopic
    const topic = topics?.find((t) => t._id === selectedTopicId);
    if (agent && topic) triggerOpeningMessage(agent as Agent, topic.issue);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setMessages([]);
    const topic = topics?.find((t) => t._id === topicId);
    // Use freshly resolved agent from state — avoids stale closure on selectedAgent
    const agent = agents?.find((a) => a._id === selectedAgentId);
    if (agent && topic) triggerOpeningMessage(agent as Agent, topic.issue);
  };

  const handleSend = async () => {
    if (!input.trim() || !isReady) return;
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/test-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          messages: updated,
          systemPrompt: `${selectedAgent!.systemPrompt}\n\nDebate topic: "${selectedTopic!.issue}"`,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text ?? "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setMessages([]);
      setSelectedAgentId("");
      setSelectedTopicId("");
    }
    onOpenChange(val);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col overflow-hidden p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 border-b border-border">
          <div className="flex flex-col items-start gap-1">
            <SheetTitle className="text-sm font-medium">Playground</SheetTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {provider} / {model}
            </div>
          </div>
        </SheetHeader>

        {/* Context — full width stacked selects */}
        <div className="px-5 pb-4 border-b border-border space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground tracking-wide uppercase">
              Agent
            </Label>
            <Select value={selectedAgentId} onValueChange={handleAgentSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose agent…" />
              </SelectTrigger>
              <SelectContent>
                {agents?.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground tracking-wide uppercase">
              Topic
            </Label>
            <Select value={selectedTopicId} onValueChange={handleTopicSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose topic…" />
              </SelectTrigger>
              <SelectContent>
                {topics?.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.issue.length > 48 ? t.issue.slice(0, 48) + "…" : t.issue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {!isReady ? (
            <div className="flex items-center justify-center h-full pb-10">
              <p className="text-xs text-muted-foreground">
                Pick an agent and topic above to begin.
              </p>
            </div>
          ) : messages.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full pb-10">
              <p className="text-xs text-muted-foreground">
                Opening the debate…
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed rounded-xl px-3.5 py-2.5 max-w-[82%] ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))
          )}
          {loading && (
            <div className="bg-muted text-muted-foreground text-xs rounded-xl px-3.5 py-2.5 max-w-[82%] flex items-center gap-2">
              <LoaderIcon className="size-3 animate-spin" />
              Thinking…
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-3 border-t border-border">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:ring-1 focus-within:ring-ring transition-shadow">
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isReady ? "Message…" : "Select agent and topic first…"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading || !isReady}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || !isReady}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
            >
              <SendIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModelPlaygroundSheet;
