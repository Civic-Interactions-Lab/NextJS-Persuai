"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderIcon } from "lucide-react";
import { useSubmitConsent } from "@/features/conversation/hooks/use-consents";
import Link from "next/link";
import { CONSENT_CONTENT } from "@/features/conversation/constants/consent-content";

const ConsentDialog = () => {
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const submitConsent = useSubmitConsent();

  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    if (isAtBottom) setHasScrolledToEnd(true);
  };

  const handleConfirm = async () => {
    if (!checked) {
      setAlertOpen(true);
      return;
    }
    if (!externalId) return;
    setSubmitting(true);
    await submitConsent({ externalId, consented: true });
    setSubmitting(false);
  };

  const handleDecline = () => {
    window.location.href = "https://app.prolific.com/";
  };

  return (
    <>
      <Dialog open modal>
        <DialogContent
          className="max-w-xl! h-[80vh] flex flex-col overflow-hidden [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {CONSENT_CONTENT.title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {CONSENT_CONTENT.subtitle}
            </p>
          </DialogHeader>

          <ScrollArea
            className="flex-1 min-h-0"
            onScrollCapture={handleScroll}
            ref={scrollRef}
          >
            <div className="space-y-5 text-xs sm:text-sm text-muted-foreground pr-4">
              {CONSENT_CONTENT.sections.map((section, i) => (
                <section key={i} className="space-y-2">
                  <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                    {section.heading}
                  </h3>

                  {section.paragraphs?.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}

                  {section.bulletsLabel && <p>{section.bulletsLabel}</p>}

                  {section.bullets && (
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      {section.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {section.subsections && (
                    <ul className="space-y-2 pl-2">
                      {section.subsections.map((sub, j) => (
                        <li key={j}>
                          <span className="font-medium text-foreground">
                            {sub.label}
                          </span>{" "}
                          {sub.text}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.contacts && (
                    <ul className="space-y-1 pl-2">
                      {section.contacts.map((c, j) => (
                        <li key={j}>
                          <span className="text-foreground font-medium">
                            {c.name}:
                          </span>{" "}
                          <Link
                            href={`mailto:${c.email}`}
                            className="underline text-foreground"
                          >
                            {c.email}
                          </Link>
                          {c.phone && <span> · {c.phone}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </ScrollArea>

          <div>
            {!hasScrolledToEnd && (
              <p className="text-xs text-muted-foreground text-center pb-2">
                Please scroll to the end to continue
              </p>
            )}

            <div
              className={`rounded-md border p-4 transition-colors ${hasScrolledToEnd ? "border-primary/40 bg-primary/5" : "border-muted bg-muted/30 opacity-50"}`}
            >
              <label
                className={`flex items-start gap-3 ${hasScrolledToEnd ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(val) => setChecked(val === true)}
                  className="mt-0.5 shrink-0"
                  disabled={!hasScrolledToEnd}
                />
                <p className="font-semibold text-foreground text-xs sm:text-sm">
                  {CONSENT_CONTENT.consentStatement}
                </p>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t shrink-0">
              <Button
                className="w-full sm:w-auto px-8"
                onClick={handleConfirm}
                disabled={submitting || !hasScrolledToEnd}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <LoaderIcon className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You must consent to continue</AlertDialogTitle>
            <AlertDialogDescription>
              Please agree to the consent form to continue and participate in
              this study.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDecline}>
              Leave Study
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsentDialog;
