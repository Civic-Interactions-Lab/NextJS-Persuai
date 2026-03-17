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
import { useGetAgents } from "@/features/admin/settings/hooks/use-agents";
import { Agent } from "../../../../../convex/types/convexTypes";
import AgentSheet from "./agent-sheet";

const AgentsTable = () => {
  const agents = useGetAgents();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Agent | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold mb-1">Agents</h2>
          <p className="text-xs text-muted-foreground">
            AI personas assigned to conversations
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
                  onClick={() => {
                    setSelected(agent as Agent);
                    setOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{agent.name}</TableCell>
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

      <AgentSheet agent={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
};

export default AgentsTable;
