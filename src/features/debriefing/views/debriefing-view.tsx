"use client";

import Link from "next/link";
import { DEBRIEFING_CONTENT } from "@/features/debriefing/constants/debriefing-content";
import { HeartHandshakeIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const generateCompletionCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

const DebriefingView = () => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    toast.success("Redirecting you back to your Prolific profile...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const code = generateCompletionCode();
    window.location.replace(
      `https://app.prolific.com/submissions/complete?cc=${code}`,
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="mb-8 sm:mb-12 space-y-3 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <HeartHandshakeIcon className="size-8 text-primary" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {DEBRIEFING_CONTENT.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {DEBRIEFING_CONTENT.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {DEBRIEFING_CONTENT.sections.map((section, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-4 sm:p-6 space-y-3"
            >
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                {section.heading}
              </h2>

              {section.paragraphs?.map((p, j) => (
                <p key={j} className="text-xs sm:text-sm text-muted-foreground">
                  {p}
                </p>
              ))}

              {section.bullets && (
                <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm text-muted-foreground">
                  {section.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}

              {section.contacts && (
                <ul className="space-y-1 pl-2 text-xs sm:text-sm">
                  {section.contacts.map((c, j) => (
                    <li key={j}>
                      <span className="text-foreground font-medium">
                        {c.name}:
                      </span>{" "}
                      <Link
                        href={`mailto:${c.email}`}
                        className="underline text-foreground hover:text-primary transition-colors"
                      >
                        {c.email}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 sm:mt-6 flex flex-col items-center gap-6 mb-12">
          <Button
            size="lg"
            className="w-full sm:w-auto px-12 h-11 text-sm sm:text-base"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoaderIcon className="size-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            ) : (
              "Complete & Return to Prolific"
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            This study was conducted by Temple University&apos;s College of
            Science and Technology. Protocol Number: 32995.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebriefingView;
