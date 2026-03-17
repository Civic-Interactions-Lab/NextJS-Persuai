"use client";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConsentDialog from "@/features/conversation/components/consent-dialog";
import {
  NewConversationDialog,
  NoProlificDialog,
  CompletedStudyDialog,
  OptedOutDialog,
} from "@/features/conversation/components/conversation-dialogs";
import { useGetConsentForExternalId } from "@/features/conversation/hooks/use-consents";
import {
  useGetParticipantByExternalId,
  useUpsertParticipant,
} from "@/features/conversation/hooks/use-participants";
import { useGetConversationForExternalId } from "@/features/conversation/hooks/use-conversations";
import { Loader2Icon } from "lucide-react";

interface NewConversationViewProps {
  prolificPid?: string;
  studyId?: string;
  sessionId?: string;
}

const NewConversationView = ({
  prolificPid,
  studyId,
  sessionId,
}: NewConversationViewProps) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false);
  const [externalId, setExternalId] = useState<string | null>(null);

  useEffect(() => {
    if (prolificPid) {
      localStorage.setItem("PROLIFIC_PID", prolificPid);
      localStorage.setItem("STUDY_ID", studyId ?? "");
      localStorage.setItem("SESSION_ID", sessionId ?? "");
    }
  }, [prolificPid, studyId, sessionId]);

  useEffect(() => {
    setExternalId(localStorage.getItem("PROLIFIC_PID"));
  }, []);

  const consent = useGetConsentForExternalId(externalId);
  const hasConsented = consent?.consented === true;

  const participant = useGetParticipantByExternalId(externalId);
  const upsertParticipant = useUpsertParticipant();

  useEffect(() => {
    if (participant !== null || !externalId) return;
    let cancelled = false;
    const create = async () => {
      setIsCreatingParticipant(true);
      try {
        await upsertParticipant({ externalId, status: "pending" });
      } finally {
        if (!cancelled) setIsCreatingParticipant(false);
      }
    };
    create();
    return () => {
      cancelled = true;
    };
  }, [participant, externalId, upsertParticipant]);

  const currentConversation = useGetConversationForExternalId(externalId);

  const isLoading =
    !!externalId &&
    (consent === undefined ||
      participant === undefined ||
      isCreatingParticipant);

  const status = participant?.status;

  const handleGetStarted = () => {
    if (!externalId) {
      setStatusDialogOpen(true);
      return;
    }
    if (
      status === "completed" ||
      status === "partial" ||
      status === "opted_out"
    ) {
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

  const LandingContent = (
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
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2Icon className="size-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {!externalId ? (
        <>
          {LandingContent}
          <NoProlificDialog
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
          />
        </>
      ) : (
        <>
          {externalId &&
            consent !== undefined &&
            !hasConsented &&
            status === "pending" && <ConsentDialog externalId={externalId} />}

          <NewConversationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleConsentConfirm}
          />

          {(status === "completed" || status === "partial") && (
            <CompletedStudyDialog
              open={statusDialogOpen}
              onOpenChange={setStatusDialogOpen}
              onViewConversation={
                currentConversation
                  ? () => {
                      setStatusDialogOpen(false);
                      router.push(`/conversations/${currentConversation._id}`);
                    }
                  : undefined
              }
            />
          )}

          {status === "opted_out" && (
            <OptedOutDialog
              open={statusDialogOpen}
              onOpenChange={setStatusDialogOpen}
              onViewDebriefing={() => {
                setStatusDialogOpen(false);
                router.push("/debriefing");
              }}
            />
          )}

          {LandingContent}
        </>
      )}
    </>
  );
};

export default NewConversationView;
