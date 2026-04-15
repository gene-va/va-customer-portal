import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("bg-va-surface rounded-card border border-va-border p-6", className)}>{children}</div>;
}
