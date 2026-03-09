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
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";

const generateCompletionCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

interface FinishStudyButtonProps {
  conversationId: ConversationId;
}

const FinishStudyButton = ({ conversationId }: FinishStudyButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const conversation = useGetConversationById(conversationId);
  const messages = useQuery(api.messages.getMessages, { conversationId });

  const hasPostSurvey = false;
  const isDisabled = messages ? messages.length < 2 : false;

  const handleSubmit = () => {
    const code = generateCompletionCode();
    window.location.href = `https://app.prolific.com/submissions/complete?cc=${code}`;
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={isDisabled}>
        <SendIcon className="size-4" />
        <span className="hidden sm:inline">Finish</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {hasPostSurvey ? (
            <>
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
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Submit Study</DialogTitle>
                <DialogDescription>
                  Are you sure you want to finish and submit? This cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinishStudyButton;
