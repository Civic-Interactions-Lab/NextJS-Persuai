"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import { Topic } from "../../../../../convex/types/convexTypes";
import TopicSheet from "./topic-sheet";

const TopicsTable = () => {
  const topics = useGetTopics();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Topic | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold mb-1">Topics</h2>
          <p className="text-xs text-muted-foreground">
            Debate topics shown to participants
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
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
                  colSpan={2}
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
                  onClick={() => {
                    setSelected(topic as Topic);
                    setOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{topic.title}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {topic.issue}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TopicSheet topic={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
};

export default TopicsTable;
