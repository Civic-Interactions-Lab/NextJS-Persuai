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
import { SendIcon } from "lucide-react";
import { ConversationId } from "../../../../convex/types/convexTypes";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";

interface FinishStudyButtonProps {
  conversationId: ConversationId;
}

const StudyFinishButton = ({ conversationId }: FinishStudyButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const conversation = useGetConversationById(conversationId);

  const handleClick = () => {
    if (conversation?.status === "complete") {
      router.push("/debriefing");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button size="sm" onClick={handleClick}>
        <SendIcon className="size-4" />
        <span className="hidden sm:inline">Finish</span>
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
            <Button
              onClick={() =>
                router.push(
                  `/survey?type=post&conversationId=${conversationId}`,
                )
              }
            >
              Go to Post-Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudyFinishButton;
