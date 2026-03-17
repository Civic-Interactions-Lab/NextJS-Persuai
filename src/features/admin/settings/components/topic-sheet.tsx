"use client";

import React, { useState } from "react";
import { Topic } from "../../../../../convex/types/convexTypes";
import {
  useCreateTopic,
  useUpdateTopic,
  useRemoveTopic,
} from "@/features/admin/settings/hooks/use-topics";
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
import { LoaderIcon } from "lucide-react";

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

export default TopicSheet;
