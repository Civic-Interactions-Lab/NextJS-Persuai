"use client";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import NewConversationDialog from "@/features/conversation/components/new-conversation-dialog";
import ConsentDialog from "@/features/conversation/components/consent-dialog";
import { toast } from "sonner";
import { useGetConsentForExternalId } from "@/features/conversation/hooks/use-consents";

const NewConversationView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);

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
  const isLoading = consent === undefined;

  const handleGetStarted = () => {
    const pid = localStorage.getItem("PROLIFIC_PID");
    if (!pid) {
      toast.error(
        "No Participant ID found. Please access this study through Prolific.",
      );
      return;
    }
    setDialogOpen(true);
  };

  const handleConsentConfirm = () => {
    setDialogOpen(false);
    router.push("/survey?type=pre");
  };

  return (
    <>
      {externalId && !isLoading && !hasConsented && <ConsentDialog />}

      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConsentConfirm}
      />

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

          <Button size="lg" className="w-full" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
      </div>
    </>
  );
};

export default NewConversationView;
