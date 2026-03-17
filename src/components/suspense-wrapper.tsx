"use client";

import React from "react";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";

export default function SuspenseWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
