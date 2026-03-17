"use client";

import React, { useState } from "react";
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
import { LoaderIcon } from "lucide-react";
import {
  useCreateAgent,
  useUpdateAgent,
} from "@/features/admin/settings/hooks/use-agents";
import { Agent, AgentPosition } from "../../../../../convex/types/convexTypes";

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

export default AgentSheet;
