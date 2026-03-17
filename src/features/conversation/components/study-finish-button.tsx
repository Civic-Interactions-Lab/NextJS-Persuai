"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollTextIcon, SendIcon } from "lucide-react";
import { ConversationId } from "../../../../convex/types/convexTypes";
import {
  useGetParticipantByExternalId,
  useUpsertParticipant,
} from "@/features/conversation/hooks/use-participants";
import { generateSubmissionCode } from "@/lib/utils";

interface FinishStudyButtonProps {
  conversationId: ConversationId;
}

const StudyFinishButton = ({ conversationId }: FinishStudyButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const upsertParticipant = useUpsertParticipant();

  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const participant = useGetParticipantByExternalId(externalId);
  const isFinished =
    participant?.status === "completed" || participant?.status === "partial";

  const handleClick = () => {
    if (isFinished) {
      router.push("/debriefing");
      return;
    }
    setOpen(true);
  };

  const handleConfirm = async () => {
    const externalId = localStorage.getItem("PROLIFIC_PID");
    if (externalId) {
      const submissionCode = generateSubmissionCode();
      await upsertParticipant({
        externalId,
        status: "opted_out",
        submissionCode,
      });
    }
    router.push(`/survey?type=post&conversationId=${conversationId}`);
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={handleClick}>
        {isFinished ? (
          <ScrollTextIcon className="size-4" />
        ) : (
          <SendIcon className="size-4" />
        )}
        <span className="hidden sm:inline">
          {isFinished ? "Debrief" : "Finish"}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Post-Survey First</DialogTitle>
            <DialogDescription>
              Please complete the post-survey before finishing the study. It
              only takes a minute!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Go to Post-Survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudyFinishButton;
