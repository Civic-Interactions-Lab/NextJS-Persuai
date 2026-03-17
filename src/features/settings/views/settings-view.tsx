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
import { PlusIcon, LoaderIcon } from "lucide-react";
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
import {
  Agent,
  AgentPosition,
  Topic,
} from "../../../../convex/types/convexTypes";

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

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(topic?.title ?? "");
  const [issue, setIssue] = useState(topic?.issue ?? "");

  React.useEffect(() => {
    if (open) {
      setTitle(topic?.title ?? "");
      setIssue(topic?.issue ?? "");
    }
  }, [topic, open]);

  const handleSave = async () => {
    if (!title.trim() || !issue.trim()) return;
    setSaving(true);
    if (topic) {
      await updateTopic({ id: topic._id, title, issue });
    } else {
      await createTopic({ title, issue });
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
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Freedom of Speech"
            />
          </div>

          <div className="space-y-2">
            <Label>Issue</Label>
            <Textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. Should free speech be protected even when it offends others?"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !issue.trim()}
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
  const [position, setPosition] = useState<AgentPosition>(
    agent?.position ?? "non_manipulative",
  );
  const [description, setDescription] = useState(agent?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setName(agent?.name ?? "");
      setPosition(agent?.position ?? "non_manipulative");
      setDescription(agent?.description ?? "");
      setSystemPrompt(agent?.systemPrompt ?? "");
    }
  }, [agent, open]);

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
              placeholder="e.g. Non Manipulative"
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={position}
              onValueChange={(v) => setPosition(v as AgentPosition)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="e.g. Non Manipulative" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non_manipulative">
                  Non Manipulative
                </SelectItem>
                <SelectItem value="manipulative_left">
                  Manipulative Left
                </SelectItem>
                <SelectItem value="manipulative_right">
                  Manipulative Right
                </SelectItem>
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
                            agent.position === "non_manipulative"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : agent.position === "manipulative_left"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          }`}
                        >
                          {agent.position.replace(/_/g, " ")}
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Issue</TableHead>
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
                        {topic.title}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground max-w-xs truncate">
                        {topic.issue}
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
