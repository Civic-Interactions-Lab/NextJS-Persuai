"use client";

import React from "react";
import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

export default function SuspenseWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
