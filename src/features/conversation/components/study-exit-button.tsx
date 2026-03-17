"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOutIcon } from "lucide-react";
import { useUpsertParticipant } from "@/features/conversation/hooks/use-participants";

const StudyExitButton = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const upsertParticipant = useUpsertParticipant();

  const handleExit = async () => {
    const externalId = localStorage.getItem("PROLIFIC_PID");
    if (externalId) {
      await upsertParticipant({ externalId, status: "opted_out" });
    }
    router.push("/debriefing");
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <LogOutIcon className="size-4" />
        <span className="hidden sm:inline">Exit</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Study?</DialogTitle>
            <DialogDescription>
              You are about to exit the study entirely. If you do so, you will
              not be able to participate again in the future. Are you sure you
              want to exit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleExit}>
              Yes, Exit Study
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudyExitButton;
