"use client";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NewConversationDialog from "@/features/conversation/components/new-conversation-dialog";

const NewConversationView = () => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGetStarted = () => {
    setDialogOpen(true);
  };

  const handleConsentConfirm = () => {
    setDialogOpen(false);
    router.push("/survey");
  };

  return (
    <>
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
