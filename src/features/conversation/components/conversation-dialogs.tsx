"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// New Conversation Dialog
interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: NewConversationDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Start a New Session</DialogTitle>
        <DialogDescription>
          Before starting a new conversation, we need to collect some
          information through a brief survey. This helps us provide you with a
          better experience.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Continue to Survey</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// No Prolific Dialog
interface NoProlificDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NoProlificDialog = ({
  open,
  onOpenChange,
}: NoProlificDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Access via Prolific</DialogTitle>
        <DialogDescription>
          This study must be accessed through Prolific. Please return to
          Prolific and click the study link to participate.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            (window.location.href =
              process.env.NEXT_PUBLIC_PROLIFIC_URL ??
              "https://app.prolific.com")
          }
        >
          Go to Prolific
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Opted Out Dialog
interface OptedOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDebriefing: () => void;
}

export const OptedOutDialog = ({
  open,
  onOpenChange,
  onViewDebriefing,
}: OptedOutDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>You have opted out of this study</DialogTitle>
        <DialogDescription>
          You previously chose to exit this study and are no longer able to
          participate. You can view the debriefing information below.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onViewDebriefing}>
          View Debriefing
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Completed Study Dialog
interface CompletedStudyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewConversation?: () => void;
}

export const CompletedStudyDialog = ({
  open,
  onOpenChange,
  onViewConversation,
}: CompletedStudyDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>You have already completed the study</DialogTitle>
        <DialogDescription>
          You have already gone through the study. You can view your previous
          conversation below.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        {onViewConversation && (
          <Button onClick={onViewConversation}>View Conversation</Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
