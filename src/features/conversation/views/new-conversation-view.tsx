"use client";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import NewConversationDialog from "@/features/conversation/components/new-conversation-dialog";
import ConsentDialog from "@/features/conversation/components/consent-dialog";
import { toast } from "sonner";
import { useGetConsentForExternalId } from "@/features/conversation/hooks/use-consents";
import {
  useGetParticipantByExternalId,
  useUpsertParticipant,
} from "@/features/conversation/hooks/use-participants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetConversationForExternalId } from "@/features/conversation/hooks/use-conversations";

const NewConversationView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false);

  useEffect(() => {
    const prolificPid = searchParams.get("PROLIFIC_PID");
    const studyId = searchParams.get("STUDY_ID");
    const sessionId = searchParams.get("SESSION_ID");

    if (prolificPid) {
      localStorage.setItem("PROLIFIC_PID", prolificPid);
      localStorage.setItem("STUDY_ID", studyId ?? "");
      localStorage.setItem("SESSION_ID", sessionId ?? "");
    }
  }, [searchParams]);

  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const consent = useGetConsentForExternalId(externalId);
  const hasConsented = consent?.consented === true;

  const participant = useGetParticipantByExternalId(externalId);
  const upsertParticipant = useUpsertParticipant();

  useEffect(() => {
    if (participant === null && externalId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreatingParticipant(true);
      upsertParticipant({ externalId, status: "pending" }).finally(() =>
        setIsCreatingParticipant(false),
      );
    }
  }, [participant, externalId, upsertParticipant]);

  const currentConversation = useGetConversationForExternalId(externalId);

  const isLoading =
    consent === undefined || participant === undefined || isCreatingParticipant;

  const handleGetStarted = () => {
    const pid = localStorage.getItem("PROLIFIC_PID");
    if (!pid) {
      toast.error(
        "No Participant ID found. Please access this study through Prolific.",
      );
      return;
    }

    const status = participant?.status;

    if (status === "completed" || status === "partial") {
      setStatusDialogOpen(true);
      return;
    }

    if (status === "opted_out") {
      setStatusDialogOpen(true);
      return;
    }

    if (status === "active" && currentConversation) {
      router.push(`/conversations/${currentConversation._id}`);
      return;
    }

    setDialogOpen(true);
  };

  const handleConsentConfirm = () => {
    setDialogOpen(false);
    router.push("/survey?type=pre");
  };

  const status = participant?.status;

  const renderStatusDialog = () => {
    if (status === "completed" || status === "partial") {
      return (
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>You have already completed the study</DialogTitle>
              <DialogDescription>
                You have already gone through the study. You can view your
                previous conversation below.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
              >
                Cancel
              </Button>
              {currentConversation && (
                <Button
                  onClick={() => {
                    setStatusDialogOpen(false);
                    router.push(`/conversations/${currentConversation._id}`);
                  }}
                >
                  View Conversation
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    if (status === "opted_out") {
      return (
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>You have opted out of this study</DialogTitle>
              <DialogDescription>
                You previously chose to exit this study and are no longer able
                to participate. You can view the debriefing information below.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setStatusDialogOpen(false);
                  router.push("/debriefing");
                }}
              >
                View Debriefing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
  };

  return (
    <>
      {externalId && !isLoading && !hasConsented && <ConsentDialog />}

      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConsentConfirm}
      />

      {renderStatusDialog()}

      <div className="flex items-start justify-center h-full pt-[32vh]">
        <div className="w-full max-w-md px-4 space-y-8 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Logo size={40} />
            </div>
            <p className="text-lg text-muted-foreground">
              Challenge yourself to persuade an AI
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleGetStarted}
            disabled={isLoading}
          >
            Get Started
          </Button>
        </div>
      </div>
    </>
  );
};

export default NewConversationView;
