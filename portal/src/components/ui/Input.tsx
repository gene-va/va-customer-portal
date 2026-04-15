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
        "px-4 py-2.5 border rounded-card bg-va-surface text-va-text font-body placeholder-va-text-muted transition-all duration-300",
        error ? "border-va-red focus:ring-2 focus:ring-va-red/20" : "border-va-border focus:ring-2 focus:ring-va-navy/20 focus:border-va-navy",
        className,
      )} />
      {error && <p className="mt-1 text-sm text-va-red">{error}</p>}
    </div>
  );
}
