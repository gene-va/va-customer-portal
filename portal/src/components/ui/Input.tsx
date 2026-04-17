import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-2 text-sm font-body font-medium text-va-text-secondary">{label}</label>}
      <input {...props} className={cn(
        "px-4 py-2.5 border rounded-card bg-va-surface-2/60 text-va-text font-body placeholder-va-text-muted transition-all duration-200",
        error ? "border-va-red focus:ring-2 focus:ring-va-red/30" : "border-va-border focus:ring-2 focus:ring-va-accent/30 focus:border-va-accent/60",
        className,
      )} />
      {error && <p className="mt-1 text-sm text-va-red">{error}</p>}
    </div>
  );
}
