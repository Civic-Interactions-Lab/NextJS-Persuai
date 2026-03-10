"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, LoaderIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  useGetTopics,
  useCreateTopic,
  useUpdateTopic,
  useRemoveTopic,
} from "@/features/settings/hooks/use-topics";
import {
  useCreateAgent,
  useGetAgents,
  useUpdateAgent,
} from "@/features/settings/hooks/use-agents";

// ── Types ──────────────────────────────────────────────────────────────────

type Topic = {
  _id: Id<"topics">;
  label: string;
  prompt: string;
  isActive?: boolean;
};

type Agent = {
  _id: Id<"agents">;
  name: string;
  position: "agree" | "disagree" | "neutral";
  description: string;
  systemPrompt: string;
};

// ── Topic Sheet ────────────────────────────────────────────────────────────

const TopicSheet = ({
  topic,
  open,
  onOpenChange,
}: {
  topic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const removeTopic = useRemoveTopic();

  const [label, setLabel] = useState(topic?.label ?? "");
  const [prompt, setPrompt] = useState(topic?.prompt ?? "");
  const [isActive, setIsActive] = useState(topic?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    setLabel(topic?.label ?? "");
    setPrompt(topic?.prompt ?? "");
    setIsActive(topic?.isActive ?? true);
  }, [topic]);

  const handleSave = async () => {
    if (!label.trim() || !prompt.trim()) return;
    setSaving(true);
    if (topic) {
      await updateTopic({ id: topic._id, label, prompt, isActive });
    } else {
      await createTopic({ label, prompt, isActive });
    }
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!topic) return;
    setDeleting(true);
    await removeTopic({ id: topic._id });
    setDeleting(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto p-6">
        <SheetHeader className="px-0">
          <SheetTitle>{topic ? "Edit Topic" : "Add Topic"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 flex-1">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Universal Basic Income"
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="The opening statement shown to participants..."
              className="min-h-[500px] resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="topic-active"
            />
            <Label htmlFor="topic-active">Active</Label>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !label.trim() || !prompt.trim()}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <LoaderIcon className="size-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : topic ? (
              "Save Changes"
            ) : (
              "Add Topic"
            )}
          </Button>
          {topic && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <LoaderIcon className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Topic"
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Agent Sheet ────────────────────────────────────────────────────────────

const AgentSheet = ({
  agent,
  open,
  onOpenChange,
}: {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const updateAgent = useUpdateAgent();
  const createAgent = useCreateAgent();

  const [name, setName] = useState(agent?.name ?? "");
  const [position, setPosition] = useState<"agree" | "disagree" | "neutral">(
    agent?.position ?? "neutral",
  );
  const [description, setDescription] = useState(agent?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setName(agent?.name ?? "");
    setPosition(agent?.position ?? "neutral");
    setDescription(agent?.description ?? "");
    setSystemPrompt(agent?.systemPrompt ?? "");
  }, [agent]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    if (agent) {
      await updateAgent({
        id: agent._id,
        name,
        position,
        description,
        systemPrompt,
      });
    } else {
      await createAgent({ name, position, description, systemPrompt });
    }
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto p-6">
        <SheetHeader className="px-0!">
          <SheetTitle>{agent ? "Edit Agent" : "Add Agent"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 flex-1">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Advocate"
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={position}
              onValueChange={(v) =>
                setPosition(v as "agree" | "disagree" | "neutral")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agree">Agree</SelectItem>
                <SelectItem value="disagree">Disagree</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this agent's role"
            />
          </div>

          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Full system prompt for this agent..."
              className="min-h-[500px] resize-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t mt-6">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <LoaderIcon className="size-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : agent ? (
              "Save Changes"
            ) : (
              "Add Agent"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Main View ──────────────────────────────────────────────────────────────

const SettingsView = () => {
  const topics = useGetTopics();
  const agents = useGetAgents();

  const [topicSheetOpen, setTopicSheetOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [agentSheetOpen, setAgentSheetOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const openAddAgent = () => {
    setSelectedAgent(null);
    setAgentSheetOpen(true);
  };

  const openEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentSheetOpen(true);
  };

  const openAddTopic = () => {
    setSelectedTopic(null);
    setTopicSheetOpen(true);
  };

  const openEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setTopicSheetOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Topics */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Topics</h2>
              <p className="text-xs text-muted-foreground">
                Debate topics shown to participants
              </p>
            </div>
            <Button size="sm" onClick={openAddTopic}>
              <PlusIcon className="size-4" />
              Add Topic
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead className="hidden sm:table-cell">Prompt</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!topics || topics.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground text-sm py-8"
                    >
                      No topics yet. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  topics.map((topic) => (
                    <TableRow
                      key={topic._id}
                      className="cursor-pointer"
                      onClick={() => openEditTopic(topic as Topic)}
                    >
                      <TableCell className="font-medium">
                        {topic.label}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground max-w-xs truncate">
                        {topic.prompt}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            topic.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {topic.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Agents */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Agents</h2>
              <p className="text-xs text-muted-foreground">
                AI personas assigned to conversations
              </p>
            </div>
            <Button size="sm" onClick={openAddAgent}>
              <PlusIcon className="size-4" />
              Add Agent
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Description
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!agents || agents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground text-sm py-8"
                    >
                      No agents yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => (
                    <TableRow
                      key={agent._id}
                      className="cursor-pointer"
                      onClick={() => openEditAgent(agent as Agent)}
                    >
                      <TableCell className="font-medium">
                        {agent.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                            agent.position === "agree"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : agent.position === "disagree"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                          }`}
                        >
                          {agent.position}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {agent.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <TopicSheet
        topic={selectedTopic}
        open={topicSheetOpen}
        onOpenChange={setTopicSheetOpen}
      />

      <AgentSheet
        agent={selectedAgent}
        open={agentSheetOpen}
        onOpenChange={setAgentSheetOpen}
      />
    </div>
  );
};

export default SettingsView;
